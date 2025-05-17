import React, { useState } from 'react';
import { Search, BookOpen, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, filters: any) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    author: '',
    onlyAvailable: false
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, filters);
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };
  
  const clearFilters = () => {
    setFilters({
      subject: '',
      author: '',
      onlyAvailable: false
    });
    
    if (query) {
      onSearch(query, {
        subject: '',
        author: '',
        onlyAvailable: false
      });
    }
  };
  
  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      <form onSubmit={handleSearch} className="flex flex-col">
        <div className="flex items-center px-4 py-2">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for books by title..."
            className="w-full ml-2 outline-none text-gray-700"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center text-sm text-primary-600 hover:text-primary-800"
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Filters
          </button>
        </div>
        
        {isFilterOpen && (
          <div className="px-4 py-3 border-t border-gray-200 animate-slide-in">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">Filter Options</h3>
              <button 
                type="button"
                onClick={clearFilters}
                className="text-xs text-accent-600 hover:text-accent-800 flex items-center"
              >
                <X className="h-3 w-3 mr-1" />
                Clear filters
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label htmlFor="subject" className="block text-xs font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="e.g. Computer Science"
                />
              </div>
              
              <div>
                <label htmlFor="author" className="block text-xs font-medium text-gray-700 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={filters.author}
                  onChange={handleFilterChange}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="e.g. John Smith"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="onlyAvailable"
                  name="onlyAvailable"
                  checked={filters.onlyAvailable}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
                <label htmlFor="onlyAvailable" className="ml-2 text-xs font-medium text-gray-700">
                  Show only available books
                </label>
              </div>
            </div>
          </div>
        )}
        
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex justify-end rounded-b-lg">
          <button
            type="submit"
            className="px-4 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;