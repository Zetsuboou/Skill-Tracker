const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/skills - Get all available skills
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM skills ORDER BY category, name'
    );
    
    res.json({
      message: 'Skills retrieved successfully',
      skills: result.rows
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Server error fetching skills' });
  }
});

// POST /api/skills - Add new skill (admin function)
router.post('/', async (req, res) => {
  try {
    const { name, category, description } = req.body;
    
    // Validate input
    if (!name || !category) {
      return res.status(400).json({
        error: 'Skill name and category are required'
      });
    }
    
    // Check if skill already exists
    const existing = await pool.query(
      'SELECT * FROM skills WHERE name = $1',
      [name]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: 'Skill already exists'
      });
    }
    
    // Insert new skill
    const result = await pool.query(
      'INSERT INTO skills (name, category, description) VALUES ($1, $2, $3) RETURNING *',
      [name, category, description]
    );
    
    res.status(201).json({
      message: 'Skill created successfully',
      skill: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({ error: 'Server error creating skill' });
  }
});

// GET /api/skills/user/:userId - Get a user's skills
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
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
    
    res.json({
      message: 'User skills retrieved successfully',
      skills: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching user skills:', error);
    res.status(500).json({ error: 'Server error fetching user skills' });
  }
});

// POST /api/skills/user/:userId - Add skill to user
router.post('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { skillId, proficiencyLevel, yearsOfExperience, lastUsed, notes } = req.body;
    
    // Validate input
    if (!skillId || !proficiencyLevel) {
      return res.status(400).json({
        error: 'Skill ID and proficiency level are required'
      });
    }
    
    // Check if user already has this skill
    const existing = await pool.query(
      'SELECT * FROM user_skills WHERE user_id = $1 AND skill_id = $2',
      [userId, skillId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: 'User already has this skill'
      });
    }
    
    // Insert user skill
    const result = await pool.query(
      `INSERT INTO user_skills 
        (user_id, skill_id, proficiency_level, years_of_experience, last_used, notes) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, skillId, proficiencyLevel, yearsOfExperience || 0, lastUsed, notes]
    );
    
    res.status(201).json({
      message: 'Skill added to user successfully',
      userSkill: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error adding skill to user:', error);
    res.status(500).json({ error: 'Server error adding skill to user' });
  }
});

// PUT /api/skills/user/:userId/:skillId - Update user's skill
router.put('/user/:userId/:skillId', async (req, res) => {
  try {
    const { userId, skillId } = req.params;
    const { proficiencyLevel, yearsOfExperience, lastUsed, notes } = req.body;
    
    // Check if user skill exists
    const existing = await pool.query(
      'SELECT * FROM user_skills WHERE user_id = $1 AND skill_id = $2',
      [userId, skillId]
    );
    
    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'User skill not found'
      });
    }
    
    // Update user skill
    const result = await pool.query(
      `UPDATE user_skills 
       SET proficiency_level = COALESCE($1, proficiency_level),
           years_of_experience = COALESCE($2, years_of_experience),
           last_used = COALESCE($3, last_used),
           notes = COALESCE($4, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $5 AND skill_id = $6
       RETURNING *`,
      [proficiencyLevel, yearsOfExperience, lastUsed, notes, userId, skillId]
    );
    
    res.json({
      message: 'Skill updated successfully',
      userSkill: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error updating user skill:', error);
    res.status(500).json({ error: 'Server error updating user skill' });
  }
});

// DELETE /api/skills/user/:userId/:skillId - Remove skill from user
router.delete('/user/:userId/:skillId', async (req, res) => {
  try {
    const { userId, skillId } = req.params;
    
    // Check if user skill exists
    const existing = await pool.query(
      'SELECT * FROM user_skills WHERE user_id = $1 AND skill_id = $2',
      [userId, skillId]
    );
    
    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'User skill not found'
      });
    }
    
    // Delete user skill
    await pool.query(
      'DELETE FROM user_skills WHERE user_id = $1 AND skill_id = $2',
      [userId, skillId]
    );
    
    res.json({
      message: 'Skill removed from user successfully'
    });
    
  } catch (error) {
    console.error('Error deleting user skill:', error);
    res.status(500).json({ error: 'Server error deleting user skill' });
  }
});

module.exports = router;