import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Home, 
  Bed, 
  Bath, 
  Square, 
  MapPin,
  Calendar,
  User,
  DollarSign,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const PropertyDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await axios.get(`/api/properties/${id}`);
      setProperty(response.data.property);
    } catch (error) {
      console.error('Error fetching property details:', error);
      toast.error('Failed to fetch property details');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const bookProperty = async () => {
    if (!window.confirm('Are you sure you want to book this property?')) return;

    try {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year lease
      
      await axios.post(`/api/properties/${id}/book`, { startDate, endDate });
      toast.success('Property booked successfully!');
      fetchPropertyDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book property');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100 border-green-200';
      case 'occupied': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'reserved': return 'text-purple-600 bg-purple-100 border-purple-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'occupied': return <User className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      case 'reserved': return <Clock className="h-4 w-4" />;
      default: return <Home className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Property not found</h3>
        <button
          onClick={() => navigate('/properties')}
          className="text-emerald-600 hover:text-emerald-500"
        >
          Go back to properties
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/properties')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Properties</span>
        </button>
        <div className="text-sm text-gray-500">
          Property #{property._id.slice(-6)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-64 md:h-80 bg-gradient-to-r from-emerald-400 to-teal-500 relative">
              {property.images && property.images.length > 0 ? (
                <img
                  src={property.images[0]}
                  alt={`Flat ${property.flatNumber}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <Home className="h-24 w-24" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(property.status)}`}>
                  {getStatusIcon(property.status)}
                  <span>{property.status}</span>
                </span>
              </div>
            </div>

            {/* Additional Images */}
            {property.images && property.images.length > 1 && (
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.images.slice(1, 4).map((image, index) => (
                    <div key={index} className="h-24 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Property view ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Flat {property.flatNumber}</h1>
                <p className="text-xl font-semibold text-emerald-600">₹{property.rent?.toLocaleString()}/month</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Property Type</p>
                <p className="font-medium text-gray-900 capitalize">{property.type}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Bed className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-500">Bedrooms</p>
                <p className="font-semibold text-gray-900">{property.bedrooms}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <Bath className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-500">Bathrooms</p>
                <p className="font-semibold text-gray-900">{property.bathrooms}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                  <Square className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm text-gray-500">Area</p>
                <p className="font-semibold text-gray-900">{property.area} sq ft</p>
              </div>
            </div>

            {property.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>
            )}

            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(property.status)}`}>
                  {getStatusIcon(property.status)}
                  <span>{property.status}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="text-gray-900 capitalize">{property.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Rent:</span>
                <span className="text-gray-900 font-medium">₹{property.rent?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Area:</span>
                <span className="text-gray-900">{property.area} sq ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900">{new Date(property.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Current Tenant Info */}
          {property.currentTenant && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Tenant</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {property.currentTenant.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{property.currentTenant.name}</p>
                  <p className="text-sm text-gray-600">{property.currentTenant.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="text-gray-900">{property.currentTenant.phoneNumber}</span>
                </div>
                {property.leaseStartDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lease Start:</span>
                    <span className="text-gray-900">{new Date(property.leaseStartDate).toLocaleDateString()}</span>
                  </div>
                )}
                {property.leaseEndDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lease End:</span>
                    <span className="text-gray-900">{new Date(property.leaseEndDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {user?.role === 'member' && property.status === 'available' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Book This Property</h3>
              <p className="text-sm text-gray-600 mb-4">
                Interested in this property? Book it now to reserve your spot.
              </p>
              <button
                onClick={bookProperty}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all"
              >
                <Calendar className="h-5 w-5" />
                <span>Book Property</span>
              </button>
            </div>
          )}

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Contact our property management team for more information.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Society Office</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Payment Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;