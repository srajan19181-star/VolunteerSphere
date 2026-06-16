const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const upload = require('../middleware/upload');
const {
  getAllVolunteers, getVolunteer, updateVolunteer,
  deactivateVolunteer, toggleStatus, getVolunteerEvents, changePassword,
  getLeaderboard
} = require('../controllers/volunteerController');

router.get('/', protect, isAdmin, getAllVolunteers);
router.get('/leaderboard/top', protect, getLeaderboard);
router.get('/:id', protect, getVolunteer);
router.put('/:id', protect, upload.single('profilePhoto'), updateVolunteer);
router.delete('/:id', protect, isAdmin, deactivateVolunteer);
router.patch('/:id/status', protect, isAdmin, toggleStatus);
router.get('/:id/events', protect, getVolunteerEvents);
router.put('/:id/password', protect, changePassword);

module.exports = router;
