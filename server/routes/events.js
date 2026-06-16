const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const {
  getAllEvents, getEvent, createEvent, updateEvent, deleteEvent,
  registerForEvent, cancelRegistration, markAttendance, getEventRegistrations
} = require('../controllers/eventController');

router.get('/', getAllEvents);
router.get('/:id', getEvent);
router.post('/', protect, isAdmin, createEvent);
router.put('/:id', protect, isAdmin, updateEvent);
router.delete('/:id', protect, isAdmin, deleteEvent);
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, cancelRegistration);
router.patch('/:id/attendance', protect, isAdmin, markAttendance);
router.get('/:id/registrations', protect, isAdmin, getEventRegistrations);

module.exports = router;
