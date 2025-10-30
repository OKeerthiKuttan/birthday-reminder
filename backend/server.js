require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const birthdayRoutes = require('./routes/birthdays');
app.use('/api/birthdays', birthdayRoutes);

// Environment variables
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

// Debugging line (optional — remove later)
console.log("🔍 MONGO_URI from .env:", MONGO_URI);

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing. Please check your .env file.");
  process.exit(1);
}

// Connect to MongoDB with additional options
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.log('🔍 Please check your MONGO_URI and internet connection');
  });

// Default route
app.get('/', (req, res) => {
  res.send('🎉 Birthday Reminder Backend is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
