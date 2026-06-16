const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { getSummary, getMonthlyTrend, getVolunteerReport, getEventReport, getHoursReport, getActivity } = require('../controllers/reportController');

router.get('/summary', protect, isAdmin, getSummary);
router.get('/monthly', protect, isAdmin, getMonthlyTrend);
router.get('/volunteers', protect, isAdmin, getVolunteerReport);
router.get('/events', protect, isAdmin, getEventReport);
router.get('/hours', protect, isAdmin, getHoursReport);
router.get('/activity', protect, isAdmin, getActivity);

module.exports = router;
