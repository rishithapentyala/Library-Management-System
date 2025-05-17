import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Navbar from '../../components/Navbar';
import { 
  RotateCcw, 
  User, 
  BookOpen, 
  Calendar, 
  CheckCircle,
  Filter,
  DollarSign
} from 'lucide-react';

interface BorrowedBook {
  ui_id: number;
  user_id: number;
  book_id: number;
  book_title: string;
  issue_date: string;
  return_date: string;
  fine: number;
  returned: boolean;
  user_name: string;
  user_email: string;
}

const TrackReturns: React.FC = () => {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BorrowedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'returned' | 'not-returned'>('not-returned');
  
  const fetchBorrowedBooks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/admin/borrowed-books');
      setBorrowedBooks(response.data);
      filterBooks(response.data, filter);
    } catch (error) {
      toast.error('Failed to fetch borrowed books');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBorrowedBooks();
  }, []);
  
  const filterBooks = (booksList: BorrowedBook[], filterType: 'all' | 'returned' | 'not-returned') => {
    switch (filterType) {
      case 'returned':
        setFilteredBooks(booksList.filter(book => book.returned));
        break;
      case 'not-returned':
        setFilteredBooks(booksList.filter(book => !book.returned));
        break;
      default:
        setFilteredBooks(booksList);
    }
  };
  
  const handleFilterChange = (newFilter: 'all' | 'returned' | 'not-returned') => {
    setFilter(newFilter);
    filterBooks(borrowedBooks, newFilter);
  };
  
  const handleMarkAsReturned = async (uiId: number) => {
    try {
      await axios.put(`http://localhost:3001/api/admin/returns/${uiId}/mark-returned`);
      toast.success('Book marked as returned successfully');
      fetchBorrowedBooks();
    } catch (error) {
      toast.error('Failed to update return status');
    }
  };
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  };
  
  // Check if the book is overdue
  const isOverdue = (returnDate: string) => {
    const today = new Date();
    const due = new Date(returnDate);
    return today > due;
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <RotateCcw className="h-6 w-6 mr-2 text-primary-600" />
            Track Returns
          </h1>
          <p className="text-gray-600">Manage book returns and calculate fines</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-700 mr-4">Filter:</span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-3 py-1 text-sm rounded-md ${
                  filter === 'all' 
                    ? 'bg-primary-100 text-primary-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Books
              </button>
              <button
                onClick={() => handleFilterChange('not-returned')}
                className={`px-3 py-1 text-sm rounded-md ${
                  filter === 'not-returned' 
                    ? 'bg-warning-100 text-warning-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Not Returned
              </button>
              <button
                onClick={() => handleFilterChange('returned')}
                className={`px-3 py-1 text-sm rounded-md ${
                  filter === 'returned' 
                    ? 'bg-secondary-100 text-secondary-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Returned
              </button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fine</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBooks.map(book => (
                    <tr key={book.ui_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{book.user_name}</div>
                            <div className="text-xs text-gray-500">{book.user_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">{book.book_title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(book.issue_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <span 
                            className={`text-sm ${!book.returned && isOverdue(book.return_date) ? 'text-accent-600 font-medium' : 'text-gray-500'}`}
                          >
                            {formatDate(book.return_date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          <span 
                            className={`text-sm ${book.fine > 0 ? 'text-accent-600 font-medium' : 'text-gray-500'}`}
                          >
                            ₹{book.fine}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {book.returned ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-secondary-100 text-secondary-800">
                            Returned
                          </span>
                        ) : isOverdue(book.return_date) ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-accent-100 text-accent-800">
                            Overdue
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-warning-100 text-warning-800">
                            Borrowed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {!book.returned && (
                          <button
                            onClick={() => handleMarkAsReturned(book.ui_id)}
                            className="bg-secondary-100 text-secondary-600 p-1.5 rounded-md hover:bg-secondary-200 flex items-center"
                            title="Mark as Returned"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs">Return</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="p-4 bg-gray-100 rounded-full inline-flex mx-auto mb-4">
              <RotateCcw className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Books Found</h3>
            <p className="text-gray-600">
              {filter === 'not-returned' 
                ? 'There are no books that need to be returned'
                : filter === 'returned'
                  ? 'No books have been returned yet'
                  : 'There are no borrowed books in the system'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => handleFilterChange('all')}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                View All Books
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackReturns;