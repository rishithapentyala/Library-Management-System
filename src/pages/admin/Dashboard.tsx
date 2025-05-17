import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ClipboardList, 
  RotateCcw,
  ArrowUpRight
} from 'lucide-react';

interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  totalUsers: number;
  activeRequests: number;
  pendingReturns: number;
  totalFines: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    availableBooks: 0,
    totalUsers: 0,
    activeRequests: 0,
    pendingReturns: 0,
    totalFines: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { userData } = useAuth();
  
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:3001/api/admin/dashboard-stats');
        setStats(response.data);
      } catch (error) {
        toast.error('Failed to fetch dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);
  
  const statCards = [
    {
      title: 'Total Books',
      value: stats.totalBooks,
      description: `${stats.availableBooks} currently available`,
      icon: <BookOpen className="h-6 w-6 text-primary-600" />,
      link: '/admin/books',
      color: 'bg-blue-50'
    },
    {
      title: 'Registered Users',
      value: stats.totalUsers,
      description: 'University students',
      icon: <Users className="h-6 w-6 text-secondary-600" />,
      link: '/admin/users',
      color: 'bg-green-50'
    },
    {
      title: 'Book Requests',
      value: stats.activeRequests,
      description: 'Pending approval',
      icon: <ClipboardList className="h-6 w-6 text-warning-600" />,
      link: '/admin/requests',
      color: 'bg-yellow-50'
    },
    {
      title: 'Pending Returns',
      value: stats.pendingReturns,
      description: `₹${stats.totalFines} total fines`,
      icon: <RotateCcw className="h-6 w-6 text-accent-600" />,
      link: '/admin/returns',
      color: 'bg-red-50'
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <LayoutDashboard className="h-6 w-6 mr-2 text-primary-600" />
              Librarian Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, {userData?.name || 'Administrator'}</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow animate-fade-in"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                      <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                    </div>
                    <div className={`p-3 rounded-full ${card.color}`}>
                      {card.icon}
                    </div>
                  </div>
                  <a 
                    href={card.link}
                    className="mt-4 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800"
                  >
                    View Details
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Quick Actions</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a 
                href="/admin/books"
                className="bg-primary-50 hover:bg-primary-100 rounded-lg p-4 flex flex-col items-center text-center transition-colors"
              >
                <div className="p-3 bg-primary-100 rounded-full mb-3">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-medium text-gray-800">Manage Books</h3>
                <p className="text-xs text-gray-600 mt-1">Add, update, or remove books</p>
              </a>
              
              <a 
                href="/admin/requests"
                className="bg-warning-50 hover:bg-warning-100 rounded-lg p-4 flex flex-col items-center text-center transition-colors"
              >
                <div className="p-3 bg-warning-100 rounded-full mb-3">
                  <ClipboardList className="h-6 w-6 text-warning-600" />
                </div>
                <h3 className="font-medium text-gray-800">Approve Requests</h3>
                <p className="text-xs text-gray-600 mt-1">Review pending book requests</p>
              </a>
              
              <a 
                href="/admin/returns"
                className="bg-accent-50 hover:bg-accent-100 rounded-lg p-4 flex flex-col items-center text-center transition-colors"
              >
                <div className="p-3 bg-accent-100 rounded-full mb-3">
                  <RotateCcw className="h-6 w-6 text-accent-600" />
                </div>
                <h3 className="font-medium text-gray-800">Process Returns</h3>
                <p className="text-xs text-gray-600 mt-1">Handle book returns and fines</p>
              </a>
              
              <a 
                href="/admin/users"
                className="bg-secondary-50 hover:bg-secondary-100 rounded-lg p-4 flex flex-col items-center text-center transition-colors"
              >
                <div className="p-3 bg-secondary-100 rounded-full mb-3">
                  <Users className="h-6 w-6 text-secondary-600" />
                </div>
                <h3 className="font-medium text-gray-800">View Users</h3>
                <p className="text-xs text-gray-600 mt-1">Manage student accounts</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;