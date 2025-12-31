require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
//const authRoutes = require('./routes/authRoutes');

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors({
  origin: 'http://localhost:5173' 
}));
app.use(express.json()); 

// Routes
//app.use('/api/auth', authRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('UniShareSync Backend is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});