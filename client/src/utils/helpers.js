// Date formatting
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) return formatDate(dateStr);
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'Just now';
};

export const formatCountdown = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date - now;
  if (diffMs <= 0) return 'Past';

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
};

// Skill → color mapping
const SKILL_COLORS = {
  Teaching: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Medical: 'bg-red-500/20 text-red-300 border-red-500/30',
  Tech: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  Cooking: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Driving: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Counseling: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Construction: 'bg-stone-500/20 text-stone-300 border-stone-500/30',
  Fundraising: 'bg-green-500/20 text-green-300 border-green-500/30',
  'Social Media': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  Photography: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  Management: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
};

export const getSkillColor = (skill) =>
  SKILL_COLORS[skill] || 'bg-white/10 text-gray-300 border-white/20';

// Category → color
const CATEGORY_COLORS = {
  Environment: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', dot: '#10B981' },
  Education: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30', dot: '#3B82F6' },
  Health: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', dot: '#EF4444' },
  Food: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30', dot: '#F97316' },
  Tech: { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/30', dot: '#06B6D4' },
  Community: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30', dot: '#8B5CF6' },
  'Disaster Relief': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', dot: '#EAB308' },
};

export const getCategoryStyle = (category) =>
  CATEGORY_COLORS[category] || { bg: 'bg-white/10', text: 'text-gray-300', border: 'border-white/20', dot: '#94A3B8' };

// Status → color
export const getStatusStyle = (status) => {
  const map = {
    upcoming: 'bg-blue-500/20 text-blue-300',
    active: 'bg-green-500/20 text-green-300',
    completed: 'bg-gray-500/20 text-gray-300',
    cancelled: 'bg-red-500/20 text-red-300',
    pending: 'bg-yellow-500/20 text-yellow-300',
    approved: 'bg-green-500/20 text-green-300',
    rejected: 'bg-red-500/20 text-red-300',
    attended: 'bg-emerald-500/20 text-emerald-300',
    absent: 'bg-red-500/20 text-red-300',
  };
  return map[status] || 'bg-white/10 text-gray-300';
};

export const truncate = (str, len = 120) =>
  str && str.length > len ? str.slice(0, len) + '...' : str;

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

export const ALL_SKILLS = [
  'Teaching', 'Medical', 'Tech', 'Cooking', 'Driving',
  'Counseling', 'Construction', 'Fundraising', 'Social Media', 'Photography', 'Management',
];


export const ALL_CATEGORIES = [
  'Environment', 'Education', 'Health', 'Food', 'Tech', 'Community', 'Disaster Relief',
];
