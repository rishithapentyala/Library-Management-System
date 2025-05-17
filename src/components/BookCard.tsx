import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book as BookIcon, Info, BookOpenCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

interface BookProps {
  book: {
    book_id: number;
    book_title: string;
    author: string;
    edition: string;
    subject: string;
    available_books: number;
    no_of_copies: number;
  };
  refreshBooks?: () => void;
}

const BookCard: React.FC<BookProps> = ({ book, refreshBooks }) => {
  const { userRole, userData } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);
  
  const handleRequestBook = async () => {
    if (!userData?.user_id) {
      toast.error('You must be logged in to request books');
      return;
    }
    
    setIsRequesting(true);
    try {
      await axios.post('http://localhost:3001/api/books/request', {
        user_id: userData.user_id,
        book_id: book.book_id,
        book_title: book.book_title
      });
      
      toast.success('Book requested successfully');
      if (refreshBooks) refreshBooks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request book');
    } finally {
      setIsRequesting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg animate-fade-in">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{book.book_title}</h3>
            <p className="text-sm text-gray-600 mt-1">by {book.author}</p>
          </div>
          <div className="flex items-center justify-center bg-primary-100 text-primary-600 p-2 rounded-full">
            <BookIcon size={20} />
          </div>
        </div>
        
        <div className="mt-3 space-y-1">
          <p className="text-sm text-gray-700"><span className="font-medium">Subject:</span> {book.subject}</p>
          <p className="text-sm text-gray-700"><span className="font-medium">Edition:</span> {book.edition}</p>
          
          <div className="mt-2 flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">Availability:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  book.available_books === 0 
                    ? 'bg-accent-500' 
                    : book.available_books < book.no_of_copies / 3 
                      ? 'bg-warning-500' 
                      : 'bg-secondary-500'
                }`}
                style={{ width: `${(book.available_books / book.no_of_copies) * 100}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm font-medium">
              {book.available_books}/{book.no_of_copies}
            </span>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <Link 
            to={`/user/book/${book.book_id}`} 
            className="text-primary-600 hover:text-primary-800 text-sm flex items-center"
          >
            <Info size={16} className="mr-1" />
            View Details
          </Link>
          
          {userRole === 'user' && (
            <button
              disabled={book.available_books === 0 || isRequesting}
              onClick={handleRequestBook}
              className={`px-3 py-1.5 rounded text-sm flex items-center ${
                book.available_books === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              <BookOpenCheck size={16} className="mr-1" />
              {isRequesting ? 'Requesting...' : book.available_books === 0 ? 'Unavailable' : 'Request'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;