const StatsCard = ({ title, value, trend, trendColor, subtitle }) => {
    return (
        <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-lg p-4 min-w-[140px] shadow-sm dark:shadow-none transition-colors duration-300">
            <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1 font-bold">{title}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display font-bold text-gray-900 dark:text-white">{value}</span>
                {trend && (
                    <span className={`text-xs ${trendColor} font-bold`}>{trend}</span>
                )}
                {subtitle && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{subtitle}</span>
                )}
            </div>
        </div>
    );
};

export default StatsCard;
