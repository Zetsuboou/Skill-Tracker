const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')
const pool = require('../config/database')


//Register new user
router.post('/register', async(req, res) => {
    try {

        //get data from user's input
        const {email, password, name, role, department} = req.body;

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({
                error: 'Email, Password and name are required!'
            });
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1', [email]
        );

        if (existingUser.rows.length > 0){
            return res.status(400).json({
                error:'User with this email already exists'
            });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Insert new user into database
        const result = await pool.query(
            'INSERT INTO users (email, password, name, role, department) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, password, name, role, department, created_at', [email, hashedPassword, name, role || 'employee', department]
        );

        const newUser = result.rows[0];

        //Creates JWT token
        const token = JWT.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        //Send response
        res.status(201).json({
            message: 'User registered successfully',
            user: newUser,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({error: 'Server error during registration'});
    }
});


//Login user
router.post('/login', async(req, res) => {
    try{
        
        // Extract credentials from request body
        const {email, password} = req.body

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        // Find user by email
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1', [email]
        )

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const user = result.rows[0]

        // Compare password with hashed password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword){
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }
        
        //Creates JWT token
        const token = JWT.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        //Remove password from response
        delete user.password

        //Send response
        res.json({
            message: 'Login successful',
            user,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({error: 'Server error during login'})
    }
});

module.exports = router;