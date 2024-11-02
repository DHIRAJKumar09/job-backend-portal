const UserModel = require('../models/user');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')



const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Input Validation
        if (!username || !email || !password || !role) {
            return res.status(400).json({
                message: 'All fields are required',
                success: false,
            });
        }

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already registered',
                success: false,
            });
        }

        // Hash the password before saving
        const saltRounds = 10; // Number of salt rounds
        const hashedPassword = await bcrypt.hash(password, saltRounds); 

        // Create and save the new user with the role
        const newUser = new UserModel({
            username,
            email,
            password: hashedPassword, // Store hashed password
            role, // Include the user role
        });

        await newUser.save();
        return res.status(201).json({
            message: 'User registered successfully',
            success: true,
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            message: 'Server error',
            success: false,
        });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required',
                success: false
            });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password",
                success: false
            });
        }
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role, // Include role in the token if needed
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );
        return res.status(200).json({
            message: 'Login successful',
            success: true,
            token, // Send token to the client
            role: user.role, 
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};


module.exports = {register,login};