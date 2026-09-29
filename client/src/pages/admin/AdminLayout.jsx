import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, Calendar, BarChart3, Settings, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { to: '/admin/volunteers', label: 'Volunteers', icon: <Users size={18} /> },
  { to: '/admin/events', label: 'Events', icon: <Calendar size={18} /> },
  { to: '/admin/reports', label: 'Reports', icon: <BarChart3 size={18} /> },
  { to: '/admin/settings', label: 'Settings', icon: <Settings size={18} /> },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? 'w-72' : collapsed ? 'w-16' : 'w-60'} transition-all duration-300`}>
      {/* Logo */}
      <div className={`flex items-center gap-2.5 p-4 border-b border-white/10 ${collapsed && !mobile ? 'justify-center' : ''}`}>
        {(!collapsed || mobile) && <span className="font-display text-sm font-bold text-white">VolunteerSphere</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-all duration-150 ${
                isActive ? 'bg-accent-purple/20 text-white border border-accent-purple/30' : 'text-white/50 hover:text-white hover:bg-white/5'
              } ${collapsed && !mobile ? 'justify-center' : ''}`
            }
            title={collapsed && !mobile ? label : undefined}
            onClick={() => mobile && setMobileOpen(false)}
            id={`admin-nav-${label.toLowerCase()}`}
          >
            {icon}
            {(!collapsed || mobile) && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-white/40 font-body">Administrator</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full font-body ${collapsed && !mobile ? 'justify-center' : ''}`}
          id="admin-logout"
        >
          <LogOut size={14} />
          {(!collapsed || mobile) && 'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary flex">
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col backdrop-blur-xl bg-secondary/80 border-r border-white/10 flex-shrink-0 ${collapsed ? 'w-16' : 'w-60'} transition-all duration-300 relative`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-secondary border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white z-10 transition-colors"
          id="admin-sidebar-toggle"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
        <Sidebar />
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-secondary/80 border border-white/10 text-white/70"
        id="admin-mobile-menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-secondary border-r border-white/10"
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-white/50 hover:text-white">
                <X size={16} />
              </button>
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
