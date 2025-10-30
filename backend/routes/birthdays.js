const express = require('express');
const router = express.Router();
const Birthday = require('../models/Birthday');
const nodemailer = require('nodemailer');

// 🧠 Gemini AI Setup
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// ✅ GET all birthdays
router.get('/', async (req, res) => {
  try {
    const birthdays = await Birthday.find();
    res.json(birthdays);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST new birthday + AI gift suggestions
router.post('/', async (req, res) => {
  try {
    const { name, date, relation, interests = [], email } = req.body;

    // 🧮 Calculate age and days remaining
    const birthDate = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    const hasHadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
    if (!hasHadBirthdayThisYear) age -= 1;

    const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
    const daysRemaining = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));

    // 🧠 Generate age-based + interest-based gift ideas using Gemini
    const prompt = `
    Suggest 3 short, creative, and age-appropriate birthday gift ideas 
    for a ${age}-year-old named ${name}.
    They like ${Array.isArray(interests) ? interests.join(', ') : interests}.
    Their birthday is in ${daysRemaining} days.
    Respond naturally with comma-separated ideas only, no numbering.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let giftSuggestions = "Generating gift ideas..."; 

    try {
        const result = await model.generateContent(prompt);
        const giftSuggestions = result.response.text().trim();
    } catch (error) {
        console.error('Gemini API Error:', error);
        const giftSuggestions = "Unable to generate gift suggestions at this time.";
    }


    // ✅ Save to MongoDB
    const newBirthday = new Birthday({
      name,
      date,
      relation,
      interests,
      email,
      giftSuggestions,
    });

    const savedBirthday = await newBirthday.save();
    res.status(201).json(savedBirthday);

  } catch (error) {
    console.error('Error adding birthday:', error);
    res.status(500).json({ error: 'Failed to add birthday' });
  }
});

// 🎂 Send birthday email
router.post('/send-email', async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🎉 Happy Birthday!',
      text: `Dear ${name},\n\nWishing you a wonderful birthday filled with happiness and surprises!\n\n— Birthday Reminder App 🎂`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
});

// ✅ DELETE a birthday by ID
router.delete('/:id', async (req, res) => {
  try {
    await Birthday.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
