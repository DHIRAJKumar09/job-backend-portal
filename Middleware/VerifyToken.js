const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied, no token provided' });
    }

    // Extract the token from the 'Bearer <token>' format
    const token = authHeader.split(' ')[1];

    try {
        // Verify the token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is set in your environment
        req.user = decoded; // Attach the decoded user payload to the request
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = verifyToken;
