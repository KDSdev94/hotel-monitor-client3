import { collection, query, getDocs, where, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export const subscribeToRoomStats = (callback) => {
    return onSnapshot(collection(db, "rooms"), (snapshot) => {
        const rooms = snapshot.docs.map(doc => doc.data());
        const stats = {
            total: rooms.length,
            available: rooms.filter(r => r.status === 'available').length,
            occupied: rooms.filter(r => r.status === 'occupied').length,
            cleaning: rooms.filter(r => r.status === 'cleaning').length,
            dirty: rooms.filter(r => r.status === 'dirty').length,
            maintenance: rooms.filter(r => r.status === 'maintenance').length,
        };
        callback(stats);
    });
};

export const subscribeToStaffPerformance = (callback) => {
    let staffList = [];
    let taskList = [];

    const notify = () => {
        if (!staffList.length) return;

        const performance = staffList.map(s => {
            // Find tasks assigned to this staff (matching by assignedStaffId which could be UID or Staff Document ID)
            const staffTasks = taskList.filter(t =>
                (t.assignedStaffId && (t.assignedStaffId === s.uid || t.assignedStaffId === s.id)) ||
                (t.staffId && t.staffId === s.id)
            );
            const completedTasks = staffTasks.filter(t => t.status === 'completed');

            // Calculate average time (Completed - Started, or Completed - Created as fallback)
            let totalMins = 0;
            let timedTasksCount = 0;
            completedTasks.forEach(t => {
                const start = t.startedAt || t.createdAt;
                const end = t.completedAt;

                if (start && end) {
                    const diff = (end.toDate() - start.toDate()) / (1000 * 60);
                    if (diff > 0 && diff < 1440) { // Filter out unrealistic data (>24h)
                        totalMins += diff;
                        timedTasksCount++;
                    }
                }
            });

            const avgTime = timedTasksCount > 0 ? Math.round(totalMins / timedTasksCount) : 0;

            // Efficiency score logic: ratio of completed tasks to total assigned, 
            // weighted by having at least some tasks done.
            const baseScore = staffTasks.length > 0 ? (completedTasks.length / staffTasks.length) * 10 : 0;
            const finalScore = Math.min(10, Number(baseScore.toFixed(1)));

            return {
                name: s.name,
                id: s.employeeId || `#ST-${s.id.slice(0, 3).toUpperCase()}`,
                rooms: completedTasks.length,
                time: `${avgTime} mins`,
                score: finalScore || 0,
                status: s.status || (s.isActive ? 'On Duty' : 'Offline'),
                avatar: s.avatar || s.photoURL || ''
            };
        });

        // Sort by rooms cleaned (descending)
        performance.sort((a, b) => b.rooms - a.rooms);
        callback(performance);
    };

    const unsubStaff = onSnapshot(collection(db, "staff"), (snap) => {
        staffList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        notify();
    });

    const unsubTasks = onSnapshot(collection(db, "tasks"), (snap) => {
        taskList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        notify();
    });

    return () => {
        unsubStaff();
        unsubTasks();
    };
};

export const subscribeToOccupancyTrends = (callback) => {
    return onSnapshot(collection(db, "occupancy_history"), (snapshot) => {
        if (snapshot.empty) {
            callback(null); // Will show "No Data" or empty state
            return;
        }

        const history = snapshot.docs.map(doc => doc.data());
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        // Only return chart data if we actually have these records
        const hasData = history.some(h => h.period === 'this_week');

        if (!hasData) {
            callback(null);
            return;
        }

        const thisWeek = days.map(day => {
            const record = history.find(h => h.day === day && h.period === 'this_week');
            return record ? record.value : 0;
        });
        const lastWeek = days.map(day => {
            const record = history.find(h => h.day === day && h.period === 'last_week');
            return record ? record.value : 0;
        });

        callback({
            labels: days,
            datasets: [
                {
                    label: 'This Week',
                    data: thisWeek,
                    backgroundColor: '#f4c025',
                    borderRadius: 4,
                    barThickness: 12,
                },
                {
                    label: 'Last Week',
                    data: lastWeek,
                    backgroundColor: 'rgba(107, 114, 128, 0.3)',
                    borderRadius: 4,
                    barThickness: 12,
                },
            ],
        });
    });
};

// Utility to purge mock data - call this to clear the "susah dihapus" data
import { deleteDoc, doc } from "firebase/firestore";
export const purgeOccupancyHistory = async () => {
    const q = query(collection(db, "occupancy_history"));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, "occupancy_history", d.id)));
    await Promise.all(deletePromises);
    console.log("Occupancy history purged.");
};


