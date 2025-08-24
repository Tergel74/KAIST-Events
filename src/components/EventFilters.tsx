'use client';
import { useState } from 'react';
import { FiCalendar, FiTag, FiX } from 'react-icons/fi';

interface EventFiltersProps {
  onFilterChange: (filters: { dateRange: 'today' | 'week' | 'all'; category?: string }) => void;
}

const categories = [
  { id: 'social', name: 'Social', icon: '👥' },
  { id: 'academic', name: 'Academic', icon: '📚' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'workshop', name: 'Workshop', icon: '🔧' },
  { id: 'conference', name: 'Conference', icon: '🎤' },
  { id: 'other', name: 'Other', icon: '🎉' },
];

const dateRanges = [
  { id: 'today', name: 'Today' },
  { id: 'week', name: 'This Week' },
  { id: 'all', name: 'All Events' },
];

export default function EventFilters({ onFilterChange }: EventFiltersProps) {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const handleDateRangeChange = (range: 'today' | 'week' | 'all') => {
    setDateRange(range);
    onFilterChange({ dateRange: range, category: selectedCategory || undefined });
  };

  const handleCategoryChange = (categoryId: string) => {
    const newCategory = selectedCategory === categoryId ? '' : categoryId;
    setSelectedCategory(newCategory);
    onFilterChange({ dateRange, category: newCategory || undefined });
  };

  const clearFilters = () => {
    setDateRange('all');
    setSelectedCategory('');
    onFilterChange({ dateRange: 'all' });
  };

  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <div className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 cursor-pointer transition-colors">
              <FiCalendar className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {dateRanges.find(r => r.id === dateRange)?.name}
              </span>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {dateRanges.map((range) => (
                  <div
                    key={range.id}
                    onClick={() => handleDateRangeChange(range.id as 'today' | 'week' | 'all')}
                    className={`px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer ${
                      dateRange === range.id ? 'text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {range.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div 
              className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 cursor-pointer transition-colors"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              <FiTag className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {selectedCategoryName || 'All Categories'}
              </span>
            </div>
            
            {isCategoryOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10 p-2">
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => {
                        handleCategoryChange(category.id);
                        setIsCategoryOpen(false);
                      }}
                      className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer ${
                        selectedCategory === category.id 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(dateRange !== 'all' || selectedCategory) && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiX className="w-4 h-4" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {(dateRange !== 'all' || selectedCategory) && (
          <div className="flex flex-wrap items-center gap-2">
            {dateRange !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {dateRanges.find(r => r.id === dateRange)?.name}
                <button 
                  onClick={() => handleDateRangeChange('all')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-200 text-blue-800 hover:bg-blue-300"
                >
                  <FiX className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {selectedCategoryName}
                <button 
                  onClick={() => handleCategoryChange('')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-200 text-blue-800 hover:bg-blue-300"
                >
                  <FiX className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
