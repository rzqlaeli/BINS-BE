const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    // Check for Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1]; // Get the token part from the header

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach userId to req.user for use in subsequent middleware/routes
        req.user = {
            userId: decoded.userId
        };

        // Continue to the next middleware or route handler
        next();
    } catch (err) {
        console.error('JWT Error:', err);
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

module.exports = authMiddleware;