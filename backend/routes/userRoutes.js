const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db'); 
const { verifyToken } = require('../middleware'); 

router.put('/change-password', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id; 
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

        res.json({ message: 'Password changed successfully!' });

    } catch (error) {
        console.error("Password change error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;