const express = require('express');
const pool = require('../config/database')
const router = express.Router()


router.get('/user/:userId', async (req, res) => {
    try {
        const {constId} = req.params;
        const result = await pool.query(
            'SELECT * FROM skills WHERE users_id = $1 ORDER BY created_at DESC', [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({error: 'Failed to fetch skills'})
    }
});

router.post('/', async (req, res) =>{
    try{
        const { user_id, skill_name, proficiency_level, years_experience} = req.body;

        const result = await pool.query(
            `INSERT INTO skills (user_id, skill_name, proficiency_level, years_experience) VALUES ($1, $2, $3, $4) RETURNING *`, [user_id, skill_name, proficiency_level, years_experience]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding skill:', error);
        res.status(500).json({error: 'Failed to add skill'})
    }
})