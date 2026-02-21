const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/database');

// GET /api/users/:userId - Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT id, email, name, role, department, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    res.json({
      message: 'User profile retrieved successfully',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
});

// PUT /api/users/:userId - Update user profile
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, department, password } = req.body;
    
    // Check if user exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    // If email is being changed, check if new email already exists
    if (email && email !== userCheck.rows[0].email) {
      const emailCheck = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          error: 'Email already in use by another user'
        });
      }
    }
    
    // Build update query dynamically
    let updateQuery = 'UPDATE users SET ';
    const updateValues = [];
    let valueIndex = 1;
    
    if (name) {
      updateQuery += `name = $${valueIndex}, `;
      updateValues.push(name);
      valueIndex++;
    }
    
    if (email) {
      updateQuery += `email = $${valueIndex}, `;
      updateValues.push(email);
      valueIndex++;
    }
    
    if (department !== undefined) {
      updateQuery += `department = $${valueIndex}, `;
      updateValues.push(department);
      valueIndex++;
    }
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += `password = $${valueIndex}, `;
      updateValues.push(hashedPassword);
      valueIndex++;
    }
    
    // Remove trailing comma and space
    updateQuery = updateQuery.slice(0, -2);
    
    // Add WHERE clause
    updateQuery += ` WHERE id = $${valueIndex} RETURNING id, email, name, role, department, created_at`;
    updateValues.push(userId);
    
    const result = await pool.query(updateQuery, updateValues);
    
    res.json({
      message: 'User profile updated successfully',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Server error updating user profile' });
  }
});

// GET /api/users/:userId/complete - Get complete user profile with skills and certifications
router.get('/:userId/complete', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user info
    const userResult = await pool.query(
      'SELECT id, email, name, role, department, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    // Get user's skills
    const skillsResult = await pool.query(
      `SELECT 
        us.id,
        s.id as skill_id,
        s.name,
        s.category,
        us.proficiency_level,
        us.years_of_experience,
        us.last_used,
        us.notes,
        us.created_at
      FROM user_skills us
      JOIN skills s ON us.skill_id = s.id
      WHERE us.user_id = $1
      ORDER BY s.category, s.name`,
      [userId]
    );
    
    // Get user's certifications
    const certificationsResult = await pool.query(
      `SELECT 
        uc.id,
        c.id as certification_id,
        c.name,
        c.issuing_organization,
        uc.date_obtained,
        uc.expiry_date,
        uc.credential_id,
        uc.credential_url,
        uc.notes,
        uc.created_at
      FROM user_certifications uc
      JOIN certifications c ON uc.certification_id = c.id
      WHERE uc.user_id = $1
      ORDER BY uc.date_obtained DESC`,
      [userId]
    );
    
    res.json({
      message: 'Complete user profile retrieved successfully',
      user: userResult.rows[0],
      skills: skillsResult.rows,
      certifications: certificationsResult.rows
    });
    
  } catch (error) {
    console.error('Error fetching complete user profile:', error);
    res.status(500).json({ error: 'Server error fetching complete user profile' });
  }
});

module.exports = router;