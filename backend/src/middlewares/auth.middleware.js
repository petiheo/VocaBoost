
const authenticate = (req, res, next) => {
  // Tạm gán mock user để test
  req.user = {
    userId: '16ba97c6-15f3-4515-88af-fd74285d47ae',
    email: 'teacher@vocaboost.com',
    role: 'teacher'

  // // Mock học viên 1 
  //   userId: '9e4da817-8fb9-422c-9cfe-122752a3ff5d',
  //   email: 'learner1@vb.com',
  //   role: 'learner'

  // // Mock học viên 2 
  //   userId: 'e4a1362e-eeac-43bc-87ff-f4121ed11dab',
  //   email: 'learner2@vb.com',
  //   role: 'learner'

  // // Mock học viên 3
  //   userId: '653d9fb9-54db-415a-91e2-f3aa549f1eba',
  //   email: 'learner3@vb.com',
  //   role: 'learner'

  };
  next();
};

module.exports = authenticate;