import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Bell, Shield, Users, Home, Mail, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface SettingsForm {
  societyName: string;
  societyAddress: string;
  contactEmail: string;
  contactPhone: string;
  adminEmail: string;
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  securitySettings: {
    passwordExpiry: number;
    maxLoginAttempts: number;
    sessionTimeout: number;
  };
  paymentSettings: {
    lateFee: number;
    gracePeriod: number;
    autoReminders: boolean;
  };
}

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SettingsForm>({
    defaultValues: {
      societyName: 'Green Valley Society',
      societyAddress: '123 Green Valley Road, City, State - 123456',
      contactEmail: 'admin@greenvalley.com',
      contactPhone: '+91 9876543210',
      adminEmail: 'admin@greenvalley.com',
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: false
      },
      securitySettings: {
        passwordExpiry: 90,
        maxLoginAttempts: 5,
        sessionTimeout: 30
      },
      paymentSettings: {
        lateFee: 100,
        gracePeriod: 7,
        autoReminders: true
      }
    }
  });

  const onSubmit = async (data: SettingsForm) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Home },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'users', label: 'User Management', icon: Users }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <SettingsIcon className="h-8 w-8 text-emerald-600" />
        <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Society Name
                  </label>
                  <input
                    type="text"
                    {...register('societyName', { required: 'Society name is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  {errors.societyName && (
                    <p className="mt-1 text-sm text-red-600">{errors.societyName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      {...register('contactEmail', { required: 'Contact email is required' })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.contactEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Society Address
                  </label>
                  <textarea
                    {...register('societyAddress', { required: 'Society address is required' })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                  />
                  {errors.societyAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.societyAddress.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      {...register('contactPhone', { required: 'Contact phone is required' })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.contactPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      {...register('adminEmail', { required: 'Admin email is required' })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.adminEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.adminEmail.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <input
                    type="checkbox"
                    {...register('notificationSettings.emailNotifications')}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                  </div>
                  <input
                    type="checkbox"
                    {...register('notificationSettings.smsNotifications')}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                    <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                  </div>
                  <input
                    type="checkbox"
                    {...register('notificationSettings.pushNotifications')}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Expiry (days)
                  </label>
                  <input
                    type="number"
                    {...register('securitySettings.passwordExpiry', { 
                      required: 'Password expiry is required',
                      min: { value: 30, message: 'Minimum 30 days' }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  {errors.securitySettings?.passwordExpiry && (
                    <p className="mt-1 text-sm text-red-600">{errors.securitySettings.passwordExpiry.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    {...register('securitySettings.maxLoginAttempts', { 
                      required: 'Max login attempts is required',
                      min: { value: 3, message: 'Minimum 3 attempts' }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  {errors.securitySettings?.maxLoginAttempts && (
                    <p className="mt-1 text-sm text-red-600">{errors.securitySettings.maxLoginAttempts.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    {...register('securitySettings.sessionTimeout', { 
                      required: 'Session timeout is required',
                      min: { value: 15, message: 'Minimum 15 minutes' }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  {errors.securitySettings?.sessionTimeout && (
                    <p className="mt-1 text-sm text-red-600">{errors.securitySettings.sessionTimeout.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* User Management Settings */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">User Management Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Late Fee (₹)
                  </label>
                  <input
                    type="number"
                    {...register('paymentSettings.lateFee', { 
                      required: 'Late fee is required',
                      min: { value: 0, message: 'Cannot be negative' }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  {errors.paymentSettings?.lateFee && (
                    <p className="mt-1 text-sm text-red-600">{errors.paymentSettings.lateFee.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grace Period (days)
                  </label>
                  <input
                    type="number"
                    {...register('paymentSettings.gracePeriod', { 
                      required: 'Grace period is required',
                      min: { value: 0, message: 'Cannot be negative' }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  {errors.paymentSettings?.gracePeriod && (
                    <p className="mt-1 text-sm text-red-600">{errors.paymentSettings.gracePeriod.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Auto Reminders</h4>
                    <p className="text-sm text-gray-500">Send automatic payment reminders</p>
                  </div>
                  <input
                    type="checkbox"
                    {...register('paymentSettings.autoReminders')}
                    className="ml-4 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              <span>{loading ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;