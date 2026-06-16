const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Environment', 'Education', 'Health', 'Food', 'Tech', 'Community', 'Disaster Relief'],
    required: true,
  },
  location: { type: String, default: '' },
  date: { type: Date, required: true },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  hoursAwarded: { type: Number, default: 2 },
  maxVolunteers: { type: Number, default: 50 },
  registeredCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  requiredSkills: { type: [String], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', EventSchema);
