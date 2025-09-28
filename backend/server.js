const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRoutes = require('./routes/userRoutes')
const { verifyToken, isAdmin } = require('./middleware');
require('dotenv').config();

const app = express();
const port = process.env.port || 3001;

app.use(cors());
app.use(express.json());
app.use('/api/users',userRoutes);
const updateStoreOverallRating = async (storeId) => {
    try {
        const avgRatingResult = await db.query( 'SELECT AVG(rating) as average_rating FROM ratings WHERE store_id = $1', [storeId] );
        const newOverallRating = parseFloat(avgRatingResult.rows[0].average_rating || 0).toFixed(2);
        await db.query( 'UPDATE stores SET overall_rating = $1 WHERE id = $2', [newOverallRating, storeId] );
    } catch (error) {
        console.error("Error updating store's overall rating:", error);
    }
};

app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, address } = req.body;
    if (!name || name.length < 20 || name.length > 60) { return res.status(400).json({ message: 'Name must be between 20 and 60 characters.' }); }
    if (address && address.length > 400) { return res.status(400).json({ message: 'Address must not exceed 400 characters.' }); }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$/;
    if (!password || !passwordRegex.test(password)) { return res.status(400).json({ message: 'Password must be 8-16 characters long, with one uppercase letter and one special character.' }); }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) { return res.status(400).json({ message: 'Please enter a valid email address.' }); }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.query( 'INSERT INTO users (name, email, password, address) VALUES ($1, $2, $3, $4) RETURNING id, email, role', [name, email, hashedPassword, address] );
        res.status(201).json({ message: 'User registered successfully!', user: newUser.rows[0] });
    } catch (error) {
        if (error.code === '23505') { return res.status(400).json({ message: 'Email already exists.' }); }
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) { return res.status(400).json({ message: 'Email and password are required.' }); }
    try {
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) { return res.status(401).json({ message: 'Invalid credentials. User not found.' }); }
        const user = userResult.rows[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) { return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' }); }
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.json({ message: 'Login successful!', token });
    } catch (error) {
        console.error('--- LOGIN ERROR ---:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
});

app.post('/api/users/update-password', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$/;
    if (!newPassword || !passwordRegex.test(newPassword)) { return res.status(400).json({ message: 'New password must be 8-16 characters long, with one uppercase letter and one special character.' }); }
    try {
        const userResult = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) { return res.status(404).json({ message: 'User not found.' }); }
        const user = userResult.rows[0];
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) { return res.status(401).json({ message: 'Incorrect current password.' }); }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedNewPassword, userId]);
        res.status(200).json({ message: 'Password updated successfully!' });
    } catch (error) {
        console.error('--- UPDATE PASSWORD ERROR ---:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/stores', verifyToken, isAdmin, async (req, res) => {
    const { name, email, address } = req.body;
    if (!name || !email || !address) { return res.status(400).json({ message: 'Name, email, and address are required.' }); }
    try {
        const newStore = await db.query( 'INSERT INTO stores (name, email, address) VALUES ($1, $2, $3) RETURNING *', [name, email, address] );
        res.status(201).json({ message: 'Store added successfully!', store: newStore.rows[0] });
    } catch (error) {
        if (error.code === '23505') { return res.status(400).json({ message: 'A store with this email already exists.' }); }
        console.error('Add Store Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/users/add', verifyToken, isAdmin, async (req, res) => {
    const { name, email, password, address, role } = req.body;
    if (!name || name.length < 20 || name.length > 60) { return res.status(400).json({ message: 'Name must be between 20 and 60 characters.' }); }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$/;
    if (!password || !passwordRegex.test(password)) { return res.status(400).json({ message: 'Password must be 8-16 characters long, with one uppercase letter and one special character.' }); }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUserResult = await db.query( 'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role', [name, email, hashedPassword, address, role] );
        res.status(201).json({ message: 'User added successfully!', user: newUserResult.rows[0] });
    } catch (error) {
        if (error.code === '23505') { return res.status(400).json({ message: 'Email already exists.' }); }
        console.error('--- ADMIN ADD USER ERROR ---:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/users', verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await db.query('SELECT id, name, email, address, role FROM users ORDER BY name ASC');
        res.status(200).json(users.rows);
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/stats', verifyToken, isAdmin, async (req, res) => {
    try {
        const userCount = await db.query('SELECT COUNT(*) FROM users');
        const storeCount = await db.query('SELECT COUNT(*) FROM stores');
        const ratingCount = await db.query('SELECT COUNT(*) FROM ratings');
        res.json({
            totalUsers: parseInt(userCount.rows[0].count),
            totalStores: parseInt(storeCount.rows[0].count),
            totalRatings: parseInt(ratingCount.rows[0].count),
        });
    } catch (error) {
        console.error('Get Stats Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/stores', verifyToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const storesResult = await db.query( `SELECT s.id, s.name, s.email, s.address, s.overall_rating, r.rating AS user_submitted_rating FROM stores s LEFT JOIN ratings r ON s.id = r.store_id AND r.user_id = $1 ORDER BY s.name ASC`, [userId] );
        res.status(200).json(storesResult.rows);
    } catch (error) {
        console.error('Get Stores Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/ratings', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { storeId, rating } = req.body;
    if (!storeId || !rating || rating < 1 || rating > 5) { return res.status(400).json({ message: 'Store ID and a rating between 1 and 5 are required.' }); }
    try {
        const ratingQuery = `INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) ON CONFLICT (user_id, store_id) DO UPDATE SET rating = EXCLUDED.rating RETURNING *;`;
        const newRating = await db.query(ratingQuery, [userId, storeId, rating]);
        await updateStoreOverallRating(storeId);
        res.status(201).json({ message: 'Rating submitted successfully!', rating: newRating.rows[0] });
    } catch (error) {
        console.error('Submit Rating Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/my-store', verifyToken, async (req, res) => {
    const userId = req.user.id;
    if (req.user.role !== 'Store Owner') { 
        return res.status(403).json({ message: 'Access denied. Store Owners only.' }); 
    }
    try {
        const storeResult = await db.query('SELECT * FROM stores WHERE email = $1', [req.user.email]);
        
        if (storeResult.rows.length === 0) { 
            return res.status(404).json({ message: "No store is registered with your email address." }); 
        }
        const store = storeResult.rows[0];

        const ratingsResult = await db.query( `SELECT r.rating, r.created_at, u.name as user_name FROM ratings r JOIN users u ON r.user_id = u.id WHERE r.store_id = $1 ORDER BY r.created_at DESC`, [store.id] );
        res.json({ storeDetails: store, ratings: ratingsResult.rows });
    } catch (error) {
        console.error('Get My Store Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});

