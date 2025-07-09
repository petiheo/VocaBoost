// {
//   userId: '4d876ced-9e9a-4fa1-8b6d-4269291350a6'
//   email: 'hoan@gmail.com',
//   role: 'learner'
// }


const authenticate = (req, res, next) => {
  // Tạm gán mock user để test
  req.user = {
    // userId: '5d989deb-f811-479e-beb3-75e8d43db64c', 
    // email: 'bin01677952356@gmail.com',
    // role: 'teacher' 

    userId: '4d876ced-9e9a-4fa1-8b6d-4269291350a6',
    email: 'hoan@gmail.com',
    role: 'learner'
  };
  next();
};

module.exports = authenticate;