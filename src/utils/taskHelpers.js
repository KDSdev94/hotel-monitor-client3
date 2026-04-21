export const getTaskTypeFromRoomStatus = (status) => {
    switch ((status || '').toLowerCase()) {
        case 'dirty':
        case 'cleaning':
            return 'cleaning';
        case 'available':
            return 'checkin';
        case 'maintenance':
            return 'maintenance';
        default:
            return 'inspection';
    }
};

export const getTaskTypeLabel = (taskType) => {
    switch ((taskType || '').toLowerCase()) {
        case 'cleaning':
            return 'pembersihan kamar';
        case 'checkin':
            return 'persiapan check-in';
        case 'maintenance':
            return 'pengecekan maintenance';
        case 'inspection':
        default:
            return 'cek kamar';
    }
};

export const getTaskStatusLabel = (status) => {
    switch ((status || '').toLowerCase()) {
        case 'pending':
            return 'menunggu';
        case 'in_progress':
            return 'sedang dikerjakan';
        case 'completed':
            return 'selesai';
        default:
            return status || 'baru';
    }
};
