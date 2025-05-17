import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format, addDays, differenceInDays } from 'date-fns';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { 
  Book as BookIcon, 
  Calendar, 
  AlertCircle, 
  ArrowUpRight,
  AlertTriangle,
  CheckCircle
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
}

const BorrowedBooks: React.FC = () => {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userData } = useAuth();
  
  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      if (!userData?.user_id) return;
      
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:3001/api/books/borrowed/${userData.user_id}`);
        setBorrowedBooks(response.data);
      } catch (error) {
        toast.error('Failed to fetch borrowed books');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBorrowedBooks();
  }, [userData?.user_id]);
  
  const getDaysRemaining = (returnDate: string) => {
    const today = new Date();
    const due = new Date(returnDate);
    return differenceInDays(due, today);
  };
  
  const getStatusBadge = (book: BorrowedBook) => {
    if (book.returned) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Returned
        </span>
      );
    }
    
    const daysRemaining = getDaysRemaining(book.return_date);
    
    if (daysRemaining < 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Overdue by {Math.abs(daysRemaining)} days
        </span>
      );
    }
    
    if (daysRemaining <= 3) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Due soon
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <Calendar className="h-3 w-3 mr-1" />
        {daysRemaining} days left
      </span>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Borrowed Books</h1>
          <p className="text-gray-600">Track your borrowed books and return dates</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : borrowedBooks.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Borrowed On</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {borrowedBooks.map(book => (
                    <tr key={book.ui_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BookIcon className="h-5 w-5 text-primary-600 mr-2" />
                          <span className="font-medium text-gray-900">{book.book_title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(book.issue_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(book.return_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(book)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {book.fine > 0 ? (
                          <span className="text-accent-600 font-medium">₹{book.fine}</span>
                        ) : (
                          <span className="text-green-600">No fine</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary-50 text-primary-600 rounded-full">
                <BookIcon className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Borrowed Books</h3>
            <p className="text-gray-600 mb-4">You haven't borrowed any books yet.</p>
            <button
              onClick={() => window.location.href = '/user/dashboard'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Browse Books
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowedBooks;