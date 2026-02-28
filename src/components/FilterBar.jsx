const FilterBar = ({
    currentFilter,
    onFilterChange,
    filters,
    onSortChange,
    sortOptions,
    viewMode,
    onViewChange
}) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/90 dark:bg-surface-darker/90 p-2 rounded-xl border border-gray-100 dark:border-white/5 sticky top-20 z-40 shadow-xl backdrop-blur-md transition-colors duration-300 mb-6">
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${currentFilter === filter.id
                            ? 'bg-primary text-black shadow-lg shadow-primary/20'
                            : 'bg-gray-100 dark:bg-surface-dark hover:bg-gray-200 dark:hover:bg-[#3a3a3a] text-gray-600 dark:text-gray-300 border border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        {filter.color && (
                            <span className={`w-2 h-2 rounded-full ${filter.color}`}></span>
                        )}
                        <span>{filter.label}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${currentFilter === filter.id
                            ? 'bg-black/10 text-black font-extrabold'
                            : 'bg-gray-200 dark:bg-black/20 text-gray-500 dark:text-gray-400 font-bold'
                            }`}>
                            {filter.count}
                        </span>
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 border-gray-200 dark:border-gray-700 pt-2 sm:pt-0">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest mr-1">Sort by:</span>
                <select
                    onChange={(e) => onSortChange(e.target.value)}
                    className="bg-gray-100 dark:bg-surface-dark text-gray-900 dark:text-white text-xs font-bold border-none rounded-lg focus:ring-1 focus:ring-primary py-1.5 pl-3 pr-8 cursor-pointer outline-none"
                >
                    {sortOptions.map(opt => {
                        const val = typeof opt === 'object' ? opt.value : opt;
                        const label = typeof opt === 'object' ? opt.label : opt;
                        return (
                            <option key={val} value={val}>{label}</option>
                        );
                    })}
                </select>

                <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1"></div>

                <div className="flex gap-1">
                    <button
                        onClick={() => onViewChange('grid')}
                        className={`p-1.5 rounded transition-all ${viewMode === 'grid'
                            ? 'bg-primary text-black shadow-md'
                            : 'text-gray-400 bg-gray-100 dark:bg-surface-dark hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">grid_view</span>
                    </button>
                    <button
                        onClick={() => onViewChange('list')}
                        className={`p-1.5 rounded transition-all ${viewMode === 'list'
                            ? 'bg-primary text-black shadow-md'
                            : 'text-gray-400 bg-gray-100 dark:bg-surface-dark hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">list</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
