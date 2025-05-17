import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import { 
  ClipboardList, 
  CheckCircle, 
  XCircle, 
  User,
  BookOpen,
  Clock,
  Filter
} from 'lucide-react';

interface BookRequest {
  request_id: number;
  user_id: number;
  book_id: number;
  book_title: string;
  approve_status: boolean;
  user_name: string;
  user_email: string;
  created_at: string;
}

const ApproveRequests: React.FC = () => {
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BookRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  
  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/admin/requests');
      setRequests(response.data);
      filterRequests(response.data, filter);
    } catch (error) {
      toast.error('Failed to fetch book requests');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRequests();
  }, []);
  
  const filterRequests = (requestList: BookRequest[], filterType: 'all' | 'pending' | 'approved') => {
    switch (filterType) {
      case 'pending':
        setFilteredRequests(requestList.filter(req => !req.approve_status));
        break;
      case 'approved':
        setFilteredRequests(requestList.filter(req => req.approve_status));
        break;
      default:
        setFilteredRequests(requestList);
    }
  };
  
  const handleFilterChange = (newFilter: 'all' | 'pending' | 'approved') => {
    setFilter(newFilter);
    filterRequests(requests, newFilter);
  };
  
  const handleApproveRequest = async (requestId: number) => {
    try {
      await axios.put(`http://localhost:3001/api/admin/requests/${requestId}/approve`);
      toast.success('Request approved successfully');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };
  
  const handleDenyRequest = async (requestId: number) => {
    try {
      await axios.put(`http://localhost:3001/api/admin/requests/${requestId}/deny`);
      toast.success('Request denied successfully');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to deny request');
    }
  };
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <ClipboardList className="h-6 w-6 mr-2 text-primary-600" />
            Approve Book Requests
          </h1>
          <p className="text-gray-600">Manage pending and approved book requests</p>
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
                All Requests
              </button>
              <button
                onClick={() => handleFilterChange('pending')}
                className={`px-3 py-1 text-sm rounded-md ${
                  filter === 'pending' 
                    ? 'bg-warning-100 text-warning-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleFilterChange('approved')}
                className={`px-3 py-1 text-sm rounded-md ${
                  filter === 'approved' 
                    ? 'bg-secondary-100 text-secondary-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Approved
              </button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date Requested</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map(request => (
                    <tr key={request.request_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{request.request_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{request.user_name}</div>
                            <div className="text-xs text-gray-500">{request.user_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">{request.book_title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          {request.created_at ? formatDate(request.created_at) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.approve_status ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-secondary-100 text-secondary-800">
                            Approved
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-warning-100 text-warning-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {!request.approve_status && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveRequest(request.request_id)}
                              className="bg-secondary-100 text-secondary-600 p-1.5 rounded-md hover:bg-secondary-200"
                              title="Approve Request"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDenyRequest(request.request_id)}
                              className="bg-accent-100 text-accent-600 p-1.5 rounded-md hover:bg-accent-200"
                              title="Deny Request"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </div>
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
              <ClipboardList className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Requests Found</h3>
            <p className="text-gray-600">
              {filter === 'pending' 
                ? 'There are no pending book requests at the moment'
                : filter === 'approved'
                  ? 'No approved requests found'
                  : 'There are no book requests in the system'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => handleFilterChange('all')}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                View All Requests
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApproveRequests;