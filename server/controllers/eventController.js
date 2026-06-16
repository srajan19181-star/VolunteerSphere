const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, search, location, startDate, endDate, sort = '-createdAt' } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (location) query.location = { $regex: location, $options: 'i' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('createdBy', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: events, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Admin
const createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Admin
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    await Registration.deleteMany({ event: req.params.id });
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register volunteer for event
// @route   POST /api/events/:id/register
// @access  Protected
const registerForEvent = async (req, res) => {
  try {
    const { registrationType = 'individual', teamSize = 1, notes = '' } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    const size = parseInt(teamSize) || 1;
    if (event.registeredCount + size > event.maxVolunteers) {
      return res.status(400).json({ success: false, message: `Event is full. Only ${event.maxVolunteers - event.registeredCount} slots remaining.` });
    }
    if (event.status === 'cancelled' || event.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot register for this event' });
    }

    const existing = await Registration.findOne({ volunteer: req.user.id, event: req.params.id });
    if (existing) return res.status(400).json({ success: false, message: 'Already registered for this event' });

    const registration = await Registration.create({ 
      volunteer: req.user.id, 
      event: req.params.id,
      registrationType,
      teamSize: size,
      notes
    });
    
    event.registeredCount += size;
    await event.save();

    res.status(201).json({ success: true, data: registration, message: 'Registered successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel registration
// @route   DELETE /api/events/:id/register
// @access  Protected
const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findOneAndDelete({ volunteer: req.user.id, event: req.params.id });
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });

    const size = registration.teamSize || 1;
    await Event.findByIdAndUpdate(req.params.id, { $inc: { registeredCount: -size } });
    res.json({ success: true, message: 'Registration cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark attendance for an event
// @route   PATCH /api/events/:id/attendance
// @access  Admin
const markAttendance = async (req, res) => {
  try {
    const { attendees } = req.body; // [{ volunteerId, attended: true/false }]
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const updates = await Promise.all(
      attendees.map(async ({ volunteerId, attended }) => {
        const reg = await Registration.findOneAndUpdate(
          { volunteer: volunteerId, event: req.params.id },
          {
            status: attended ? 'attended' : 'absent',
            attendanceMarked: true,
            hoursLogged: attended ? event.hoursAwarded : 0,
          },
          { new: true }
        );
        if (reg && attended) {
          await User.findByIdAndUpdate(volunteerId, { $inc: { totalHours: event.hoursAwarded } });
        }
        return reg;
      })
    );

    event.status = 'completed';
    await event.save();

    res.json({ success: true, data: updates, message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get registrations for an event
// @route   GET /api/events/:id/registrations
// @access  Admin
const getEventRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.id })
      .populate('volunteer', 'name email profilePhoto skills');
    res.json({ success: true, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllEvents, getEvent, createEvent, updateEvent, deleteEvent, registerForEvent, cancelRegistration, markAttendance, getEventRegistrations };
