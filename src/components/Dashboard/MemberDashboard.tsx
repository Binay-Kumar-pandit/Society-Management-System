import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Bell, 
  UserPlus, 
  CheckCircle, 
  Clock,
  Plus,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [myComplaints, setMyComplaints] = useState([]);
  const [myGuests, setMyGuests] = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('complaint-status-updated', (complaint) => {
        if (complaint.reportedBy._id === user?.id) {
          setMyComplaints(prev => prev.map(c => c._id === complaint._id ? complaint : c));
        }
      });

      socket.on('guest-status-updated', (guest) => {
        if (guest.addedBy._id === user?.id) {
          setMyGuests(prev => prev.map(g => g._id === guest._id ? guest : g));
        }
      });

      socket.on('new-notice', (notice) => {
        setRecentNotices(prev => [notice, ...prev.slice(0, 4)]);
      });

      return () => {
        socket.off('complaint-status-updated');
        socket.off('guest-status-updated');
        socket.off('new-notice');
      };
    }
  }, [socket, user]);

  const fetchDashboardData = async () => {
    try {
      const [complaintsRes, guestsRes, noticesRes] = await Promise.all([
        axios.get('/api/complaints'),
        axios.get('/api/guests'),
        axios.get('/api/notices')
      ]);

      // Only show pending complaints on dashboard
      const pendingComplaints = complaintsRes.data.complaints.filter(c => c.status === 'pending');
      setMyComplaints(pendingComplaints.slice(0, 5));
      
      // Only show pending guests on dashboard
      const pendingGuests = guestsRes.data.guests.filter(g => g.status === 'pending');
      setMyGuests(pendingGuests.slice(0, 5));
      
      // Only show unresolved notices
      const activeNotices = noticesRes.data.notices.filter(n => new Date(n.validUntil) > new Date());
      setRecentNotices(activeNotices.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'on-working': return 'text-blue-600 bg-blue-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">House {user?.houseNumber}</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/report-complaint"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Report Complaint</p>
              <p className="text-lg font-semibold text-gray-900">Quick Report</p>
            </div>
            <Plus className="h-8 w-8 text-orange-600" />
          </div>
        </Link>

        <Link
          to="/add-guest"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Add Guest</p>
              <p className="text-lg font-semibold text-gray-900">New Guest</p>
            </div>
            <UserPlus className="h-8 w-8 text-green-600" />
          </div>
        </Link>

        <Link
          to="/notices"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">View Notices</p>
              <p className="text-lg font-semibold text-gray-900">Community</p>
            </div>
            <Bell className="h-8 w-8 text-blue-600" />
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Complaints</p>
              <p className="text-3xl font-bold text-gray-900">{myComplaints.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved Complaints</p>
              <p className="text-3xl font-bold text-gray-900">{myComplaints.filter(complaint => complaint.status === 'resolved').length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Guests</p>
              <p className="text-3xl font-bold text-gray-900">{myGuests.length}</p>
            </div>
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900">{myGuests.filter(guest => guest.status === 'pending').length}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Recent Complaints</h3>
            <Link to="/my-complaints" className="text-sm text-emerald-600 hover:text-emerald-500">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {myComplaints.map((complaint) => (
              <div key={complaint._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{complaint.title}</p>
                  <p className="text-xs text-gray-500">{complaint.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Guests</h3>
            <Link to="/my-guests" className="text-sm text-emerald-600 hover:text-emerald-500">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {myGuests.map((guest) => (
              <div key={guest._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{guest.name}</p>
                  <p className="text-xs text-gray-500">{guest.purpose}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(guest.status)}`}>
                  {guest.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Notices */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Notices</h3>
          <Link to="/notices" className="text-sm text-emerald-600 hover:text-emerald-500">
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {recentNotices.map((notice) => (
            <div key={notice._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{notice.title}</p>
                <p className="text-xs text-gray-500">
                  {notice.category} • {new Date(notice.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {notice.isPinned && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Pinned
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notice.priority)}`}>
                  {notice.priority}
                </span>
                <Link to={`/notices/${notice._id}`} className="text-emerald-600 hover:text-emerald-500">
                  <Eye className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;