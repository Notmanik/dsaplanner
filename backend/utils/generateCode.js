const { v4: uuidv4 } = require('uuid');

const generateUniqueFriendCode = () => {
  return uuidv4().substring(0, 8).toUpperCase();
};

module.exports = { generateUniqueFriendCode };
