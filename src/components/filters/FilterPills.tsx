
import React from 'react';
import { X } from 'lucide-react';
import { useFilterContext } from '@/context/FilterContext';

const FilterPills: React.FC = () => {
  const { activeFilters, removeFilter, clearFilters } = useFilterContext();

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {activeFilters.map((filter) => (
        <div 
          key={filter.id}
          className="flex items-center gap-1 px-2 py-1 text-sm bg-accent rounded-full"
        >
          <span>{filter.label}</span>
          <button 
            onClick={() => removeFilter(filter.id)} 
            className="p-0.5 rounded-full hover:bg-muted-foreground/20"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      
      {activeFilters.length > 1 && (
        <button 
          onClick={clearFilters}
          className="px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
        >
          Clear all
        </button>
      )}
    </div>
  );
};

export default FilterPills;
