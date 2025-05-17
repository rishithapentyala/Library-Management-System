import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  X,
  FileText
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

const ManageBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  
  const [newBook, setNewBook] = useState({
    book_title: '',
    author: '',
    edition: '',
    subject: '',
    no_of_copies: 1
  });
  
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
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredBooks(books);
      return;
    }
    
    const filtered = books.filter(book => 
      book.book_title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase()) ||
      book.subject.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredBooks(filtered);
  };
  
  const handleAddBook = async () => {
    try {
      await axios.post('http://localhost:3001/api/books', newBook);
      toast.success('Book added successfully');
      setShowAddModal(false);
      setNewBook({
        book_title: '',
        author: '',
        edition: '',
        subject: '',
        no_of_copies: 1
      });
      fetchBooks();
    } catch (error) {
      toast.error('Failed to add book');
    }
  };
  
  const handleUpdateBook = async () => {
    if (!editingBook) return;
    
    try {
      await axios.put(`http://localhost:3001/api/books/${editingBook.book_id}`, editingBook);
      toast.success('Book updated successfully');
      setEditingBook(null);
      fetchBooks();
    } catch (error) {
      toast.error('Failed to update book');
    }
  };
  
  const handleDeleteBook = async (bookId: number) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    
    try {
      await axios.delete(`http://localhost:3001/api/books/${bookId}`);
      toast.success('Book deleted successfully');
      fetchBooks();
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <BookOpen className="h-6 w-6 mr-2 text-primary-600" />
              Manage Books
            </h1>
            <p className="text-gray-600">Add, update, or remove books from the library</p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 md:mt-0 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New Book
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search books by title, author, or subject..."
              className="w-full outline-none text-gray-700"
              value={searchQuery}
              onChange={handleSearch}
            />
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
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Edition</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Copies</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBooks.map(book => (
                    <tr key={book.book_id} className="hover:bg-gray-50">
                      {editingBook && editingBook.book_id === book.book_id ? (
                        // Editing mode
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={editingBook.book_title}
                              onChange={(e) => setEditingBook({...editingBook, book_title: e.target.value})}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={editingBook.author}
                              onChange={(e) => setEditingBook({...editingBook, author: e.target.value})}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={editingBook.subject}
                              onChange={(e) => setEditingBook({...editingBook, subject: e.target.value})}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={editingBook.edition}
                              onChange={(e) => setEditingBook({...editingBook, edition: e.target.value})}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="1"
                              value={editingBook.no_of_copies}
                              onChange={(e) => setEditingBook({...editingBook, no_of_copies: parseInt(e.target.value)})}
                              className="w-20 px-2 py-1 border border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {editingBook.available_books}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                onClick={handleUpdateBook}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Save className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => setEditingBook(null)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // View mode
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-primary-600 mr-2" />
                              <span className="font-medium text-gray-900">{book.book_title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.author}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.subject}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.edition}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.no_of_copies}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                book.available_books === 0 
                                  ? 'bg-accent-100 text-accent-800' 
                                  : book.available_books < book.no_of_copies / 2 
                                    ? 'bg-warning-100 text-warning-800' 
                                    : 'bg-secondary-100 text-secondary-800'
                              }`}
                            >
                              {book.available_books}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingBook(book)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteBook(book.book_id)}
                                className="text-accent-600 hover:text-accent-900"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Books Found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? `No books match your search "${searchQuery}"` 
                : 'The library catalog is currently empty'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full animate-fade-in">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Add New Book</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Book Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newBook.book_title}
                  onChange={(e) => setNewBook({...newBook, book_title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  id="author"
                  value={newBook.author}
                  onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={newBook.subject}
                  onChange={(e) => setNewBook({...newBook, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="edition" className="block text-sm font-medium text-gray-700 mb-1">
                  Edition
                </label>
                <input
                  type="text"
                  id="edition"
                  value={newBook.edition}
                  onChange={(e) => setNewBook({...newBook, edition: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="copies" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Copies
                </label>
                <input
                  type="number"
                  id="copies"
                  min="1"
                  value={newBook.no_of_copies}
                  onChange={(e) => setNewBook({...newBook, no_of_copies: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-3"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBook}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBooks;