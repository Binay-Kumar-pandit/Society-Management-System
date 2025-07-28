import React, { useState, useEffect } from 'react';
import { 
  Users, 
  AlertTriangle, 
  Bell, 
  UserPlus, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../../contexts/SocketContext';

interface Stats {
  totalUsers: number;
  totalMembers: number;
  totalGuests: number;
  maleCount: number;
  femaleCount: number;
  ageGroups: { _id: string; count: number }[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [pendingGuests, setPendingGuests] = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new-complaint', (complaint) => {
        setRecentComplaints(prev => [complaint, ...prev.slice(0, 4)]);
      });

      socket.on('new-guest-request', (guest) => {
        setPendingGuests(prev => [guest, ...prev.slice(0, 4)]);
      });

      socket.on('new-notice', (notice) => {
        setRecentNotices(prev => [notice, ...prev.slice(0, 4)]);
      });

      return () => {
        socket.off('new-complaint');
        socket.off('new-guest-request');
        socket.off('new-notice');
      };
    }
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, complaintsRes, guestsRes, noticesRes] = await Promise.all([
        axios.get('/api/users/stats'),
        axios.get('/api/complaints'),
        axios.get('/api/guests/pending'),
        axios.get('/api/notices')
      ]);

      setStats(statsRes.data);
      setRecentComplaints(complaintsRes.data.complaints.slice(0, 5));
      setPendingGuests(guestsRes.data.guests.slice(0, 5));
      setRecentNotices(noticesRes.data.notices.slice(0, 5));
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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalMembers || 0}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Guests</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalGuests || 0}</p>
            </div>
            <UserPlus className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Complaints</p>
              <p className="text-3xl font-bold text-gray-900">{recentComplaints.filter(complaint => complaint.status === 'pending').length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900">{pendingGuests.length}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Gender Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Male</span>
              <span className="font-medium">{stats?.maleCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Female</span>
              <span className="font-medium">{stats?.femaleCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-medium">{(stats?.maleCount || 0) + (stats?.femaleCount || 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Groups</h3>
          <div className="space-y-4">
            {stats?.ageGroups?.map((group) => (
              <div key={group._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{group._id}</span>
                <span className="font-medium">{group.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Complaints</h3>
          <div className="space-y-3">
            {recentComplaints.map((complaint) => (
              <div key={complaint._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{complaint.title}</p>
                  <p className="text-xs text-gray-500">House {complaint.houseNumber}</p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Approvals</h3>
          <div className="space-y-3">
            {pendingGuests.map((guest) => (
              <div key={guest._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{guest.name}</p>
                  <p className="text-xs text-gray-500">Visiting House {guest.visitingHouse}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;