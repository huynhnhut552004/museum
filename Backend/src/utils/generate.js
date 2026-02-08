const crypto = require('crypto');

const generateUtils = {
  randomString: (length = 16) => {
    return crypto.randomBytes(length).toString('hex');
  },
  
  randomOTP: (length = 6) => {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
  },
};

module.exports = generateUtils;