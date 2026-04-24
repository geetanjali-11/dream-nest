const sanitizeUser = (userDocument) => {
  const user = userDocument.toObject ? userDocument.toObject() : { ...userDocument };
  delete user.password;
  return user;
};

module.exports = { sanitizeUser };
