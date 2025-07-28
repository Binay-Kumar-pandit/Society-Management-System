import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Plus, Eye, Edit, Trash2, Pin, Calendar, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const NoticeBoard: React.FC = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    fetchNotices();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new-notice', (notice) => {
        setNotices(prev => [notice, ...prev]);
        toast.success('New notice posted!');
      });

      socket.on('notice-updated', (notice) => {
        setNotices(prev => prev.map(n => n._id === notice._id ? notice : n));
      });

      socket.on('notice-deleted', ({ noticeId }) => {
        setNotices(prev => prev.filter(n => n._id !== noticeId));
        toast.success('Notice deleted');
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
      setNotices(response.data.notices);
    } catch (error) {
      console.error('Error fetching notices:', error);
      toast.error('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const deleteNotice = async (noticeId: string) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;

    try {
      await axios.delete(`/api/notices/${noticeId}`);
      setNotices(prev => prev.filter(n => n._id !== noticeId));
      toast.success('Notice deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete notice');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-green-600 bg-green-100 border-green-200';
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

  const filteredNotices = notices.filter(notice => {
    if (filter === 'all') return true;
    if (filter === 'pinned') return notice.isPinned;
    if (filter === 'urgent') return notice.priority === 'urgent';
    return notice.category === filter;
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
          <Bell className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">Notice Board</h1>
        </div>
        {(user?.role === 'admin' || user?.role === 'member') && (
          <Link
            to="/add-notice"
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all"
          >
            <Plus className="h-5 w-5" />
            <span>Add Notice</span>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Notices' },
            { key: 'pinned', label: 'Pinned' },
            { key: 'urgent', label: 'Urgent' },
            { key: 'emergency', label: 'Emergency' },
            { key: 'event', label: 'Events' },
            { key: 'maintenance', label: 'Maintenance' },
            { key: 'meeting', label: 'Meetings' },
            { key: 'payment', label: 'Payments' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === key
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredNotices.map((notice) => (
          <div
            key={notice._id}
            className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
              notice.isPinned ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {notice.isPinned && (
                      <Pin className="h-4 w-4 text-yellow-600" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {notice.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {notice.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(notice.category)}`}>
                    {notice.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notice.priority)}`}>
                    {notice.priority}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{notice.postedBy?.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className="text-red-600">
                  Valid until {new Date(notice.validUntil).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Link
                  to={`/notices/${notice._id}`}
                  className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </Link>

                {(user?.role === 'admin' || notice.postedBy._id === user?.id) && (
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/edit-notice/${notice._id}`}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deleteNotice(notice._id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotices.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notices found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'No notices have been posted yet.' 
              : `No notices found for the selected filter: ${filter}`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;