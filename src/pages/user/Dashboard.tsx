import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import BookCard from '../../components/BookCard';
import SearchBar from '../../components/SearchBar';
import { LibraryBig, Book as BookIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Book {
  book_id: number;
  book_title: string;
  author: string;
  edition: string;
  subject: string;
  no_of_copies: number;
  available_books: number;
}

const UserDashboard: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    author: '',
    onlyAvailable: false
  });
  const { userData } = useAuth();
  
  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/books');
      setBooks(response.data);
      setFilteredBooks(response.data);
    } catch (error) {
      toast.error('Failed to fetch books');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBooks();
  }, []);
  
  const handleSearch = (query: string, searchFilters: any) => {
    setSearchQuery(query);
    setFilters(searchFilters);
    
    let results = [...books];
    
    // Filter by search query
    if (query) {
      results = results.filter(book => 
        book.book_title.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply filters
    if (searchFilters.subject) {
      results = results.filter(book => 
        book.subject.toLowerCase().includes(searchFilters.subject.toLowerCase())
      );
    }
    
    if (searchFilters.author) {
      results = results.filter(book => 
        book.author.toLowerCase().includes(searchFilters.author.toLowerCase())
      );
    }
    
    if (searchFilters.onlyAvailable) {
      results = results.filter(book => book.available_books > 0);
    }
    
    setFilteredBooks(results);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="University Library" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {userData?.name || 'Student'}</h1>
          <p className="text-gray-600">Find and request books from our extensive collection</p>
        </div>
        
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredBooks.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <BookIcon className="h-5 w-5 mr-2 text-primary-600" />
                {searchQuery || Object.values(filters).some(filter => filter) 
                  ? 'Search Results' 
                  : 'Available Books'}
              </h2>
              <span className="text-sm text-gray-600">{filteredBooks.length} books found</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBooks.map(book => (
                <BookCard 
                  key={book.book_id} 
                  book={book} 
                  refreshBooks={fetchBooks}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow p-6 text-center">
            <LibraryBig className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-1">No books found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || Object.values(filters).some(filter => filter)
                ? 'Try adjusting your search or filters'
                : 'No books are currently available in the library'}
            </p>
            {(searchQuery || Object.values(filters).some(filter => filter)) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({
                    subject: '',
                    author: '',
                    onlyAvailable: false
                  });
                  setFilteredBooks(books);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;