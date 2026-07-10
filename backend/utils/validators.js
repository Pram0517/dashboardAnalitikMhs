const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Minimal 6 karakter
  return password.length >= 6;
};

const validatePhone = (phone) => {
  const phoneRegex = /^(\+62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone);
};

const validateNPM = (npm) => {
  // Format: 6 digit angka
  return /^\d{6}$/.test(npm);
};

const validateNIP = (nip) => {
  // Format: 18 digit angka
  return /^\d{18}$/.test(nip);
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateNPM,
  validateNIP
};