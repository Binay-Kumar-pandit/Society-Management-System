import React, { useState, useEffect } from 'react';
import { Bell, Eye, User, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const GuestDashboard: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new-notice', (notice) => {
        setNotices(prev => [notice, ...prev]);
      });

      socket.on('notice-updated', (notice) => {
        setNotices(prev => prev.map(n => n._id === notice._id ? notice : n));
      });

      socket.on('notice-deleted', ({ noticeId }) => {
        setNotices(prev => prev.filter(n => n._id !== noticeId));
      });

      return () => {
        socket.off('new-notice');
        socket.off('notice-updated');
        socket.off('notice-deleted');
      };
    }
  }, [socket]);

  const fetchNotices = async () => {
    try {
      const response = await axios.get('/api/notices');
      // Only show active notices for guests
      const activeNotices = response.data.notices.filter(n => new Date(n.validUntil) > new Date());
      setNotices(activeNotices);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
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
      case 'emergency': return 'text-red-600 bg-red-100';
      case 'event': return 'text-purple-600 bg-purple-100';
      case 'maintenance': return 'text-blue-600 bg-blue-100';
      case 'meeting': return 'text-orange-600 bg-orange-100';
      case 'payment': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user?.isApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <User className="h-16 w-16 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Approval Pending</h1>
            <p className="text-gray-600 mb-6">
              Your guest account is currently pending approval from the admin. 
              You'll be able to access the community features once approved.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Please wait for admin approval. You'll receive access to view notices and community information once approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
          <p className="text-gray-600">Guest Access</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-6 rounded-xl border border-emerald-200">
        <div className="flex items-center space-x-4">
          <User className="h-8 w-8 text-emerald-600" />
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">Guest Account Active</h2>
            <p className="text-emerald-700">
              You have access to view community notices and stay updated with society activities.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Notices</p>
              <p className="text-3xl font-bold text-gray-900">{notices.length}</p>
            </div>
            <Bell className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pinned Notices</p>
              <p className="text-3xl font-bold text-gray-900">{notices.filter(notice => notice.isPinned).length}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent Notices</p>
              <p className="text-3xl font-bold text-gray-900">{notices.filter(notice => notice.priority === 'urgent').length}</p>
            </div>
            <Bell className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Notices */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Community Notices</h3>
          <Link to="/notices" className="text-sm text-emerald-600 hover:text-emerald-500">
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice._id} className={`p-4 rounded-lg border ${notice.isPinned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{notice.title}</h4>
                    {notice.isPinned && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{notice.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>By {notice.postedBy?.name}</span>
                    <span>•</span>
                    <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Valid until {new Date(notice.validUntil).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(notice.category)}`}>
                    {notice.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notice.priority)}`}>
                    {notice.priority}
                  </span>
                  <Link to={`/notices/${notice._id}`} className="text-emerald-600 hover:text-emerald-500">
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notices.length === 0 && (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No notices available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestDashboard;