import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  Calendar, 
  User, 
  Edit,
  Trash2,
  Pin,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const NoticeDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notice, setNotice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNoticeDetails();
  }, [id]);

  const fetchNoticeDetails = async () => {
    try {
      const response = await axios.get(`/api/notices/${id}`);
      setNotice(response.data.notice);
    } catch (error) {
      console.error('Error fetching notice details:', error);
      toast.error('Failed to fetch notice details');
      navigate('/notices');
    } finally {
      setLoading(false);
    }
  };

  const deleteNotice = async () => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;

    try {
      await axios.delete(`/api/notices/${id}`);
      toast.success('Notice deleted successfully');
      navigate('/notices');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="text-center py-12">
        <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Notice not found</h3>
        <button
          onClick={() => navigate('/notices')}
          className="text-emerald-600 hover:text-emerald-500"
        >
          Go back to notices
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/notices')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Notices</span>
        </button>
        <div className="text-sm text-gray-500">
          Notice #{notice._id.slice(-6)}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Notice Header */}
        <div className={`px-6 py-4 ${notice.isPinned ? 'bg-yellow-50 border-b border-yellow-200' : 'bg-gray-50 border-b border-gray-200'}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {notice.isPinned && (
                  <Pin className="h-5 w-5 text-yellow-600" />
                )}
                <h1 className="text-2xl font-bold text-gray-900">{notice.title}</h1>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(notice.category)}`}>
                  {notice.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(notice.priority)}`}>
                  {notice.priority}
                </span>
                {notice.isPinned && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Pinned
                  </span>
                )}
              </div>
            </div>
            
            {(user?.role === 'admin' || notice.postedBy._id === user?.id) && (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/edit-notice/${notice._id}`}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Edit className="h-5 w-5" />
                </Link>
                <button
                  onClick={deleteNotice}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notice Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Posted by:</span>
              <span className="font-medium">{notice.postedBy?.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Posted on:</span>
              <span className="font-medium">{new Date(notice.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Valid until:</span>
              <span className="font-medium text-red-600">{new Date(notice.validUntil).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{notice.description}</p>
            </div>
          </div>

          {/* Attachments */}
          {notice.attachments && notice.attachments.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Attachments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notice.attachments.map((attachment, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Bell className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{attachment.originalName}</p>
                        <p className="text-sm text-gray-500">Attachment {index + 1}</p>
                      </div>
                      <a
                        href={`http://localhost:5000/${attachment.path}`}
                        download
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notice Footer */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Last updated: {new Date(notice.updatedAt).toLocaleString()}
            </span>
            <span>
              Role: {notice.postedBy?.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetails;