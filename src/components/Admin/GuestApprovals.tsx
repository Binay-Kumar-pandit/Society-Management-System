import React, { useState, useEffect } from 'react';
import { UserPlus, Clock, CheckCircle, XCircle, Eye, Calendar, Home, User, Mail, Phone } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../../contexts/SocketContext';

const GuestApprovals: React.FC = () => {
  const [pendingGuests, setPendingGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    fetchPendingGuests();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new-guest-request', (guest) => {
        setPendingGuests(prev => [guest, ...prev]);
        toast.success('New guest approval request received!');
      });

      socket.on('guest-deleted', ({ guestId }) => {
        setPendingGuests(prev => prev.filter(guest => guest._id !== guestId));
      });

      return () => {
        socket.off('new-guest-request');
        socket.off('guest-deleted');
      };
    }
  }, [socket]);

  const fetchPendingGuests = async () => {
    try {
      // Fetch both guest users and guest entries
      const [guestUsersRes, guestEntriesRes] = await Promise.all([
        axios.get('/api/users/pending-guests'),
        axios.get('/api/guests/pending')
      ]);
      
      // Combine both types of pending approvals
      const allPendingGuests = [
        ...guestUsersRes.data.users.map(user => ({
          ...user,
          type: 'user_account',
          purpose: 'Account access request'
        })),
        ...guestEntriesRes.data.guests.map(guest => ({
          ...guest,
          type: 'guest_entry'
        }))
      ];
      
      setPendingGuests(allPendingGuests);
    } catch (error) {
      console.error('Error fetching pending guests:', error);
      toast.error('Failed to fetch pending guests');
    } finally {
      setLoading(false);
    }
  };

  const approveGuest = async (guestId: string) => {
    setProcessingId(guestId);
    try {
      await axios.put(`/api/guests/${guestId}/status`, { status: 'approved' });
      setPendingGuests(prev => prev.filter(guest => guest._id !== guestId));
      toast.success('Guest approved successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve guest');
    } finally {
      setProcessingId(null);
    }
  };

  const rejectGuest = async () => {
    if (!selectedGuest || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessingId(selectedGuest._id);
    try {
      await axios.put(`/api/guests/${selectedGuest._id}/status`, { 
        status: 'rejected',
        rejectionReason: rejectionReason.trim()
      });
      setPendingGuests(prev => prev.filter(guest => guest._id !== selectedGuest._id));
      toast.success('Guest rejected successfully');
      setShowRejectModal(false);
      setSelectedGuest(null);
      setRejectionReason('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject guest');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (guest) => {
    setSelectedGuest(guest);
    setShowRejectModal(true);
    setRejectionReason('');
  };

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
          <UserPlus className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">Guest Approvals</h1>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{pendingGuests.length} pending approvals</span>
        </div>
      </div>

      {pendingGuests.length === 0 ? (
        <div className="text-center py-12">
          <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
          <p className="text-gray-500">All guest requests have been processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingGuests.map((guest) => (
            <div key={guest._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {guest.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{guest.name}</h3>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      Pending Approval
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(guest.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{guest.email}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{guest.phoneNumber}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Home className="h-4 w-4" />
                  <span>Visiting House {guest.visitingHouse}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{guest.age} years old, {guest.gender}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Valid until {new Date(guest.validUntil).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Purpose of Visit</h4>
                <p className="text-sm text-gray-600">{guest.purpose}</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Added by</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {guest.addedBy?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">{guest.addedBy?.name}</p>
                    <p className="text-xs text-blue-700">House {guest.addedBy?.houseNumber}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => approveGuest(guest._id)}
                  disabled={processingId === guest._id}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>{processingId === guest._id ? 'Approving...' : 'Approve'}</span>
                </button>
                
                <button
                  onClick={() => openRejectModal(guest)}
                  disabled={processingId === guest._id}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Guest Request</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting {selectedGuest?.name}'s guest request:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
            />
            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedGuest(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={rejectGuest}
                disabled={!rejectionReason.trim() || processingId === selectedGuest?._id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {processingId === selectedGuest?._id ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestApprovals;