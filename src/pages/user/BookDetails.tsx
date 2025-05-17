import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { 
  Book as BookIcon, 
  Calendar, 
  User, 
  Tag, 
  ArrowLeft, 
  BookOpenCheck,
  AlertCircle
} from 'lucide-react';

interface Book {
  book_id: number;
  book_title: string;
  author: string;
  edition: string;
  subject: string;
  no_of_copies: number;
  available_books: number;
}

interface BookRequest {
  request_id: number;
  user_id: number;
  book_id: number;
  approve_status: boolean;
  book_title: string;
}

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [existingRequest, setExistingRequest] = useState<BookRequest | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  
  useEffect(() => {
    const fetchBookDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:3001/api/books/${id}`);
        setBook(response.data);
        
        // Check if user already has a request for this book
        if (userData?.user_id) {
          const requestsResponse = await axios.get(
            `http://localhost:3001/api/books/user-request/${userData.user_id}/${id}`
          );
          if (requestsResponse.data) {
            setExistingRequest(requestsResponse.data);
          }
        }
      } catch (error) {
        toast.error('Failed to fetch book details');
        navigate('/user/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookDetails();
  }, [id, navigate, userData?.user_id]);
  
  const handleRequestBook = async () => {
    if (!userData?.user_id || !book) {
      toast.error('You must be logged in to request books');
      return;
    }
    
    setIsRequesting(true);
    try {
      const response = await axios.post('http://localhost:3001/api/books/request', {
        user_id: userData.user_id,
        book_id: book.book_id,
        book_title: book.book_title
      });
      
      setExistingRequest(response.data);
      toast.success('Book requested successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request book');
    } finally {
      setIsRequesting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }
  
  if (!book) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <AlertCircle className="h-16 w-16 text-accent-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Book Not Found</h2>
            <p className="text-gray-600 mb-6">The book you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/user/dashboard')}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 flex items-center mx-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const requestStatus = existingRequest ? (
    existingRequest.approve_status 
      ? 'Approved' 
      : 'Pending Approval'
  ) : null;
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/user/dashboard')}
          className="flex items-center text-primary-600 hover:text-primary-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Books
        </button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-primary-600 p-6 text-white">
            <h1 className="text-2xl font-bold">{book.book_title}</h1>
            <p className="text-primary-100">by {book.author}</p>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-3/4 pr-0 md:pr-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-start">
                    <Tag className="h-5 w-5 mr-2 text-primary-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Subject</p>
                      <p className="font-medium">{book.subject}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <BookIcon className="h-5 w-5 mr-2 text-primary-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Edition</p>
                      <p className="font-medium">{book.edition}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-2 text-primary-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Availability</p>
                      <p className="font-medium">
                        {book.available_books} of {book.no_of_copies} copies available
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Book Description</h3>
                  <p className="text-gray-600">
                    This is a university textbook on {book.subject}, authored by {book.author}. 
                    The book is part of the university library collection and is available for 
                    borrowing by students. Edition: {book.edition}.
                  </p>
                </div>
              </div>
              
              <div className="w-full md:w-1/4 mt-6 md:mt-0 border-t md:border-t-0 md:border-l border-gray-200 pl-0 md:pl-8 pt-6 md:pt-0">
                <div className="bg-primary-50 p-4 rounded-lg mb-4">
                  <h3 className="text-base font-medium text-primary-800 mb-2">Borrowing Information</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start">
                      <span className="bg-primary-100 text-primary-800 p-1 rounded mr-2">•</span>
                      <span>Books can be borrowed for up to 30 days</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-primary-100 text-primary-800 p-1 rounded mr-2">•</span>
                      <span>Late returns incur a fine of ₹1 per day</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-primary-100 text-primary-800 p-1 rounded mr-2">•</span>
                      <span>Book requests must be approved by the librarian</span>
                    </li>
                  </ul>
                </div>
                
                {existingRequest ? (
                  <div
                    className={`p-4 rounded-lg ${
                      existingRequest.approve_status 
                        ? 'bg-secondary-100 text-secondary-800' 
                        : 'bg-warning-100 text-warning-800'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <BookOpenCheck className="h-5 w-5 mr-2" />
                      <h3 className="font-medium">Request {requestStatus}</h3>
                    </div>
                    <p className="text-sm">
                      {existingRequest.approve_status
                        ? 'Your request has been approved. You can collect the book from the library.'
                        : 'Your request is pending approval from the librarian.'}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleRequestBook}
                    disabled={book.available_books === 0 || isRequesting}
                    className={`w-full py-3 rounded-lg flex items-center justify-center ${
                      book.available_books === 0
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    <BookOpenCheck className="h-5 w-5 mr-2" />
                    {isRequesting 
                      ? 'Processing...' 
                      : book.available_books === 0 
                        ? 'Currently Unavailable' 
                        : 'Request This Book'}
                  </button>
                )}
                
                {book.available_books === 0 && !existingRequest && (
                  <div className="mt-4 text-xs text-center text-gray-500">
                    This book is currently unavailable. Check back later.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;