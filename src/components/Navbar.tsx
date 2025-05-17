import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Book, User, LogOut, Menu, X } from 'lucide-react';

interface NavbarProps {
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title = 'University Library' }) => {
  const { userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(userRole === 'admin' ? '/admin/login' : '/login');
  };

  return (
    <nav className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Book className="h-6 w-6" />
            <h1 className="text-xl font-bold">{title}</h1>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {userRole === 'user' && (
              <>
                <Link 
                  to="/user/dashboard" 
                  className="hover:text-primary-200 transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/user/borrowed" 
                  className="hover:text-primary-200 transition-colors"
                >
                  My Books
                </Link>
              </>
            )}
            
            {userRole === 'admin' && (
              <>
                <Link 
                  to="/admin/dashboard" 
                  className="hover:text-primary-200 transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/admin/books" 
                  className="hover:text-primary-200 transition-colors"
                >
                  Books
                </Link>
                <Link 
                  to="/admin/users" 
                  className="hover:text-primary-200 transition-colors"
                >
                  Users
                </Link>
                <Link 
                  to="/admin/requests" 
                  className="hover:text-primary-200 transition-colors"
                >
                  Requests
                </Link>
                <Link 
                  to="/admin/returns" 
                  className="hover:text-primary-200 transition-colors"
                >
                  Returns
                </Link>
              </>
            )}
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-white hover:text-primary-200 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-2 animate-fade-in">
            {userRole === 'user' && (
              <>
                <Link 
                  to="/user/dashboard" 
                  className="block py-2 hover:bg-primary-700 px-2 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/user/borrowed" 
                  className="block py-2 hover:bg-primary-700 px-2 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Books
                </Link>
              </>
            )}
            
            {userRole === 'admin' && (
              <>
                <Link 
                  to="/admin/dashboard" 
                  className="block py-2 hover:bg-primary-700 px-2 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/admin/books" 
                  className="block py-2 hover:bg-primary-700 px-2 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Books
                </Link>
                <Link 
                  to="/admin/users" 
                  className="block py-2 hover:bg-primary-700 px-2 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Users
                </Link>
                <Link 
                  to="/admin/requests" 
                  className="block py-2 hover:bg-primary-700 px-2 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Requests
                </Link>
                <Link 
                  to="/admin/returns" 
                  className="block py-2 hover:bg-primary-700 px-2 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Returns
                </Link>
              </>
            )}
            
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-1 py-2 text-white hover:bg-primary-700 px-2 rounded w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;