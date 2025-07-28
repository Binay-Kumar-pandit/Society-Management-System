import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Home, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const GuestDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guest, setGuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuestDetails();
  }, [id]);

  const fetchGuestDetails = async () => {
    try {
      const response = await axios.get(`/api/guests/${id}`);
      setGuest(response.data.guest);
    } catch (error) {
      console.error('Error fetching guest details:', error);
      toast.error('Failed to fetch guest details');
      navigate('/my-guests');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Guest not found</h3>
        <button
          onClick={() => navigate('/my-guests')}
          className="text-emerald-600 hover:text-emerald-500"
        >
          Go back to guests
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/my-guests')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to My Guests</span>
        </button>
        <div className="text-sm text-gray-500">
          Guest #{guest._id.slice(-6)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {guest.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{guest.name}</h1>
                  <p className="text-gray-600">{guest.email}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(guest.status)}`}>
                {getStatusIcon(guest.status)}
                <span>{guest.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-900">{guest.phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Age & Gender</p>
                    <p className="font-medium text-gray-900">{guest.age} years, {guest.gender}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Home className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Visiting House</p>
                    <p className="font-medium text-gray-900">House {guest.visitingHouse}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Valid From</p>
                    <p className="font-medium text-gray-900">{new Date(guest.validFrom).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Valid Until</p>
                    <p className="font-medium text-gray-900">{new Date(guest.validUntil).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Request Date</p>
                    <p className="font-medium text-gray-900">{new Date(guest.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purpose of Visit */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Purpose of Visit</span>
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{guest.purpose}</p>
            </div>
          </div>

          {/* Rejection Reason */}
          {guest.status === 'rejected' && guest.rejectionReason && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center space-x-2">
                <XCircle className="h-5 w-5" />
                <span>Rejection Reason</span>
              </h3>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-red-700 leading-relaxed">{guest.rejectionReason}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Status:</span>
                <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(guest.status)}`}>
                  {getStatusIcon(guest.status)}
                  <span>{guest.status}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Request Date:</span>
                <span className="text-gray-900">{new Date(guest.createdAt).toLocaleDateString()}</span>
              </div>
              {guest.approvalDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{guest.status === 'approved' ? 'Approved' : 'Rejected'} Date:</span>
                  <span className="text-gray-900">{new Date(guest.approvalDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Valid Duration:</span>
                <span className="text-gray-900">
                  {Math.ceil((new Date(guest.validUntil).getTime() - new Date(guest.validFrom).getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>
          </div>

          {/* Added By Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Added By</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {guest.addedBy?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{guest.addedBy?.name}</p>
                <p className="text-sm text-gray-600">{guest.addedBy?.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">House:</span>
                <span className="text-gray-900">{guest.addedBy?.houseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="text-gray-900 capitalize">{guest.addedBy?.role}</span>
              </div>
            </div>
          </div>

          {/* Approved By Information */}
          {guest.approvedBy && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {guest.status === 'approved' ? 'Approved By' : 'Rejected By'}
              </h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {guest.approvedBy?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{guest.approvedBy?.name}</p>
                  <p className="text-sm text-gray-600">{guest.approvedBy?.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="text-gray-900 capitalize">{guest.approvedBy?.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="text-gray-900">{new Date(guest.approvalDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestDetails;