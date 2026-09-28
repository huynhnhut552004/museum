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

  randomUserTag: (length = 5) => {
    const min = 10 ** (length - 1);
    const max = 10 ** length;
    return crypto.randomInt(min, max).toString();
  },
};

module.exports = generateUtils;