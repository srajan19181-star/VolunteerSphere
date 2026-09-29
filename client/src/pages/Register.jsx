import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { Eye, EyeOff, Upload, Check, X, User, MapPin, Cpu, FileCheck } from 'lucide-react';
import { authService } from '../services/authService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { stepSlideVariants, fadeInUp } from '../utils/animations';
import { ALL_SKILLS, getSkillColor } from '../utils/helpers';

// Step schemas
const step1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits (numbers only)'),
  age: z.string()
    .min(1, 'Age is required')
    .refine((val) => {
      const ageNum = parseInt(val, 10);
      return !isNaN(ageNum) && ageNum > 0 && ageNum < 120;
    }, 'Please enter a valid age'),
  gender: z.string().min(1, 'Gender is required'),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

const step2Schema = z.object({
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(500, 'Bio must be under 500 characters'),
});

const STEPS = [
  { label: 'Personal Info', icon: <User size={16} /> },
  { label: 'Location & Bio', icon: <MapPin size={16} /> },
  { label: 'Skills & Time', icon: <Cpu size={16} /> },
  { label: 'Review', icon: <FileCheck size={16} /> },
];

const GENDERS = ['male', 'female', 'other', 'prefer-not-to-say'];
const AVAILABILITY_OPTIONS = [
  { key: 'weekdays', label: 'Weekdays' },
  { key: 'weekends', label: 'Weekends' },
  { key: 'mornings', label: 'Mornings' },
  { key: 'evenings', label: 'Evenings' },
];

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };
  const strength = getStrength();
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : 'bg-white/10'}`} />
        ))}
      </div>
      <p className={`text-xs font-body ${strength <= 1 ? 'text-red-400' : strength <= 2 ? 'text-orange-400' : strength <= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
        {labels[strength]}
      </p>
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [availability, setAvailability] = useState({ weekdays: false, weekends: false, mornings: false, evenings: false });
  const [formData, setFormData] = useState({});

  const step1Form = useForm({ resolver: zodResolver(step1Schema) });
  const step2Form = useForm({ resolver: zodResolver(step2Schema) });

  const watchPassword = step1Form.watch('password');
  const watchBio = step2Form.watch('bio', '');

  // Dropzone for photo
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const nextStep = async () => {
    let valid = true;
    if (step === 0) {
      valid = await step1Form.trigger();
      if (valid) setFormData((p) => ({ ...p, ...step1Form.getValues() }));
    } else if (step === 1) {
      valid = await step2Form.trigger();
      if (valid) setFormData((p) => ({ ...p, ...step2Form.getValues() }));
    }
    if (valid) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleAvailability = (key) => {
    setAvailability((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      const allData = { ...formData, skills: selectedSkills, availability, city: formData.city, state: formData.state, country: formData.country };
      Object.entries(allData).forEach(([key, val]) => {
        if (key === 'skills') fd.append(key, JSON.stringify(val));
        else if (key === 'availability') fd.append(key, JSON.stringify(val));
        else if (val !== undefined && val !== null) fd.append(key, val);
      });
      if (profilePhoto) fd.append('profilePhoto', profilePhoto);

      await authService.register(fd);

      // Confetti!
      confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ['#7C3AED', '#06B6D4', '#EC4899'] });
      toast.success('Registration successful! Please log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const mergedData = { ...formData };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4 py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-purple/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-cyan/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
            <span className="font-display text-xl font-bold text-white">VolunteerSphere</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white">Create your account</h1>
          <p className="text-white/50 font-body mt-2">Join the movement. It&apos;s free.</p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-body transition-all duration-300 ${
                i === step ? 'bg-accent-purple text-white' :
                i < step ? 'bg-accent-green/20 text-green-300' :
                'bg-white/5 text-white/30'
              }`}>
                {i < step ? <Check size={12} /> : s.icon}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px transition-all duration-300 ${i < step ? 'bg-accent-green/40' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-accent-purple via-accent-cyan to-accent-pink" />

          <div className="p-8 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {/* ── STEP 0: Personal Info ── */}
              {step === 0 && (
                <motion.div key="step0" custom={direction} variants={stepSlideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
                  <h2 className="text-lg font-semibold text-white font-display mb-6">Personal Information</h2>

                  {/* Photo Upload */}
                  <div {...getRootProps()} className={`cursor-pointer border-2 border-dashed rounded-xl p-4 text-center transition-all ${isDragActive ? 'border-accent-purple bg-accent-purple/10' : 'border-white/15 hover:border-accent-purple/40'}`}>
                    <input {...getInputProps()} />
                    {photoPreview ? (
                      <div className="flex items-center gap-4">
                        <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-accent-purple/40" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-white/80 font-body">Photo selected</p>
                          <p className="text-xs text-white/40 font-body">Click or drag to change</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2">
                        <Upload size={20} className="mx-auto text-white/30 mb-2" />
                        <p className="text-sm text-white/50 font-body">Drop profile photo here, or click</p>
                        <p className="text-xs text-white/30 font-body mt-1">PNG, JPG, WebP up to 5MB</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Full Name *" placeholder="John Doe" error={step1Form.formState.errors.name?.message} {...step1Form.register('name')} id="reg-name" />
                    <Input label="Email *" type="email" placeholder="john@example.com" error={step1Form.formState.errors.email?.message} {...step1Form.register('email')} id="reg-email" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Password *"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        error={step1Form.formState.errors.password?.message}
                        rightElement={
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-white/40 hover:text-white/80">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        }
                        {...step1Form.register('password')}
                        id="reg-password"
                      />
                      <PasswordStrength password={watchPassword} />
                    </div>
                    <Input label="Confirm Password *" type="password" placeholder="Repeat password" error={step1Form.formState.errors.confirmPassword?.message} {...step1Form.register('confirmPassword')} id="reg-confirm-password" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Phone *"
                      type="tel"
                      placeholder="9876543210"
                      maxLength={10}
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      error={step1Form.formState.errors.phone?.message}
                      {...step1Form.register('phone')}
                      id="reg-phone"
                    />
                    <Input
                      label="Age *"
                      type="number"
                      placeholder="25"
                      error={step1Form.formState.errors.age?.message}
                      {...step1Form.register('age')}
                      id="reg-age"
                    />
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2 font-body">Gender *</label>
                      <select className="w-full input-glass px-4 py-3 font-body text-sm" {...step1Form.register('gender')} id="reg-gender">
                        <option value="">Select...</option>
                        {GENDERS.map((g) => (
                          <option key={g} value={g} className="bg-secondary">{g.charAt(0).toUpperCase() + g.slice(1).replace(/-/g, ' ')}</option>
                        ))}
                      </select>
                      {step1Form.formState.errors.gender && (
                        <p className="text-xs text-red-400 mt-1">{step1Form.formState.errors.gender.message}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 1: Location & Bio ── */}
              {step === 1 && (
                <motion.div key="step1" custom={direction} variants={stepSlideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
                  <h2 className="text-lg font-semibold text-white font-display mb-6">Location & Bio</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="City *"
                      placeholder="Mumbai"
                      error={step2Form.formState.errors.city?.message}
                      {...step2Form.register('city')}
                      id="reg-city"
                    />
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2 font-body">State *</label>
                      <select
                        className="w-full input-glass px-4 py-3 font-body text-sm"
                        {...step2Form.register('state')}
                        id="reg-state"
                      >
                        <option value="">Select State...</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s} className="bg-secondary">{s}</option>
                        ))}
                      </select>
                      {step2Form.formState.errors.state && (
                        <p className="text-xs text-red-400 mt-1">{step2Form.formState.errors.state.message}</p>
                      )}
                    </div>
                    <Input
                      label="Country *"
                      placeholder="India"
                      error={step2Form.formState.errors.country?.message}
                      {...step2Form.register('country')}
                      id="reg-country"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2 font-body">Bio <span className="text-white/30">({(watchBio || '').length}/500)</span></label>
                    <textarea
                      placeholder="Tell us about yourself and why you want to volunteer..."
                      rows={4}
                      className="w-full input-glass px-4 py-3 font-body text-sm resize-none"
                      {...step2Form.register('bio')}
                      id="reg-bio"
                    />
                    {step2Form.formState.errors.bio && (
                      <p className="text-xs text-red-400 mt-1">{step2Form.formState.errors.bio.message}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Skills & Availability ── */}
              {step === 2 && (
                <motion.div key="step2" custom={direction} variants={stepSlideVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
                  <h2 className="text-lg font-semibold text-white font-display">Skills & Availability</h2>
                  <div>
                    <p className="text-sm font-medium text-white/70 mb-3 font-body">Select your skills (choose all that apply)</p>
                    <div className="flex flex-wrap gap-2">
                      {ALL_SKILLS.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-1.5 rounded-full text-sm font-body border transition-all duration-200 ${
                            selectedSkills.includes(skill)
                              ? 'bg-accent-purple/30 border-accent-purple/60 text-white'
                              : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'
                          }`}
                        >
                          {selectedSkills.includes(skill) && <Check size={12} className="inline mr-1" />}
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70 mb-3 font-body">When are you available?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {AVAILABILITY_OPTIONS.map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleAvailability(key)}
                          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-body transition-all duration-200 ${
                            availability[key]
                              ? 'bg-accent-cyan/20 border-accent-cyan/40 text-accent-cyan'
                              : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${availability[key] ? 'bg-accent-cyan border-accent-cyan' : 'border-white/30'}`}>
                            {availability[key] && <Check size={10} className="text-primary" />}
                          </div>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Review ── */}
              {step === 3 && (
                <motion.div key="step3" custom={direction} variants={stepSlideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
                  <h2 className="text-lg font-semibold text-white font-display mb-4">Review & Submit</h2>
                  <div className="space-y-3 text-sm font-body">
                    {[
                      ['Name', mergedData.name],
                      ['Email', mergedData.email],
                      ['Phone', mergedData.phone || '—'],
                      ['Age / Gender', `${mergedData.age || '—'} / ${mergedData.gender || '—'}`],
                      ['Location', `${mergedData.city || '—'}, ${mergedData.state || '—'}, ${mergedData.country || '—'}`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex gap-4 py-2 border-b border-white/5">
                        <span className="text-white/40 w-28 flex-shrink-0">{label}</span>
                        <span className="text-white/80">{value}</span>
                      </div>
                    ))}
                    <div className="flex gap-4 py-2 border-b border-white/5">
                      <span className="text-white/40 w-28 flex-shrink-0">Skills</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedSkills.length > 0 ? selectedSkills.map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-accent-purple/20 text-purple-300 rounded-full text-xs">{s}</span>
                        )) : <span className="text-white/40">None selected</span>}
                      </div>
                    </div>
                    <div className="flex gap-4 py-2 border-b border-white/5">
                      <span className="text-white/40 w-28 flex-shrink-0">Available</span>
                      <span className="text-white/80">
                        {Object.entries(availability).filter(([, v]) => v).map(([k]) => k).join(', ') || 'Not specified'}
                      </span>
                    </div>
                    {mergedData.bio && (
                      <div className="flex gap-4 py-2">
                        <span className="text-white/40 w-28 flex-shrink-0">Bio</span>
                        <span className="text-white/80 text-xs leading-relaxed">{mergedData.bio}</span>
                      </div>
                    )}
                  </div>
                  {photoPreview && (
                    <div className="flex items-center gap-3 mt-4 p-3 bg-white/5 rounded-xl">
                      <img src={photoPreview} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                      <p className="text-sm text-white/60 font-body">Profile photo ready to upload</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="px-8 pb-8 flex justify-between gap-3">
            {step > 0 ? (
              <Button variant="glass" onClick={prevStep} id="reg-prev">← Back</Button>
            ) : <div />}
            {step < 3 ? (
              <Button variant="primary" onClick={nextStep} id="reg-next">Next →</Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit} loading={loading} id="reg-submit">
                🎉 Create Account
              </Button>
            )}
          </div>
        </div>

        <p className="text-center mt-6 text-white/50 font-body text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-purple hover:text-accent-cyan transition-colors font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
