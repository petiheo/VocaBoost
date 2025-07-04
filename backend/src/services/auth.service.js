const userModel = require('../models/user.model');

class AuthService {
  async findUserByEmail(email) {
    return await userModel.findByEmail(email);
  }
}

module.exports = new AuthService();
