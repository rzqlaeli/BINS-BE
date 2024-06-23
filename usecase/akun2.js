const { dbConnect } = require('../db'); // Replace with your database connection function

const mutasi = async (req, res) => {
    try {
        const client = await dbConnect();

        // Query to fetch all transfers for the logged-in user
        const fetchTransfersQuery = 'SELECT * FROM transfer WHERE userid = $1';
        const fetchTransfersValues = [req.user.userId]; // Assuming userId is attached via authentication middleware
        const result = await client.query(fetchTransfersQuery, fetchTransfersValues);

        // If no transfers found, return empty array
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tidak ada mutasi untuk pengguna ini' });
        }

        // Return list of transfers
        res.status(200).json({
            transfers: result.rows
        });

        client.release(); // Release the client back to the pool
    } catch (err) {
        console.error('Error fetching transfers:', err);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil mutasi' });
    }
};

const gantiPIN = async (req, res) => {
    const { pin_lama, pin_baru, konfirmasi_pin_baru } = req.body;

    // Validate all fields are present
    if (!pin_lama || !pin_baru || !konfirmasi_pin_baru) {
        return res.status(400).json({ error: 'Semua field harus diisi: pin_lama, pin_baru, konfirmasi_pin_baru' });
    }

    // Compare pin_baru with konfirmasi_pin_baru
    if (pin_baru !== konfirmasi_pin_baru) {
        return res.status(400).json({ error: 'PIN baru dan konfirmasi PIN tidak sama' });
    }

    try {
        const client = await dbConnect();

        // Retrieve user information including current pin
        const fetchUserQuery = 'SELECT id, pin FROM register WHERE id = $1';
        const fetchUserValues = [req.user.userId]; // Assuming userId is attached via authentication middleware
        const userResult = await client.query(fetchUserQuery, fetchUserValues);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        const userData = userResult.rows[0];
        const currentPin = userData.pin;

        // Compare pin_lama with currentPin
        if (pin_lama !== currentPin) {
            return res.status(400).json({ error: 'PIN lama salah' });
        }

        // Update PIN in the database
        const updatePINQuery = 'UPDATE register SET pin = $1 WHERE id = $2';
        const updatePINValues = [pin_baru, userData.id];
        await client.query(updatePINQuery, updatePINValues);

        res.status(200).json({ message: 'PIN berhasil diubah' });

        client.release(); // Release the client back to the pool
    } catch (err) {
        console.error('Error changing PIN:', err);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengubah PIN' });
    }
};

const gantiPassword = async (req, res) => {
    const { password_lama, password_baru, konfirmasi_password_baru } = req.body;

    // Validate all fields are present
    if (!password_lama || !password_baru || !konfirmasi_password_baru) {
        return res.status(400).json({ error: 'Semua field harus diisi: password_lama, password_baru, konfirmasi_password_baru' });
    }

    // Compare password_baru with konfirmasi_password_baru
    if (password_baru !== konfirmasi_password_baru) {
        return res.status(400).json({ error: 'Password baru dan konfirmasi password tidak sama' });
    }

    try {
        const client = await dbConnect();

        // Retrieve user information including current password
        const fetchUserQuery = 'SELECT id, password FROM register WHERE id = $1';
        const fetchUserValues = [req.user.userId]; // Assuming userId is attached via authentication middleware
        const userResult = await client.query(fetchUserQuery, fetchUserValues);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        const userData = userResult.rows[0];
        const currentPassword = userData.password;

        // Compare password_lama with currentPassword
        if (password_lama !== currentPassword) {
            return res.status(400).json({ error: 'Password lama salah' });
        }

        // Update password in the database
        const updatePasswordQuery = 'UPDATE register SET password = $1 WHERE id = $2';
        const updatePasswordValues = [password_baru, userData.id];
        await client.query(updatePasswordQuery, updatePasswordValues);

        res.status(200).json({ message: 'Password berhasil diubah' });

        client.release(); // Release the client back to the pool
    } catch (err) {
        console.error('Error changing password:', err);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengubah password' });
    }
};

module.exports = {
    mutasi,
    gantiPassword,
    gantiPIN
};
