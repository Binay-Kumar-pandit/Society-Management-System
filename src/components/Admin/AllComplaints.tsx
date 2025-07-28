import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Eye, Filter, Search, Calendar, Home, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../../contexts/SocketContext';

const AllComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { socket } = useSocket();

  useEffect(() => {
    fetchAllComplaints();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new-complaint', (complaint) => {
        setComplaints(prev => [complaint, ...prev]);
        toast.success('New complaint reported!');
      });

      socket.on('complaint-status-updated', (complaint) => {
        setComplaints(prev => prev.map(c => c._id === complaint._id ? complaint : c));
      });

      socket.on('complaint-deleted', ({ complaintId }) => {
        setComplaints(prev => prev.filter(c => c._id !== complaintId));
      });

      return () => {
        socket.off('new-complaint');
        socket.off('complaint-status-updated');
        socket.off('complaint-deleted');
      };
    }
  }, [socket]);

  const fetchAllComplaints = async () => {
    try {
      const response = await axios.get('/api/complaints/all');
      setComplaints(response.data.complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId: string, status: string) => {
    try {
      await axios.put(`/api/complaints/${complaintId}/status`, { status });
      setComplaints(prev => prev.map(complaint => 
        complaint._id === complaintId ? { ...complaint, status } : complaint
      ));
      toast.success('Complaint status updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'on-working': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'not-applicable': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'maintenance': return 'text-blue-600 bg-blue-100';
      case 'security': return 'text-red-600 bg-red-100';
      case 'water': return 'text-cyan-600 bg-cyan-100';
      case 'electricity': return 'text-yellow-600 bg-yellow-100';
      case 'cleaning': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.houseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.reportedBy?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-8 w-8 text-orange-600" />
          <h1 className="text-3xl font-bold text-gray-900">All Complaints</h1>
        </div>
        <div className="text-sm text-gray-500">
          Total: {filteredComplaints.length} complaints
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="on-working">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="not-applicable">Not Applicable</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="all">All Categories</option>
              <option value="maintenance">Maintenance</option>
              <option value="security">Security</option>
              <option value="water">Water</option>
              <option value="electricity">Electricity</option>
              <option value="cleaning">Cleaning</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredComplaints.map((complaint) => (
          <div key={complaint._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{complaint.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{complaint.description}</p>
              </div>
              {complaint.photo && (
                <img
                  src={`http://localhost:5000/uploads/complaints/${complaint.photo}`}
                  alt="Complaint"
                  className="w-16 h-16 rounded-lg object-cover ml-4"
                />
              )}
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(complaint.category)}`}>
                {complaint.category}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                {complaint.priority}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                {complaint.status}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Home className="h-3 w-3" />
                  <span>House {complaint.houseNumber}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>Reported by {complaint.reportedBy?.name}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                {complaint.status === 'pending' && (
                  <button
                    onClick={() => updateComplaintStatus(complaint._id, 'on-working')}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Work
                  </button>
                )}
                {complaint.status === 'on-working' && (
                  <button
                    onClick={() => updateComplaintStatus(complaint._id, 'resolved')}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </div>
              <Link
                to={`/complaints/${complaint._id}`}
                className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                <Eye className="h-4 w-4" />
                <span>View</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredComplaints.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No complaints have been reported yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AllComplaints;