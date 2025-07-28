import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Eye, Filter, Search, Calendar, Home, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../../contexts/SocketContext';

const AllIssues: React.FC = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { socket } = useSocket();

  useEffect(() => {
    fetchAllIssues();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new-issue', (issue) => {
        setIssues(prev => [issue, ...prev]);
        toast.success('New issue reported!');
      });

      socket.on('issue-status-updated', (issue) => {
        setIssues(prev => prev.map(i => i._id === issue._id ? issue : i));
      });

      socket.on('issue-deleted', ({ issueId }) => {
        setIssues(prev => prev.filter(i => i._id !== issueId));
      });

      return () => {
        socket.off('new-issue');
        socket.off('issue-status-updated');
        socket.off('issue-deleted');
      };
    }
  }, [socket]);

  const fetchAllIssues = async () => {
    try {
      const response = await axios.get('/api/issues/all');
      setIssues(response.data.issues);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const updateIssueStatus = async (issueId: string, status: string) => {
    try {
      await axios.put(`/api/issues/${issueId}/status`, { status });
      setIssues(prev => prev.map(issue => 
        issue._id === issueId ? { ...issue, status } : issue
      ));
      toast.success('Issue status updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
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

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.houseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.reportedBy?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
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
          <h1 className="text-3xl font-bold text-gray-900">All Issues</h1>
        </div>
        <div className="text-sm text-gray-500">
          Total: {filteredIssues.length} issues
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="on-working">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="not-applicable">Not Applicable</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="all">All Categories</option>
              <option value="maintenance">Maintenance</option>
              <option value="security">Security</option>
              <option value="water">Water</option>
              <option value="electricity">Electricity</option>
              <option value="cleaning">Cleaning</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredIssues.map((issue) => (
          <div key={issue._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{issue.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{issue.description}</p>
              </div>
              {issue.photo && (
                <img
                  src={`http://localhost:5000/uploads/issues/${issue.photo}`}
                  alt="Issue"
                  className="w-16 h-16 rounded-lg object-cover ml-4"
                />
              )}
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(issue.category)}`}>
                {issue.category}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                {issue.priority}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
                {issue.status}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Home className="h-3 w-3" />
                  <span>House {issue.houseNumber}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>Reported by {issue.reportedBy?.name}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                {issue.status === 'pending' && (
                  <button
                    onClick={() => updateIssueStatus(issue._id, 'on-working')}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Work
                  </button>
                )}
                {issue.status === 'on-working' && (
                  <button
                    onClick={() => updateIssueStatus(issue._id, 'resolved')}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </div>
              <Link
                to={`/issues/${issue._id}`}
                className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                <Eye className="h-4 w-4" />
                <span>View</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredIssues.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No issues have been reported yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AllIssues;