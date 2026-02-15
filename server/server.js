require('dotenv').config()
const pool = require('./config/database');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000

//Import routes
const authRoutes = require('./routes/auth')

//Middleware
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Skill Tracker API is running' })
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: 'Database connected!', 
      time: result.rows[0] 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

// use Auth routes
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});