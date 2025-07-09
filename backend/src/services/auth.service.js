const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const AuthToken = require('../models/authToken.model');
const ms = require('ms');

class AuthService {
  async findUserByEmail(email) {
    return await userModel.findByEmail(email);
  }

  async insertIntoUsers(email, password, role) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await userModel.create(email, hashedPassword, role);
  }

  async insertIntoAuthTokens(token, userId, tokenType, expiresIn) {
    const expiredAt = new Date(Date.now() + ms(expiresIn));
    return await AuthToken.create(token, userId, tokenType, expiredAt);
  }

  async validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = new AuthService();
