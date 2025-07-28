import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Plus, Eye, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const MyGuests: React.FC = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    fetchMyGuests();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('guest-status-updated', (guest) => {
        if (guest.addedBy._id === user?.id) {
          setGuests(prev => prev.map(g => g._id === guest._id ? guest : g));
          toast.success(`Guest "${guest.name}" ${guest.status}`);
        }
      });

      return () => {
        socket.off('guest-status-updated');
      };
    }
  }, [socket, user]);

  const fetchMyGuests = async () => {
    try {
      const response = await axios.get('/api/guests');
      setGuests(response.data.guests);
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast.error('Failed to fetch guests');
    } finally {
      setLoading(false);
    }
  };

  const deleteGuest = async (guestId: string) => {
    if (!window.confirm('Are you sure you want to delete this guest?')) return;

    try {
      await axios.delete(`/api/guests/${guestId}`);
      setGuests(prev => prev.filter(g => g._id !== guestId));
      toast.success('Guest deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete guest');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredGuests = guests.filter(guest => {
    if (filter === 'all') return true;
    return guest.status === filter;
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
          <UserPlus className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">My Guests</h1>
        </div>
        <Link
          to="/add-guest"
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all"
        >
          <Plus className="h-5 w-5" />
          <span>Add Guest</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Guests' },
            { key: 'pending', label: 'Pending Approval' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' }
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

      {/* Guests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGuests.map((guest) => (
          <div key={guest._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {guest.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{guest.name}</h3>
                  <p className="text-sm text-gray-600">{guest.email}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(guest.status)}`}>
                {getStatusIcon(guest.status)}
                <span>{guest.status}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Phone:</span>
                <span className="text-gray-900">{guest.phoneNumber}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Visiting House:</span>
                <span className="text-gray-900">{guest.visitingHouse}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Age:</span>
                <span className="text-gray-900">{guest.age} years, {guest.gender}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Valid Until:</span>
                <span className="text-gray-900">{new Date(guest.validUntil).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-1">Purpose</h4>
              <p className="text-sm text-gray-600">{guest.purpose}</p>
            </div>

            {guest.status === 'rejected' && guest.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <h4 className="text-sm font-medium text-red-900 mb-1">Rejection Reason</h4>
                <p className="text-sm text-red-700">{guest.rejectionReason}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Added {new Date(guest.createdAt).toLocaleDateString()}</span>
              </div>
              {guest.approvalDate && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{guest.status} on {new Date(guest.approvalDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Link
                to={`/guests/${guest._id}`}
                className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </Link>
              
              {guest.status === 'pending' && (
                <button
                  onClick={() => deleteGuest(guest._id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredGuests.length === 0 && (
        <div className="text-center py-12">
          <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No guests found</h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all' 
              ? "You haven't added any guests yet." 
              : `No guests found with status: ${filter}`
            }
          </p>
          <Link
            to="/add-guest"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Your First Guest</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyGuests;