const { dbConnect } = require('../db');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const nama = req.body?.nama || ""
    const email = req.body?.email || ""
    const password = req.body?.password || ""
    const pin = req.body?.pin || ""
    // Validate email format using a regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'email tidak valid' });
    }

    if (!nama || !email || !password || !pin) {
        return res.status(400).json({ error: 'semua field harus di isi' });
    }

    try {
        const client = await dbConnect();

        // Check if email already exists
        const checkEmailQuery = 'SELECT id FROM register WHERE email = $1';
        const checkEmailValues = [email];
        const existingUser = await client.query(checkEmailQuery, checkEmailValues);

        if (existingUser.rows.length > 0) {
            // Email already exists
            return res.status(400).json({ error: 'Email sudah di pakai' });
        }

        // Generate unique random 8-digit number (excluding "21" prefix)
        // Generate unique random 8-digit number
        const randomNum = Math.floor(10000000 + Math.random() * 90000000); // Generates a random number between 10000000 and 99999999
        const uniqueNumber = '21' + randomNum;

        // Perform the INSERT operation
        const insertQuery = `
      INSERT INTO register (nama, email, password, pin, no_rekening)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id`;

        const insertValues = [nama, email, password, pin, uniqueNumber];
        const result = await client.query(insertQuery, insertValues);

        const insertedId = result.rows[0].id;

        // Generate JWT token
        const token = jwt.sign({ userId: insertedId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'User registered successfully'});

        client.release(); // Release the client back to the pool
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'An error occurred while registering user' });
    }
};

const login = async (req, res) => {
    const email = req.body?.email || "";
    const password = req.body?.password || "";

    // Validate email format using a regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email tidak valid' });
    }

    try {
        const client = await dbConnect();

        // Check if email exists in the database
        const checkEmailQuery = 'SELECT id, password FROM register WHERE email = $1';
        const checkEmailValues = [email];
        const result = await client.query(checkEmailQuery, checkEmailValues);

        if (result.rows.length === 0) {
            // Email not found
            return res.status(400).json({ error: 'Email tidak terdaftar' });
        }

        // Compare provided password with the hashed password from the database
        const hashedPassword = result.rows[0].password;
        // Replace this with your password comparison method (e.g., bcrypt.compare)
        if (password !== hashedPassword) {
            return res.status(400).json({ error: 'Password tidak cocok' });
        }

        // If email and password are correct, generate JWT token
        const userId = result.rows[0].id;
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '10y' });

        res.status(200).json({ message: 'Login berhasil', userId, token });

        client.release(); // Release the client back to the pool
    } catch (err) {
        console.error('Error logging in user:', err);
        res.status(500).json({ error: 'Terjadi kesalahan saat proses login' });
    }
};


module.exports = {
    register,
    login
};
