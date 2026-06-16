import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Globe } from 'lucide-react';
import { fadeInUp } from '../../utils/animations';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const AdminSettings = () => (
  <div className="p-6 space-y-6 max-w-3xl">
    <motion.div variants={fadeInUp} initial="initial" animate="animate">
      <h1 className="text-2xl font-display font-bold text-white">Settings</h1>
      <p className="text-white/40 text-sm font-body">Manage platform configuration</p>
    </motion.div>

    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="space-y-4">
      {[
        { icon: <Globe size={18} className="text-accent-purple" />, title: 'Platform Settings', desc: 'Configure defaults: max volunteers per event, active categories, registration open/close times.', id: 'settings-platform' },
        { icon: <Bell size={18} className="text-accent-cyan" />, title: 'Email Notifications', desc: 'Manage email templates for welcome, event confirmation, attendance, and password reset.', id: 'settings-email' },
        { icon: <Shield size={18} className="text-accent-green" />, title: 'Admin Accounts', desc: 'Create or manage administrator accounts. Promote volunteers to admin role.', id: 'settings-admin' },
        { icon: <Settings size={18} className="text-accent-pink" />, title: 'Advanced', desc: 'Rate limiting, CORS origins, API keys, and debug settings.', id: 'settings-advanced' },
      ].map((item) => (
        <Card key={item.title} hover>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
              {item.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white font-display">{item.title}</h3>
              <p className="text-white/50 text-sm font-body mt-1">{item.desc}</p>
            </div>
            <Button variant="glass" size="sm" onClick={() => toast('Settings panel coming soon!')} id={item.id}>
              Configure
            </Button>
          </div>
        </Card>
      ))}
    </motion.div>

    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="p-4 rounded-xl bg-accent-purple/10 border border-accent-purple/20">
      <p className="text-sm text-white/60 font-body">
        <span className="text-accent-purple font-semibold">VolunteerSphere v1.0.0</span> · MERN Stack · Local MongoDB
      </p>
    </motion.div>
  </div>
);

export default AdminSettings;
