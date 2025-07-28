import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Plus, Eye, MessageCircle, Calendar, Home, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const MyComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('complaint-status-updated', (complaint) => {
        if (complaint.reportedBy._id === user?.id) {
          setComplaints(prev => prev.map(c => c._id === complaint._id ? complaint : c));
          toast.success(`Complaint "${complaint.title}" status updated to ${complaint.status}`);
        }
      });

      socket.on('complaint-comment-added', ({ complaintId, comment }) => {
        setComplaints(prev => prev.map(complaint => 
          complaint._id === complaintId 
            ? { ...complaint, comments: [...complaint.comments, comment] }
            : complaint
        ));
      });

      return () => {
        socket.off('complaint-status-updated');
        socket.off('complaint-comment-added');
      };
    }
  }, [socket, user]);

  const fetchMyComplaints = async () => {
    try {
      const response = await axios.get('/api/complaints');
      setComplaints(response.data.complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
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
    if (filter === 'all') return true;
    return complaint.status === filter;
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
          <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
        </div>
        <Link
          to="/report-complaint"
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all"
        >
          <Plus className="h-5 w-5" />
          <span>Report Complaint</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Complaints' },
            { key: 'pending', label: 'Pending' },
            { key: 'on-working', label: 'In Progress' },
            { key: 'resolved', label: 'Resolved' },
            { key: 'not-applicable', label: 'Not Applicable' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === key
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredComplaints.map((complaint) => (
          <div key={complaint._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{complaint.title}</h3>
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

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Home className="h-3 w-3" />
                  <span>House {complaint.houseNumber}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {complaint.assignedTo && (
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>Assigned to {complaint.assignedTo.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <MessageCircle className="h-4 w-4" />
                <span>{complaint.comments?.length || 0} comments</span>
              </div>
              <Link
                to={`/complaints/${complaint._id}`}
                className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredComplaints.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all' 
              ? "You haven't reported any complaints yet." 
              : `No complaints found with status: ${filter}`
            }
          </p>
          <Link
            to="/report-complaint"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Report Your First Complaint</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyComplaints;