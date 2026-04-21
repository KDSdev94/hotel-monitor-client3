# Local Push Relay

Relay ini dipakai kalau Anda belum mau upgrade Firebase ke Blaze. Laptop Anda akan bertindak sebagai pengirim push notification untuk staff.

## Cara kerja

1. Frontend menyimpan notifikasi personal ke collection `notifications`.
2. Browser/HP staff menyimpan token device ke collection `pushTokens`.
3. Script lokal ini membaca notifikasi baru dari Firestore.
4. Script mengirim FCM ke token milik staff yang dituju.

## Kebutuhan

- Laptop harus tetap menyala.
- Script relay harus tetap berjalan.
- File service account Firebase harus tersedia di laptop Anda.

## Ambil service account JSON

1. Buka [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts?project=housekeeping-sytem)
2. Pilih atau buat service account untuk project `housekeeping-sytem`
3. Buat key baru dalam format JSON
4. Simpan file itu di luar repo, misalnya:

```powershell
D:\secure\housekeeping-sytem-service-account.json
```

## Jalankan relay

Dari PowerShell:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="D:\secure\housekeeping-sytem-service-account.json"
cd D:\WEBSITE\Firman\hotel-monitor\functions
npm run relay:push
```

Alternatif kalau mau pakai env buatan sendiri:

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_PATH="D:\secure\housekeeping-sytem-service-account.json"
cd D:\WEBSITE\Firman\hotel-monitor\functions
npm run relay:push
```

## Output yang normal

Kalau relay berhasil hidup, Anda akan lihat log seperti:

```text
[relay] local push relay started for project housekeeping-sytem
[relay] relayId=YOUR-PC-relay poll=10000ms limit=100
```

Saat ada notif baru:

```text
[relay] notif=abc123 sent=1 failed=0
```

## Alur tes

1. Deploy frontend Anda seperti biasa.
2. Login sebagai staff.
3. Klik tombol `Aktifkan notifikasi perangkat`.
4. Pastikan token device tersimpan di collection `pushTokens`.
5. Login sebagai admin.
6. Assign kamar ke staff tersebut.
7. Relay lokal akan membaca notification doc lalu mengirim push.

## Kalau belum masuk

- Pastikan relay masih jalan di laptop.
- Pastikan staff sudah mengizinkan notifikasi.
- Pastikan ada dokumen `pushTokens` untuk user staff itu.
- Pastikan device membuka domain yang sama dengan domain frontend hasil deploy.
- Untuk iPhone, tambahkan web app ke Home Screen lalu aktifkan notifikasi dari sana.
