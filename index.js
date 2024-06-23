require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;
const {register,login} = require('./usecase/auth')
const {akun,transferInquiry,transfer} = require('./usecase/akun')
const {mutasi,gantiPassword,gantiPIN} = require('./usecase/akun2')

const bodyParser = require('body-parser');
const authMiddleware = require('./authmiddleware'); // Adjust path as needed
const cors = require('cors'); // Import the cors package

// Use CORS middleware to allow all origins
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

app.post('/register',register)
app.post('/login',login)

// Use the authMiddleware for all routes that require authentication
app.use(authMiddleware);

app.get('/akun',akun)
app.post('/tfinquiry',transferInquiry)
app.post('/tf',transfer)
app.get('/mutasi',mutasi)
app.post('/gantipassword',gantiPassword)
app.post('/gantipin',gantiPIN)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
