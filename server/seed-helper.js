const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

const skills = ['Teaching', 'Medical', 'Tech', 'Cooking', 'Driving', 'Counseling', 'Construction', 'Fundraising', 'Social Media', 'Photography'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];

const seedData = async () => {
  // Clear existing data
  await User.deleteMany({});
  await Event.deleteMany({});
  await Registration.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@volunteersphere.com',
    password: 'Admin@1234',
    role: 'admin',
    isVerified: true,
    isActive: true,
    skills: ['Management', 'Fundraising'],
    address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    bio: 'Platform administrator for VolunteerSphere.',
  });
  console.log(`👤 Admin created: admin@volunteersphere.com / Admin@1234`);

  // Create demo volunteers
  const volunteerData = [
    { name: 'Priya Sharma', email: 'priya@demo.com', skills: ['Teaching', 'Counseling'], city: 'Delhi', totalHours: 48 },
    { name: 'Rahul Mehta', email: 'rahul@demo.com', skills: ['Tech', 'Social Media'], city: 'Bangalore', totalHours: 32 },
    { name: 'Anjali Singh', email: 'anjali@demo.com', skills: ['Medical', 'Counseling'], city: 'Mumbai', totalHours: 64 },
    { name: 'Dev Patel', email: 'dev@demo.com', skills: ['Construction', 'Driving'], city: 'Ahmedabad', totalHours: 20 },
    { name: 'Nisha Kumar', email: 'nisha@demo.com', skills: ['Cooking', 'Fundraising'], city: 'Chennai', totalHours: 56 },
    { name: 'Arjun Reddy', email: 'arjun@demo.com', skills: ['Tech', 'Photography'], city: 'Hyderabad', totalHours: 40 },
    { name: 'Meera Joshi', email: 'meera@demo.com', skills: ['Teaching', 'Social Media'], city: 'Pune', totalHours: 28 },
    { name: 'Vikram Das', email: 'vikram@demo.com', skills: ['Medical', 'Driving'], city: 'Kolkata', totalHours: 72 },
    { name: 'Sanya Verma', email: 'sanya@demo.com', skills: ['Cooking', 'Counseling'], city: 'Delhi', totalHours: 16 },
    { name: 'Karan Malhotra', email: 'karan@demo.com', skills: ['Tech', 'Fundraising'], city: 'Mumbai', totalHours: 36 },
  ];

  const volunteers = await Promise.all(
    volunteerData.map((v) =>
      User.create({
        name: v.name,
        email: v.email,
        password: 'Demo@1234',
        role: 'volunteer',
        skills: v.skills,
        totalHours: v.totalHours,
        isActive: true,
        isVerified: true,
        address: { city: v.city, state: 'State', country: 'India' },
        availability: { weekdays: true, weekends: Math.random() > 0.5, mornings: true, evenings: Math.random() > 0.5 },
        bio: `Passionate volunteer committed to making a difference in ${v.city}.`,
        joinedAt: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000),
      })
    )
  );
  console.log(`👥 ${volunteers.length} demo volunteers created (password: Demo@1234)`);

  // Create events
  const eventData = [
    {
      title: 'Tree Plantation Drive',
      description: 'Join us to plant 500 trees in the city park. All equipment provided.',
      category: 'Environment',
      location: 'Cubbon Park, Bangalore',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      startTime: '08:00',
      endTime: '12:00',
      hoursAwarded: 4,
      maxVolunteers: 50,
      requiredSkills: ['Construction'],
      status: 'upcoming',
    },
    {
      title: 'Free Health Camp',
      description: 'Providing free medical checkups, blood tests, and consultations for underprivileged communities.',
      category: 'Health',
      location: 'Dharavi, Mumbai',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '17:00',
      hoursAwarded: 8,
      maxVolunteers: 30,
      requiredSkills: ['Medical', 'Counseling'],
      status: 'upcoming',
    },
    {
      title: 'Digital Literacy Workshop',
      description: 'Teaching senior citizens how to use smartphones, internet banking, and video calling.',
      category: 'Tech',
      location: 'Old Age Home, Delhi',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      startTime: '10:00',
      endTime: '14:00',
      hoursAwarded: 4,
      maxVolunteers: 20,
      requiredSkills: ['Tech', 'Teaching'],
      status: 'upcoming',
    },
    {
      title: 'Food Distribution Drive',
      description: 'Distributing hot meals and grocery packages to flood-affected families.',
      category: 'Food',
      location: 'Flood Relief Camp, Chennai',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      startTime: '07:00',
      endTime: '13:00',
      hoursAwarded: 6,
      maxVolunteers: 40,
      requiredSkills: ['Cooking', 'Driving'],
      status: 'active',
    },
    {
      title: 'School Renovation Project',
      description: 'Repainting classrooms and repairing furniture at a government school.',
      category: 'Education',
      location: 'Government School, Hyderabad',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '17:00',
      hoursAwarded: 8,
      maxVolunteers: 25,
      requiredSkills: ['Construction'],
      status: 'upcoming',
    },
    {
      title: 'Youth Coding Bootcamp',
      description: 'A 2-day intensive coding bootcamp teaching HTML, CSS, and JavaScript to underprivileged youth.',
      category: 'Tech',
      location: 'Community Center, Pune',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '18:00',
      hoursAwarded: 9,
      maxVolunteers: 15,
      requiredSkills: ['Tech', 'Teaching'],
      status: 'upcoming',
    },
    {
      title: 'Beach Cleanup Marathon',
      description: 'Annual beach cleanup drive — collect waste and restore natural beauty.',
      category: 'Environment',
      location: 'Marina Beach, Chennai',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      startTime: '06:00',
      endTime: '10:00',
      hoursAwarded: 4,
      maxVolunteers: 100,
      registeredCount: 87,
      requiredSkills: [],
      status: 'completed',
    },
    {
      title: 'Mental Health Awareness Walk',
      description: 'Community walk + awareness sessions to break the stigma around mental health.',
      category: 'Health',
      location: 'Lalbagh, Bangalore',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      startTime: '07:00',
      endTime: '10:00',
      hoursAwarded: 3,
      maxVolunteers: 60,
      requiredSkills: ['Counseling', 'Social Media'],
      status: 'upcoming',
    },
  ];

  const events = await Promise.all(
    eventData.map((e) => Event.create({ ...e, createdBy: admin._id }))
  );
  console.log(`📅 ${events.length} demo events created`);

  // Create some registrations
  const registrationPairs = [
    { vol: 0, evt: 0 }, { vol: 1, evt: 0 }, { vol: 2, evt: 1 }, { vol: 3, evt: 2 },
    { vol: 4, evt: 3 }, { vol: 5, evt: 3 }, { vol: 6, evt: 4 }, { vol: 7, evt: 5 },
    { vol: 8, evt: 7 }, { vol: 9, evt: 7 }, { vol: 0, evt: 6 }, { vol: 1, evt: 6 },
    { vol: 2, evt: 6 }, { vol: 3, evt: 5 }, { vol: 4, evt: 2 },
  ];

  await Promise.all(
    registrationPairs.map(({ vol, evt }) =>
      Registration.create({
        volunteer: volunteers[vol]._id,
        event: events[evt]._id,
        status: events[evt].status === 'completed' ? 'attended' : 'pending',
        attendanceMarked: events[evt].status === 'completed',
        hoursLogged: events[evt].status === 'completed' ? events[evt].hoursAwarded : 0,
      }).catch(() => null)
    )
  );

  // Update event registered counts
  for (const event of events) {
    const count = await Registration.countDocuments({ event: event._id });
    await Event.findByIdAndUpdate(event._id, { registeredCount: count });
  }

  console.log('📋 Demo registrations created');
};

module.exports = { seedData };
