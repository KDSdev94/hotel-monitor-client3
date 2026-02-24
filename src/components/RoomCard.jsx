import { useTranslation } from 'react-i18next';

const RoomCard = ({ room, onClick }) => {
    const { t } = useTranslation();
    const { number, type, status, lastCleaned, isVip, staff, timeLeft, progress, issue, ticket, imageURL } = room;

    const statusConfig = {
        available: {
            borderColor: 'border-status-ready',
            icon: 'check_circle',
            iconColor: 'text-status-ready',
            labelColor: 'bg-status-ready/10 text-status-ready',
            label: t('common.available'),
        },
        occupied: {
            borderColor: 'border-primary',
            icon: 'person',
            iconColor: 'text-primary',
            labelColor: 'bg-primary/10 text-primary',
            label: t('common.occupied', { defaultValue: 'Occupied' }),
        },
        dirty: {
            borderColor: 'border-status-dirty',
            icon: 'cleaning_services',
            iconColor: 'text-status-dirty',
            labelColor: 'bg-status-dirty/10 text-status-dirty',
            label: t('common.dirty'),
        },
        cleaning: {
            borderColor: 'border-status-cleaning',
            icon: 'hourglass_top',
            iconColor: 'text-status-cleaning',
            labelColor: 'bg-status-cleaning/10 text-status-cleaning',
            label: t('common.cleaning'),
            animateIcon: true,
        },
        maintenance: {
            borderColor: 'border-gray-500',
            icon: 'build',
            iconColor: 'text-gray-500',
            labelColor: 'bg-gray-500/10 text-gray-500',
            label: t('common.maintenance'),
            grayscale: true,
        },
    };

    const config = statusConfig[status] || statusConfig.available;

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onClick && onClick(room);
            }}
            className={`group relative bg-white dark:bg-surface-dark rounded-xl overflow-hidden border-l-4 ${config.borderColor} hover:bg-gray-50 dark:hover:bg-[#333] transition-all cursor-pointer shadow-md dark:shadow-lg hover:shadow-2xl hover:-translate-y-1 ${config.grayscale ? 'grayscale' : ''} ${isVip ? 'ring-2 ring-primary/20' : ''} transition-colors duration-300`}
        >

            {/* Room Image Header */}
            <div className="h-28 w-full relative overflow-hidden bg-gray-100 dark:bg-white/5">
                {imageURL ? (
                    <img src={imageURL} alt={`Room ${number}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/[0.02]">
                        <span className="material-symbols-outlined text-gray-300 dark:text-gray-700 text-5xl">bed</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {isVip && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-primary/30">
                        <span className="material-symbols-outlined text-primary text-[16px] drop-shadow-md" title="VIP Guest">star</span>
                        <span className="text-primary text-[9px] font-black uppercase tracking-widest">VIP</span>
                    </div>
                )}

                <div className="absolute bottom-3 left-4 flex flex-col">
                    <span className="text-4xl font-display font-black text-white tracking-widest drop-shadow-lg">
                        {number}
                    </span>
                </div>

                <div className="absolute top-3 right-3">
                    <div className={`w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10`}>
                        <span className={`material-symbols-outlined text-white text-[18px] ${config.animateIcon ? 'animate-pulse' : ''}`} title={config.label}>
                            {config.icon}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-5 pt-4">

                <div className="space-y-2">
                    {type ? (
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Type</span>
                            <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">{type}</span>
                        </div>
                    ) : null}

                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Status</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${config.labelColor}`}>
                            {config.label}
                        </span>
                    </div>

                    {staff && (
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Staff</span>
                            <div className="flex items-center gap-1.5">
                                <div
                                    className="w-4 h-4 rounded-full bg-cover bg-center border border-gray-200 dark:border-white/10"
                                    style={{ backgroundImage: `url(${staff.avatar})` }}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-200 font-bold">{staff.name}</span>
                            </div>
                        </div>
                    )}

                    {timeLeft && (
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Time</span>
                            <span className="text-sm text-status-cleaning font-black">{timeLeft} {t('common.left', { defaultValue: 'left' })}</span>
                        </div>
                    )}

                    {issue && (
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">Issue</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{issue}</span>
                        </div>
                    )}
                </div>

                {progress !== undefined && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-status-cleaning h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                )}

                {status === 'dirty' && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <button className="text-[10px] text-white font-extrabold bg-primary hover:bg-primary-dark tracking-widest uppercase px-3 py-1.5 rounded shadow-sm hover:shadow-md transition-all w-full text-center">
                            Assign Team
                        </button>
                    </div>
                )}

                {status === 'available' && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 opacity-60">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider italic">No Active Schedule</span>
                    </div>
                )}

                {status === 'occupied' && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-gray-400">
                        <span className="material-symbols-outlined text-[16px]" title="Do Not Disturb">do_not_disturb_on</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest">In Use</span>
                    </div>
                )}

                {status === 'maintenance' && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 opacity-60">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider italic">Under Repair</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomCard;
