import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Calendar, 
  Home, 
  User, 
  MessageCircle, 
  Send,
  X,
  ZoomIn,
  Download
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const ComplaintDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  useEffect(() => {
    if (socket) {
      socket.on('complaint-comment-added', ({ complaintId, comment }) => {
        if (complaintId === id) {
          setComplaint(prev => ({
            ...prev,
            comments: [...(prev?.comments || []), comment]
          }));
        }
      });

      socket.on('complaint-status-updated', (updatedComplaint) => {
        if (updatedComplaint._id === id) {
          setComplaint(updatedComplaint);
        }
      });

      return () => {
        socket.off('complaint-comment-added');
        socket.off('complaint-status-updated');
      };
    }
  }, [socket, id]);

  const fetchComplaintDetails = async () => {
    try {
      const response = await axios.get(`/api/complaints/${id}`);
      setComplaint(response.data.complaint);
    } catch (error) {
      console.error('Error fetching complaint details:', error);
      toast.error('Failed to fetch complaint details');
      navigate('/my-complaints');
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (status: string, assignedTo?: string) => {
    try {
      await axios.put(`/api/complaints/${id}/status`, { status, assignedTo });
      toast.success('Complaint status updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const addComment = async () => {
    if (!comment.trim()) return;

    setSubmittingComment(true);
    try {
      await axios.post(`/api/complaints/${id}/comments`, { text: comment });
      setComment('');
      toast.success('Comment added successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Complaint not found</h3>
        <button
          onClick={() => navigate('/my-complaints')}
          className="text-emerald-600 hover:text-emerald-500"
        >
          Go back to complaints
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        <div className="text-sm text-gray-500">
          Complaint #{complaint._id.slice(-6)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{complaint.title}</h1>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(complaint.category)}`}>
                  {complaint.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(complaint.priority)}`}>
                  {complaint.priority}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
              <div className="flex items-center space-x-2">
                <Home className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">House:</span>
                <span className="font-medium">{complaint.houseNumber}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Reported by:</span>
                <span className="font-medium">{complaint.reportedBy?.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(complaint.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{complaint.description}</p>
            </div>

            {/* Photo */}
            {complaint.photo && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Attached Photo</h3>
                <div className="relative inline-block">
                  <img
                    src={`http://localhost:5000/uploads/complaints/${complaint.photo}`}
                    alt="Complaint"
                    className="max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setShowImageModal(true)}
                  />
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Admin Actions */}
            {user?.role === 'admin' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {complaint.status !== 'on-working' && (
                    <button
                      onClick={() => updateComplaintStatus('on-working')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark as In Progress
                    </button>
                  )}
                  {complaint.status !== 'resolved' && (
                    <button
                      onClick={() => updateComplaintStatus('resolved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark as Resolved
                    </button>
                  )}
                  {complaint.status !== 'not-applicable' && (
                    <button
                      onClick={() => updateComplaintStatus('not-applicable')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Mark as Not Applicable
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Comments ({complaint.comments?.length || 0})</span>
            </h3>

            {/* Add Comment */}
            <div className="mb-6">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={addComment}
                      disabled={!comment.trim() || submittingComment}
                      className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {complaint.comments?.map((comment, index) => (
                <div key={index} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {comment.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{comment.user?.name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {(!complaint.comments || complaint.comments.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Complaint Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaint Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Priority:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                  {complaint.priority}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(complaint.category)}`}>
                  {complaint.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900">{new Date(complaint.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Updated:</span>
                <span className="text-gray-900">{new Date(complaint.updatedAt).toLocaleDateString()}</span>
              </div>
              {complaint.assignedTo && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Assigned to:</span>
                  <span className="text-gray-900">{complaint.assignedTo.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reporter Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reporter Information</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {complaint.reportedBy?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{complaint.reportedBy?.name}</p>
                <p className="text-sm text-gray-600">{complaint.reportedBy?.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">House:</span>
                <span className="text-gray-900">{complaint.reportedBy?.houseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="text-gray-900 capitalize">{complaint.reportedBy?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && complaint.photo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-all z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={`http://localhost:5000/uploads/complaints/${complaint.photo}`}
              alt="Complaint"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <a
              href={`http://localhost:5000/uploads/complaints/${complaint.photo}`}
              download
              className="absolute bottom-4 right-4 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-all"
            >
              <Download className="h-6 w-6" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetails;