const User = require('../models/User');
const Registration = require('../models/Registration');

// @desc    Get all volunteers (admin)
// @route   GET /api/volunteers
// @access  Admin
const getAllVolunteers = async (req, res) => {
  try {
    const { page = 1, limit = 20, skills, city, isActive, search } = req.query;
    const query = { role: 'volunteer' };

    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (skills) query.skills = { $in: skills.split(',') };
    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const volunteers = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ joinedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: volunteers,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single volunteer
// @route   GET /api/volunteers/:id
// @access  Admin
const getVolunteer = async (req, res) => {
  try {
    const volunteer = await User.findById(req.params.id).select('-password');
    if (!volunteer) return res.status(404).json({ success: false, message: 'Volunteer not found' });
    res.json({ success: true, data: volunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update volunteer profile
// @route   PUT /api/volunteers/:id
// @access  Protected (own profile) or Admin
const updateVolunteer = async (req, res) => {
  try {
    // Allow user to update own profile, or admin to update any
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { name, phone, age, gender, bio, skills, availability, city, state, country } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (age !== undefined) updateData.age = age;
    if (gender) updateData.gender = gender;
    if (bio !== undefined) updateData.bio = bio;
    if (skills) updateData.skills = Array.isArray(skills) ? skills : JSON.parse(skills);
    if (availability) {
      updateData.availability = typeof availability === 'string' ? JSON.parse(availability) : availability;
    }
    if (city || state || country) {
      updateData['address.city'] = city;
      updateData['address.state'] = state;
      updateData['address.country'] = country;
    }
    if (req.file) {
      updateData.profilePhoto = req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`;
    }

    const volunteer = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!volunteer) return res.status(404).json({ success: false, message: 'Volunteer not found' });
    res.json({ success: true, data: volunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Deactivate volunteer
// @route   DELETE /api/volunteers/:id
// @access  Admin
const deactivateVolunteer = async (req, res) => {
  try {
    const volunteer = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!volunteer) return res.status(404).json({ success: false, message: 'Volunteer not found' });
    res.json({ success: true, message: 'Volunteer deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle volunteer active status
// @route   PATCH /api/volunteers/:id/status
// @access  Admin
const toggleStatus = async (req, res) => {
  try {
    const volunteer = await User.findById(req.params.id);
    if (!volunteer) return res.status(404).json({ success: false, message: 'Volunteer not found' });
    volunteer.isActive = !volunteer.isActive;
    await volunteer.save({ validateBeforeSave: false });
    res.json({ success: true, data: volunteer, message: `Volunteer ${volunteer.isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get events a volunteer joined
// @route   GET /api/volunteers/:id/events
// @access  Protected
const getVolunteerEvents = async (req, res) => {
  try {
    const registrations = await Registration.find({ volunteer: req.params.id })
      .populate('event')
      .sort({ registeredAt: -1 });
    res.json({ success: true, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/volunteers/:id/password
// @access  Protected (own)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
 
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get top volunteers by total hours
// @route   GET /api/volunteers/leaderboard/top
// @access  Protected
const getLeaderboard = async (req, res) => {
  try {
    const topVolunteers = await User.find({ role: 'volunteer', isActive: true })
      .select('name email profilePhoto totalHours address joinedAt')
      .sort({ totalHours: -1, name: 1 })
      .limit(10);
    res.json({ success: true, data: topVolunteers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllVolunteers, getVolunteer, updateVolunteer, deactivateVolunteer, toggleStatus, getVolunteerEvents, changePassword, getLeaderboard };
