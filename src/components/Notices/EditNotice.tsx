import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Bell, Calendar, Save, X, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface NoticeForm {
  title: string;
  description: string;
  category: 'general' | 'maintenance' | 'event' | 'emergency' | 'meeting' | 'payment';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  validUntil: string;
  isPinned?: boolean;
}

const EditNotice: React.FC = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<NoticeForm>();

  useEffect(() => {
    fetchNotice();
  }, [id]);

  const fetchNotice = async () => {
    try {
      const response = await axios.get(`/api/notices/${id}`);
      const notice = response.data.notice;
      
      // Check permissions
      if (user?.role !== 'admin' && notice.postedBy._id !== user?.id) {
        toast.error('You do not have permission to edit this notice');
        navigate('/notices');
        return;
      }

      reset({
        title: notice.title,
        description: notice.description,
        category: notice.category,
        priority: notice.priority,
        validUntil: new Date(notice.validUntil).toISOString().split('T')[0],
        isPinned: notice.isPinned
      });
    } catch (error) {
      console.error('Error fetching notice:', error);
      toast.error('Failed to fetch notice details');
      navigate('/notices');
    } finally {
      setFetchLoading(false);
    }
  };

  const onSubmit = async (data: NoticeForm) => {
    setLoading(true);
    try {
      await axios.put(`/api/notices/${id}`, data);
      toast.success('Notice updated successfully!');
      navigate('/notices');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update notice');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
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
          <button
            onClick={() => navigate('/notices')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <Bell className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">Edit Notice</h1>
        </div>
        <button
          onClick={() => navigate('/notices')}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X className="h-5 w-5" />
          <span>Cancel</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notice Title
              </label>
              <input
                type="text"
                {...register('title', { 
                  required: 'Title is required',
                  minLength: {
                    value: 5,
                    message: 'Title must be at least 5 characters'
                  }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Enter notice title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="">Select category</option>
                <option value="general">General</option>
                <option value="maintenance">Maintenance</option>
                <option value="event">Event</option>
                <option value="emergency">Emergency</option>
                <option value="meeting">Meeting</option>
                <option value="payment">Payment</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                {...register('priority', { required: 'Priority is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="">Select priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid Until
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  {...register('validUntil', { 
                    required: 'Valid until date is required',
                    validate: (value) => {
                      const selectedDate = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return selectedDate >= today || 'Date must be today or in the future';
                    }
                  })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              {errors.validUntil && (
                <p className="mt-1 text-sm text-red-600">{errors.validUntil.message}</p>
              )}
            </div>

            {user?.role === 'admin' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPinned"
                  {...register('isPinned')}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="isPinned" className="ml-2 block text-sm text-gray-700">
                  Pin this notice to top
                </label>
              </div>
            )}

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description', { 
                  required: 'Description is required',
                  minLength: {
                    value: 10,
                    message: 'Description must be at least 10 characters'
                  }
                })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                placeholder="Enter detailed description of the notice..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/notices')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              <span>{loading ? 'Updating...' : 'Update Notice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNotice;