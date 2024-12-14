const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/investors', { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema and model
const investorSchema = new mongoose.Schema({
  name: String,
  sector: String,
});

const Investor = mongoose.model('Investor', investorSchema);

// API endpoint to fetch investors
app.get('/investors', async (req, res) => {
  try {
    const investors = await Investor.find();
    res.json(investors);
  } catch (err) {
    res.status(500).send('Error fetching investors');
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
