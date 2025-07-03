const authService = require('../services/auth.service');

class AuthController {
    async register(req, res) {
        try {
            const { email, password, role = 'learner' } = req.body;

            const isExistEmail = await authService.findUserByEmail(email);
            if (isExistEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email already registered"
                });
            }

            return res.status(201).json({
                success: true,
                message: "Registration successful. Please check your email for verification."
            })
            
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error
            });
        }
    }
}

module.exports = new AuthController()