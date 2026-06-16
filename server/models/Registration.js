const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'attended', 'absent'],
    default: 'pending',
  },
  registeredAt: { type: Date, default: Date.now },
  attendanceMarked: { type: Boolean, default: false },
  hoursLogged: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  registrationType: {
    type: String,
    enum: ['individual', 'group'],
    default: 'individual',
  },
  teamSize: {
    type: Number,
    default: 1,
  },
});

// Prevent duplicate registrations
RegistrationSchema.index({ volunteer: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
