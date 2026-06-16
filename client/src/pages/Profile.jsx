import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { Camera, User, MapPin, Edit3, Lock, Trash2, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { volunteerService } from '../services/volunteerService';
import { fadeInUp, staggerContainer } from '../utils/animations';
import { ProfileSkeleton } from '../components/skeletons/index';
import Navbar from '../components/layout/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { ALL_SKILLS, getInitials } from '../utils/helpers';

const AVAILABILITY_OPTIONS = [
  { key: 'weekdays', label: 'Weekdays' },
  { key: 'weekends', label: 'Weekends' },
  { key: 'mornings', label: 'Mornings' },
  { key: 'evenings', label: 'Evenings' },
];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [skills, setSkills] = useState([]);
  const [availability, setAvailability] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await volunteerService.getById(user.id);
        const data = res.data.data;
        setProfileData(data);
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          age: data.age || '',
          gender: data.gender || '',
          bio: data.bio || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          country: data.address?.country || '',
        });
        setSkills(data.skills || []);
        setAvailability(data.availability || {});
      } catch { toast.error('Failed to load profile'); }
      finally { setLoading(false); }
    };
    load();
  }, [user.id]);

  const onDrop = useCallback((files) => {
    const file = files[0];
    if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 1 });

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('skills', JSON.stringify(skills));
      fd.append('availability', JSON.stringify(availability));
      if (photoFile) fd.append('profilePhoto', photoFile);

      const res = await volunteerService.update(user.id, fd);
      setProfileData(res.data.data);
      updateUser({ name: res.data.data.name, profilePhoto: res.data.data.profilePhoto });
      setEditMode(false);
      setPhotoFile(null);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to save profile'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setPwLoading(true);
    try {
      await volunteerService.changePassword(user.id, { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated!');
      setPwOpen(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update password'); }
    finally { setPwLoading(false); }
  };

  const toggleSkill = (skill) => setSkills((p) => p.includes(skill) ? p.filter((s) => s !== skill) : [...p, skill]);
  const toggleAvail = (key) => setAvailability((p) => ({ ...p, [key]: !p[key] }));

  const avatarUrl = photoPreview || (profileData?.profilePhoto 
    ? (profileData.profilePhoto.startsWith('http') ? profileData.profilePhoto : `http://localhost:5000${profileData.profilePhoto}`) 
    : null);

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />
      <div className="pt-24 max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        {loading ? <ProfileSkeleton /> : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            {/* Avatar header */}
            <motion.div variants={fadeInUp} className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent-purple/40 bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-2xl font-bold text-white font-display">
                  {avatarUrl ? <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" /> : getInitials(profileData?.name)}
                </div>
                {editMode && (
                  <div {...getRootProps()} className="absolute -bottom-1 -right-1 w-8 h-8 bg-accent-purple rounded-full flex items-center justify-center cursor-pointer hover:bg-accent-purple/80 transition-colors">
                    <input {...getInputProps()} />
                    <Camera size={14} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-white">{profileData?.name}</h1>
                <p className="text-white/50 text-sm font-body">{profileData?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="purple" size="xs">
                    {profileData?.totalHours || 0}h logged
                  </Badge>
                  <Badge variant={profileData?.isActive ? 'green' : 'danger'} size="xs">
                    {profileData?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className="ml-auto">
                {editMode ? (
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" loading={saving} onClick={handleSave} id="profile-save">
                      <Check size={14} /> Save
                    </Button>
                    <Button variant="glass" size="sm" onClick={() => { setEditMode(false); setPhotoFile(null); setPhotoPreview(null); }} id="profile-cancel">
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  <Button variant="glass" size="sm" onClick={() => setEditMode(true)} id="profile-edit">
                    <Edit3 size={14} /> Edit Profile
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Personal Info */}
            <motion.div variants={fadeInUp}>
              <Card hover={false}>
                <h2 className="text-base font-semibold text-white font-display mb-4 flex items-center gap-2"><User size={16} /> Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', key: 'name', placeholder: 'Your name' },
                    { label: 'Phone', key: 'phone', placeholder: '+91 98765...' },
                    { label: 'Age', key: 'age', type: 'number', placeholder: '25' },
                    { label: 'Gender', key: 'gender', placeholder: 'male / female / other' },
                  ].map(({ label, key, type = 'text', placeholder }) => (
                    <Input
                      key={key}
                      label={label}
                      type={type}
                      value={form[key] || ''}
                      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                      disabled={!editMode}
                      placeholder={editMode ? placeholder : '—'}
                      id={`profile-${key}`}
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-white/70 mb-2 font-body">Bio</label>
                  <textarea
                    value={form.bio || ''}
                    onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                    disabled={!editMode}
                    rows={3}
                    className="w-full input-glass px-4 py-3 text-sm font-body resize-none disabled:opacity-60"
                    placeholder={editMode ? 'Tell us about yourself...' : '—'}
                    id="profile-bio"
                  />
                </div>
              </Card>
            </motion.div>

            {/* Location */}
            <motion.div variants={fadeInUp}>
              <Card hover={false}>
                <h2 className="text-base font-semibold text-white font-display mb-4 flex items-center gap-2"><MapPin size={16} /> Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['city', 'state', 'country'].map((k) => (
                    <Input key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={form[k] || ''} onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))} disabled={!editMode} placeholder={editMode ? 'Enter...' : '—'} id={`profile-${k}`} />
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Skills */}
            <motion.div variants={fadeInUp}>
              <Card hover={false}>
                <h2 className="text-base font-semibold text-white font-display mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {ALL_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => editMode && toggleSkill(skill)}
                      disabled={!editMode}
                      className={`px-3 py-1.5 rounded-full text-sm font-body border transition-all ${
                        skills.includes(skill)
                          ? 'bg-accent-purple/30 border-accent-purple/60 text-white'
                          : 'bg-white/5 border-white/10 text-white/40'
                      } ${editMode ? 'cursor-pointer hover:border-accent-purple/40' : 'cursor-default'}`}
                    >
                      {skills.includes(skill) && editMode && <Check size={10} className="inline mr-1" />}
                      {skill}
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Availability */}
            <motion.div variants={fadeInUp}>
              <Card hover={false}>
                <h2 className="text-base font-semibold text-white font-display mb-4">Availability</h2>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABILITY_OPTIONS.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => editMode && toggleAvail(key)}
                      disabled={!editMode}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-body transition-all ${
                        availability[key]
                          ? 'bg-accent-cyan/20 border-accent-cyan/40 text-accent-cyan'
                          : 'bg-white/5 border-white/10 text-white/40'
                      } ${editMode ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${availability[key] ? 'bg-accent-cyan border-accent-cyan' : 'border-white/30'}`}>
                        {availability[key] && <Check size={10} className="text-primary" />}
                      </div>
                      {label}
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div variants={fadeInUp} className="flex gap-3">
              <Button variant="glass" onClick={() => setPwOpen(true)} className="flex items-center gap-2" id="profile-change-pw">
                <Lock size={14} /> Change Password
              </Button>
              <Button variant="danger" onClick={() => setDeleteOpen(true)} className="ml-auto flex items-center gap-2" id="profile-delete">
                <Trash2 size={14} /> Delete Account
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Change Password Modal */}
      <Modal isOpen={pwOpen} onClose={() => setPwOpen(false)} title="Change Password" size="sm">
        <div className="p-6 space-y-4">
          <Input label="Current Password" type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))} id="pw-current" />
          <Input label="New Password" type="password" value={pwForm.newPassword} onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} id="pw-new" />
          <Input label="Confirm New Password" type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))} id="pw-confirm" />
          <Button variant="primary" fullWidth loading={pwLoading} onClick={handlePasswordChange} id="pw-submit">Update Password</Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Account" size="sm">
        <div className="p-6 space-y-4">
          <p className="text-white/60 text-sm font-body">This action cannot be undone. Your account and all data will be permanently deleted.</p>
          <Button variant="danger" fullWidth onClick={() => toast.error('Contact support to delete your account')} id="delete-confirm">
            <Trash2 size={14} /> Yes, Delete My Account
          </Button>
          <Button variant="glass" fullWidth onClick={() => setDeleteOpen(false)} id="delete-cancel">Cancel</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
