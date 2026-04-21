/* eslint-env node */
const fs = require("fs");
const os = require("os");
const path = require("path");
const admin = require("firebase-admin");

const PROJECT_ID = "housekeeping-sytem";
const RELAY_ID = process.env.PUSH_RELAY_ID || `${os.hostname()}-relay`;
const POLL_INTERVAL_MS = Number(process.env.PUSH_RELAY_POLL_MS || 10000);
const NOTIFICATION_LIMIT = Number(process.env.PUSH_RELAY_LIMIT || 100);
const MAX_NOTIFICATION_AGE_MINUTES = Number(process.env.PUSH_RELAY_MAX_AGE_MINUTES || 1440);

const inFlight = new Set();
let scanRunning = false;

function loadCredential() {
  const explicitPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (explicitPath) {
    const resolvedPath = path.resolve(explicitPath);
    const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
    return admin.credential.cert(serviceAccount);
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.credential.applicationDefault();
  }

  throw new Error(
      "Service account belum diset. Isi GOOGLE_APPLICATION_CREDENTIALS " +
      "atau FIREBASE_SERVICE_ACCOUNT_PATH terlebih dahulu.",
  );
}

admin.initializeApp({
  credential: loadCredential(),
  projectId: PROJECT_ID,
});

const db = admin.firestore();
const messaging = admin.messaging();

function isFreshEnough(notification) {
  const createdAt = notification.createdAt?.toDate?.() || null;
  if (!createdAt) return true;

  const ageMs = Date.now() - createdAt.getTime();
  return ageMs <= MAX_NOTIFICATION_AGE_MINUTES * 60 * 1000;
}

async function listActiveTokens(uid) {
  const snapshot = await db
      .collection("pushTokens")
      .where("uid", "==", uid)
      .where("enabled", "==", true)
      .get();

  return snapshot.docs.map((docSnap) => ({
    token: docSnap.id,
    ref: docSnap.ref,
    data: docSnap.data(),
  }));
}

async function markAttempt(docRef, payload) {
  await docRef.set({
    pushRelay: {
      relayId: RELAY_ID,
      ...payload,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  }, {merge: true});
}

async function deleteInvalidTokens(tokenDocs, response) {
  const invalidRefs = [];

  response.responses.forEach((result, index) => {
    if (!result.success) {
      const code = result.error?.code || "";
      if (
        code === "messaging/invalid-registration-token" ||
        code === "messaging/registration-token-not-registered"
      ) {
        invalidRefs.push(tokenDocs[index]?.ref);
      }
    }
  });

  if (invalidRefs.length === 0) return;

  const batch = db.batch();
  invalidRefs.forEach((ref) => {
    if (ref) batch.delete(ref);
  });
  await batch.commit();
}

async function sendPushForNotification(docSnap) {
  const notificationId = docSnap.id;
  if (inFlight.has(notificationId)) return;

  inFlight.add(notificationId);

  try {
    const notification = docSnap.data();

    if (
      notification.audience !== "user" ||
      !notification.recipientUid ||
      notification.pushRelay?.sentAt ||
      !isFreshEnough(notification)
    ) {
      return;
    }

    const tokenDocs = await listActiveTokens(notification.recipientUid);

    if (tokenDocs.length === 0) {
      await markAttempt(docSnap.ref, {
        status: "no_tokens",
        lastAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
        attempts: Number(notification.pushRelay?.attempts || 0) + 1,
        lastError: "No active push token for recipient",
      });
      console.log(`[relay] no token for uid=${notification.recipientUid} notif=${notificationId}`);
      return;
    }

    const tokens = tokenDocs.map((entry) => entry.token);
    const message = {
      notification: {
        title: notification.title || "Notifikasi baru",
        body: notification.description || "Ada update baru untuk Anda.",
      },
      data: {
        notificationId,
        title: notification.title || "Notifikasi baru",
        body: notification.description || "Ada update baru untuk Anda.",
        link: notification.actionUrl || "/staff/tasks",
      },
      webpush: {
        notification: {
          title: notification.title || "Notifikasi baru",
          body: notification.description || "Ada update baru untuk Anda.",
          icon: "/vite.svg",
          badge: "/vite.svg",
        },
        fcmOptions: {
          link: notification.actionUrl || "/staff/tasks",
        },
      },
      tokens,
    };

    const response = await messaging.sendEachForMulticast(message);
    await deleteInvalidTokens(tokenDocs, response);

    const payload = {
      status: response.successCount > 0 ? "sent" : "failed",
      lastAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
      attempts: Number(notification.pushRelay?.attempts || 0) + 1,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };

    if (response.successCount > 0) {
      payload.sentAt = admin.firestore.FieldValue.serverTimestamp();
    }

    const firstFailure = response.responses.find((result) => !result.success);
    if (firstFailure) {
      payload.lastError = firstFailure.error?.message || "Unknown push error";
    }

    await markAttempt(docSnap.ref, payload);

    console.log(
        `[relay] notif=${notificationId} sent=${response.successCount} failed=${response.failureCount}`,
    );
  } catch (error) {
    await markAttempt(docSnap.ref, {
      status: "failed",
      lastAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
      lastError: error.message || String(error),
    });
    console.error(`[relay] failed notif=${notificationId}`, error);
  } finally {
    inFlight.delete(notificationId);
  }
}

async function scanRecentNotifications() {
  if (scanRunning) return;
  scanRunning = true;

  try {
    const snapshot = await db
        .collection("notifications")
        .orderBy("createdAt", "desc")
        .limit(NOTIFICATION_LIMIT)
        .get();

    for (const docSnap of snapshot.docs) {
      await sendPushForNotification(docSnap);
    }
  } catch (error) {
    console.error("[relay] scan failed", error);
  } finally {
    scanRunning = false;
  }
}

console.log(`[relay] local push relay started for project ${PROJECT_ID}`);
console.log(`[relay] relayId=${RELAY_ID} poll=${POLL_INTERVAL_MS}ms limit=${NOTIFICATION_LIMIT}`);

scanRecentNotifications();
const intervalId = setInterval(scanRecentNotifications, POLL_INTERVAL_MS);

process.on("SIGINT", () => {
  clearInterval(intervalId);
  console.log("[relay] stopped");
  process.exit(0);
});

process.on("SIGTERM", () => {
  clearInterval(intervalId);
  console.log("[relay] stopped");
  process.exit(0);
});
