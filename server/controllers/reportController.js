const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { generateCSV, generatePDF } = require('../utils/generateReport');

// @desc    Overall summary stats
// @route   GET /api/reports/summary
// @access  Admin
const getSummary = async (req, res) => {
  try {
    const [totalVolunteers, totalEvents, activeEvents, completedEvents] = await Promise.all([
      User.countDocuments({ role: 'volunteer' }),
      Event.countDocuments(),
      Event.countDocuments({ status: 'active' }),
      Event.countDocuments({ status: 'completed' }),
    ]);

    const hoursResult = await User.aggregate([
      { $match: { role: 'volunteer' } },
      { $group: { _id: null, total: { $sum: '$totalHours' } } },
    ]);

    const totalHours = hoursResult[0]?.total || 0;

    const newThisMonth = await User.countDocuments({
      role: 'volunteer',
      joinedAt: { $gte: new Date(new Date().setDate(1)) },
    });

    res.json({
      success: true,
      data: { totalVolunteers, totalEvents, activeEvents, completedEvents, totalHours, newThisMonth },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Monthly trend data (last 12 months)
// @route   GET /api/reports/monthly
// @access  Admin
const getMonthlyTrend = async (req, res) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);

    const volunteers = await User.aggregate([
      { $match: { role: 'volunteer', joinedAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$joinedAt' }, month: { $month: '$joinedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const events = await Event.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ success: true, data: { volunteers, events } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export volunteer report
// @route   GET /api/reports/volunteers?format=csv|pdf
// @access  Admin
const getVolunteerReport = async (req, res) => {
  try {
    const { format = 'csv', from, to } = req.query;
    const dateQuery = {};
    if (from) dateQuery.$gte = new Date(from);
    if (to) dateQuery.$lte = new Date(to);

    const query = { role: 'volunteer' };
    if (from || to) query.joinedAt = dateQuery;

    const volunteers = await User.find(query).select('-password -resetPasswordToken -resetPasswordExpire');

    if (format === 'csv') {
      const fields = ['name', 'email', 'phone', 'age', 'gender', 'totalHours', 'isActive', 'joinedAt'];
      const csvData = volunteers.map((v) => ({
        name: v.name,
        email: v.email,
        phone: v.phone,
        age: v.age,
        gender: v.gender,
        totalHours: v.totalHours,
        isActive: v.isActive,
        joinedAt: v.joinedAt?.toISOString().split('T')[0],
      }));
      const csv = generateCSV(csvData, fields);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=volunteers.csv');
      return res.send(csv);
    }

    if (format === 'pdf') {
      const headers = ['Name', 'Email', 'Hours', 'Status', 'Joined'];
      const rows = volunteers.map((v) => [
        v.name, v.email, v.totalHours, v.isActive ? 'Active' : 'Inactive',
        v.joinedAt?.toISOString().split('T')[0],
      ]);
      const pdf = generatePDF('Volunteer Report', headers, rows, `Total: ${volunteers.length} volunteers`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=volunteers.pdf');
      return res.send(Buffer.from(pdf));
    }

    res.json({ success: true, data: volunteers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export event report
// @route   GET /api/reports/events?format=csv|pdf
// @access  Admin
const getEventReport = async (req, res) => {
  try {
    const { format = 'csv', from, to } = req.query;
    const query = {};
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const events = await Event.find(query).populate('createdBy', 'name');

    if (format === 'csv') {
      const fields = ['title', 'category', 'location', 'date', 'status', 'registeredCount', 'maxVolunteers', 'hoursAwarded'];
      const csvData = events.map((e) => ({
        title: e.title, category: e.category, location: e.location,
        date: e.date?.toISOString().split('T')[0], status: e.status,
        registeredCount: e.registeredCount, maxVolunteers: e.maxVolunteers, hoursAwarded: e.hoursAwarded,
      }));
      const csv = generateCSV(csvData, fields);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=events.csv');
      return res.send(csv);
    }

    if (format === 'pdf') {
      const headers = ['Title', 'Category', 'Date', 'Status', 'Registered', 'Max'];
      const rows = events.map((e) => [
        e.title, e.category, e.date?.toISOString().split('T')[0],
        e.status, e.registeredCount, e.maxVolunteers,
      ]);
      const pdf = generatePDF('Events Report', headers, rows, `Total: ${events.length} events`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=events.pdf');
      return res.send(Buffer.from(pdf));
    }

    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Hours report
// @route   GET /api/reports/hours
// @access  Admin
const getHoursReport = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const volunteers = await User.find({ role: 'volunteer' })
      .select('name email totalHours joinedAt')
      .sort({ totalHours: -1 });

    if (format === 'csv') {
      const fields = ['name', 'email', 'totalHours'];
      const csv = generateCSV(volunteers.map((v) => ({ name: v.name, email: v.email, totalHours: v.totalHours })), fields);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=hours.csv');
      return res.send(csv);
    }

    if (format === 'pdf') {
      const headers = ['Name', 'Email', 'Total Hours'];
      const rows = volunteers.map((v) => [v.name, v.email, v.totalHours]);
      const pdf = generatePDF('Hours Report', headers, rows);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=hours.pdf');
      return res.send(Buffer.from(pdf));
    }

    res.json({ success: true, data: volunteers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Recent activity feed
// @route   GET /api/reports/activity
// @access  Admin
const getActivity = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate('volunteer', 'name email profilePhoto')
      .populate('event', 'title category')
      .sort({ registeredAt: -1 })
      .limit(20);
    res.json({ success: true, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSummary, getMonthlyTrend, getVolunteerReport, getEventReport, getHoursReport, getActivity };
