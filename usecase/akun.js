const { dbConnect } = require('../db');

const akun = async (req, res) => {
    // 1. Check user id from req.authorization (Bearer token)
    const userId = req.user.userId; // Assuming you have middleware that sets req.user with userId from JWT

    try {
        const client = await dbConnect();

        // 2. Check if user exists in the database
        const checkUserQuery = 'SELECT nama, email, no_rekening FROM register WHERE id = $1';
        const checkUserValues = [userId];
        const result = await client.query(checkUserQuery, checkUserValues);

        if (result.rows.length === 0) {
            // User not found
            return res.status(404).json({ error: 'Akun tidak ditemukan' });
        }

        // 3. Return nama, email, and no_rekening
        const user = result.rows[0];
        res.status(200).json({
            nama: user.nama,
            email: user.email,
            no_rekening: user.no_rekening
        });

        client.release(); // Release the client back to the pool
    } catch (err) {
        console.error('Error retrieving user account:', err);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data akun' });
    }
};

const transferInquiry = async (req, res) => {
    const { bank_tujuan, no_rekening, jumlah_transfer } = req.body;

    if (!bank_tujuan || !no_rekening || !jumlah_transfer) {
        return res.status(400).json({ error: 'Semua field harus diisi: bank_tujuan, no_rekening, jumlah_transfer' });
    }

    // Check if no_rekening exists in the database
    try {
        const client = await dbConnect();

        // Query to check if the no_rekening exists in the register table
        const checkRekeningQuery = 'SELECT * FROM register WHERE no_rekening = $1';
        const checkRekeningValues = [no_rekening];
        const result = await client.query(checkRekeningQuery, checkRekeningValues);
        const destinationUser = result.rows[0];

        if (result.rows.length === 0) {
            // If no record found with the provided no_rekening
            return res.status(400).json({ error: 'Nomor rekening tidak valid' });
        }

        // If the no_rekening exists, return the same body
        res.status(200).json({
            bank_tujuan,
            no_rekening,
            jumlah_transfer,
            nama:destinationUser.nama
        });

        client.release(); // Release the client back to the pool
    } catch (err) {
        console.error('Error checking rekening:', err);
        res.status(500).json({ error: 'Terjadi kesalahan saat memeriksa nomor rekening' });
    }
};

const transfer = async (req, res) => {
    const { bank_tujuan, no_rekening, nama_pemilik, jumlah_transfer, pin } = req.body;

    // Validate all fields
    if (!bank_tujuan || !no_rekening || !nama_pemilik || !jumlah_transfer || !pin) {
        return res.status(400).json({ error: 'Semua field harus diisi: bank_tujuan, no_rekening, nama_pemilik, jumlah_transfer, pin' });
    }

    try {
        const client = await dbConnect();

        // Example: Retrieving logged in user's PIN from database (replace with your own logic)
        const loggedInUserId = req.user.userId; // Assuming userId is attached via authentication middleware
        const fetchUserQuery = 'SELECT pin FROM register WHERE id = $1';
        const fetchUserValues = [loggedInUserId];
        const userResult = await client.query(fetchUserQuery, fetchUserValues);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        const userPin = userResult.rows[0].pin;

        // Validate PIN
        if (pin !== userPin) {
            return res.status(400).json({ error: 'PIN tidak cocok' });
        }

        // Insert the transfer record into the database
        const insertQuery = `
            INSERT INTO transfer (bank_tujuan, rekening_tujuan, nama_pemilik, jumlah_transfer, userid)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id`;

        const insertValues = [bank_tujuan, no_rekening, nama_pemilik, jumlah_transfer, loggedInUserId];
        const result = await client.query(insertQuery, insertValues);

        const insertedId = result.rows[0].id;

        res.status(200).json({
            message: 'Transfer berhasil',
            transfer: {
                bank_tujuan,
                no_rekening,
                nama_pemilik,
                jumlah_transfer,
                pin
            }
        });

        client.release(); // Release the client back to the pool
    } catch (err) {
        console.error('Error during transfer:', err);
        res.status(500).json({ error: 'Terjadi kesalahan saat melakukan transfer' });
    }
};

module.exports = {
    akun,
    transferInquiry,
    transfer
}