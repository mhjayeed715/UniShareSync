export const validateEmail = (email) => {
  const regex = /^[\w.-]+@[\w.-]+\.ac\.bd$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};
