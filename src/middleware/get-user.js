const jwt = require('jsonwebtoken');

module.exports = (token) => {
  if (!token) {
    return null;
  }
  const authToken = token.split(' ')[1];
  if (!authToken || authToken === '') {
    return null;
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(authToken, 'somesupersecretkey');
  } catch (err) {
    return null;
  }
  if (!decodedToken) {
    return null;
  }
  return decodedToken;
};
