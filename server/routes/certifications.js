const express = require("express")
const router = express.Router()
const pool = require("../config/database")

// GET /api/certifications - gets all certifications 
router.get("/", async(req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM certifications ORDER BY issuing_organization, name'
        )

        res.json({
            message: 'Certifications retrieved successfully',
            certifications: result.rows
        })
    } catch (err) {
        console.error('Error fetching certifications:', error);
        res.status(500).json({ error: 'Server error fetching certifications' })
    }
})

// POST /api/certifications - Add new certification (admin function)
router.post("/", async(req, res) => {
    try {
        const { name, issuingOrganization, description} = req.body;

        if (!name || !issuingOrganization){
            return res.status(400).json({
                error: "Certification name and issuing organization are required."
            });
        }

        const existing = await pool.query(
            'SELECT * FROM certifications WHERE name = $1', [name]
        );

        if (existing.rows.length > 0){
            return res.status(400).json({
                error: "Certification already exists."
            });
        }

        const result = await pool.query(
            'INSERT INTO certifications (name, issuing_organization, description) VALUES ($1, $2, $3) RETURNING *', [name, issuingOrganization, description]
        );

        res.status(200).json({
            message: 'Certification Created successfully'
        });
    } catch (error) {
        console.error('Error creating certification:', error),
        res.status(500).json({error: 'Server error creating certification'});
    }
});

// GET /api/certifications/user/:userId - get user's certifications
router.get("/user/:userId", async(req, res) => {
    try{
        const { userId } = req.params;

        const result = await pool.query(
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

        res.status(200).json({
            message: "User certifications retrieved successfully",
            certifications: result.rows
        });

    } catch (error) {
        console.error('Error fetching user certifications'),
        res.status(500).json({ error: 'Server error fetching user certifications' });
    }
});

// POST /api/certifications/user/:userId - add certification to user
router.post('/user/:userId', async(req, res) => {
    try{
        const { userId } = req.params;
        const { certificationId, dateObtained, expiryDate, credentialId, credentialUrl, notes } = req.body;

        if (!certificationId || !dateObtained){
            return res.status(400).json({ error: "Certification ID and date obtained are required" });
        }

        const existing = await pool.query(
            'SELECT * FROM user_certifications WHERE user_id = $1 and certification_id = $2', [userId, certificationId]
        );

        if (existing.rows.length > 0){
            return res.status(400).json({ error: "User already has this certification" });
        }

        const result = await pool.query(
            `INSERT INTO user_certifications (user_id, certification_id, date_obtained, expiry_date, credential_id, credential_url, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [userId, certificationId, dateObtained, expiryDate, credentialId, credentialUrl, notes]
        )

        res.status(200).json({
            message: 'Certification was added to user successfully',
            userCertification: result.rows[0]
        });
    } catch (error) {
        console.error('Error adding certification to user:', error),
        res.status(500).json({ error: 'Server error adding certification to user' });
    }
});

// PUT /api/certifications/user/:userID/:certId - Update user certification
router.put('/user/:userId/:certId', async(req, res) => {
    try {
        const { userId, certId } = req.params;
        const { dateObtained, expiryDate, credentialId, credentialUrl, notes } = req.body;

        const existing = await pool.query(
            'SELECT * FROM user_certifications WHERE user_id = $1 AND certification_id = $2', [userId, certId]
        );

        if (existing.rows.length === 0){
            return res.status(404).json({ error: 'Certification was not found' });
        }

        const result = await pool.query(
            `UPDATE user_certifications SET date_obtained = COALESCE ($1, date_obtained), 
            expiry_date = COALESCE($2, expiry_date), 
            credential_id = COALESCE($3, credential_id), 
            credential_url = COALESCE($4, credential_url), 
            notes = COALESCE($5, notes) 
            WHERE user_id = $6 AND certification_id = $7 RETURNING *`,
            [dateObtained, expiryDate, credentialId, credentialUrl, notes, userId, certId]
        );

        return res.status(200).json({
            message: 'Certification was successfully updated',
            userCertification: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating user certification:', error),
        res.status(500).json({ error: "Server error updating user certification" });
    }
});

// DELETE /api/certification/user/:userId/:certId - Remove certification from user
router.delete('/user/:userId/:certId', async(req, res) => {
    try {
        const { userId, certId } = req.params;

        const existing = await pool.query(
            'SELECT * FROM user_certifications WHERE user_id = $1 AND certification_id = $2', [userId, certId]
        );
        
        if (existing.rows.length === 0){
            return res.status(404).json({ error: 'Certification was not found' });
        }

        await pool.query(
            'DELETE FROM user_certifications WHERE user_id = $1 AND certification_id = $2', [userId, certId]
        );

        res.json({
            message: 'Certification removed from user successfully'
        });
    } catch (error) {
        console.error('Error deleting certification from user:', error),
        res.status(500).json({ error: 'Server error deleting user certification' })
    }
});

module.exports = router;