import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, AlertTriangle, Users, Bell, UserPlus, Settings,
  LogOut, User, ClipboardList, Shield, Menu as MenuIcon, X,
  Building, CreditCard, Plus,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Determine if full text content should be shown (for mobile or desktop expanded state)
  const showTextContent = isMobileOpen || !isCollapsed;

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Bell, label: 'Notices', path: '/notices' },
    ...(user?.role === 'admin'
      ? [
          { icon: Plus, label: 'Add Notice', path: '/add-notice' },
          { icon: AlertTriangle, label: 'All Complaints', path: '/all-complaints' },
          { icon: UserPlus, label: 'Guest Approvals', path: '/guest-approvals' },
          { icon: Users, label: 'Member Directory', path: '/members' },
          { icon: Plus, label: 'Add Member', path: '/add-member' },
          { icon: Building, label: 'Properties', path: '/properties' },
          { icon: CreditCard, label: 'Payments', path: '/payments' },
          { icon: Plus, label: 'Add Payment', path: '/add-payment' },
          { icon: User, label: 'Profile', path: '/profile' },
          { icon: Settings, label: 'Settings', path: '/settings' },
        ]
      : user?.role === 'member'
      ? [
          { icon: Plus, label: 'Add Notice', path: '/add-notice' },
          { icon: AlertTriangle, label: 'My Complaints', path: '/my-complaints' },
          { icon: ClipboardList, label: 'Report Complaint', path: '/report-complaint' },
          { icon: UserPlus, label: 'Add Guest', path: '/add-guest' },
          { icon: Users, label: 'My Guests', path: '/my-guests' },
          { icon: CreditCard, label: 'Payments', path: '/payments' },
          { icon: User, label: 'Profile', path: '/profile' },
        ]
      : [
          { icon: ClipboardList, label: 'Report Complaint', path: '/report-complaint' },
          { icon: User, label: 'Profile', path: '/profile' },
        ]),
  ];

  return (
    <>
      {/* Mobile Toggle Button (fixed outside sidebar, controls mobile state) */}
      {/* This button now dynamically shows MenuIcon or X based on isMobileOpen */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-600 text-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>

      {/* Sidebar Container */}
      <div
        className={`
          bg-gradient-to-b from-emerald-800 to-teal-900 text-white
          fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'} /* Mobile states */
          lg:translate-x-0 /* Always visible on desktop */
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} /* Desktop collapsed/expanded states */
          ${!isMobileOpen && 'hidden lg:flex'} /* Hides sidebar completely on mobile when not open */
        `}
      >
        {/* Sidebar Header: Toggle Button & Logo/Welcome */}
        <div className={`
          flex items-center
          ${showTextContent ? 'justify-between px-4' : 'justify-center px-2'}
          py-4
          relative
        `}>
          {/* Society Hub Logo and Title (Visible only when showTextContent is true) */}
          {showTextContent && (
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-emerald-200" />
              <h1 className="text-xl font-extrabold text-emerald-50">Society Hub</h1>
            </div>
          )}
          {/* Desktop Toggle Button - inside the sidebar header, hidden on mobile */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors hidden lg:block focus:outline-none focus:ring-2 focus:ring-emerald-500"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <MenuIcon className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </div>

        {/* User Info (Visible only when showTextContent is true) */}
        {showTextContent && user && (
          <div className="text-center pb-4 px-4">
            <p className="text-emerald-100 text-sm mt-1 truncate">{`Welcome, ${user.name}`}</p>
            <p className="text-emerald-200 text-xs capitalize">{user.role}</p>
          </div>
        )}

        <hr className="border-t border-emerald-700 mx-4" />

        {/* Menu Items Container - This is the scrollable part */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide my-4 px-2">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => {
                      if (isMobileOpen) setIsMobileOpen(false); // Close mobile sidebar on item click
                    }}
                    className={`
                      flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-white bg-opacity-20 shadow-lg border-l-4 border-emerald-300'
                        : 'hover:bg-white hover:bg-opacity-10'
                      }
                      ${!showTextContent ? 'justify-center' : ''}
                    `}
                    title={item.label}
                  >
                    <Icon className="h-5 w-5" />
                    {showTextContent && <span className="font-medium text-nowrap">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <hr className="border-t border-emerald-700 mx-4" />

        {/* Logout Button (Footer) */}
        <div className={`py-4 px-2 ${!showTextContent ? 'flex justify-center' : ''}`}>
          <button
            onClick={logout}
            className={`
              flex items-center space-x-3 px-4 py-2 rounded-lg w-full
              hover:bg-red-500 hover:bg-opacity-20 transition-all duration-200
              ${!showTextContent ? 'justify-center' : ''}
            `}
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
            {showTextContent && <span className="font-medium text-nowrap">Logout</span>}
          </button>
        </div>
      </div>

      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
    </>
  );
};

export default Sidebar;