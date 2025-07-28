import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface Payment {
  _id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
  houseNumber?: string;
}

const PaymentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState({
    totalDue: 0,
    totalPaid: 0,
    pendingPayments: 0,
    overduePayments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      const [paymentsRes, statsRes] = await Promise.all([
        axios.get('/api/payments'),
        axios.get('/api/payments/stats')
      ]);

      setPayments(paymentsRes.data.payments);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast.error('Failed to fetch payment data');
    } finally {
      setLoading(false);
    }
  };

  const makePayment = async (paymentId: string) => {
    try {
      await axios.post(`/api/payments/${paymentId}/pay`);
      toast.success('Payment processed successfully');
      fetchPaymentData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Payment failed');
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    try {
      await axios.put(`/api/payments/${paymentId}/status`, { status });
      toast.success('Payment status updated successfully');
      fetchPaymentData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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
        <div className="flex items-center space-x-3">
          <CreditCard className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">Payment Dashboard</h1>
        </div>
        <div className="text-sm text-gray-500">
          {user?.role === 'member' ? `House ${user.houseNumber}` : 'Admin View'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Due</p>
              <p className="text-3xl font-bold text-red-600">₹{stats.totalDue.toLocaleString()}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-3xl font-bold text-green-600">₹{stats.totalPaid.toLocaleString()}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingPayments}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-3xl font-bold text-red-600">{stats.overduePayments}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payment.description}</div>
                      {user?.role === 'admin' && (
                        <div className="text-sm text-gray-500">House {payment.houseNumber}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ₹{payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(payment.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span>{payment.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user?.role === 'member' && payment.status === 'pending' && (
                      <button
                        onClick={() => makePayment(payment._id)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
                      >
                        Pay Now
                      </button>
                    )}

                    {user?.role === 'admin' && (
                      <>
                        {payment.status === 'pending' && (
                          <button
                            onClick={() => updatePaymentStatus(payment._id, 'paid')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 mr-2"
                          >
                            Mark Paid
                          </button>
                        )}
                        {payment.status === 'paid' && (
                          <button
                            onClick={() => updatePaymentStatus(payment._id, 'pending')}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700"
                          >
                            Mark Pending
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payment records</h3>
            <p className="text-gray-500">Payment history will appear here once available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDashboard;
