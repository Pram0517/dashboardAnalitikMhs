const bcrypt = require('bcryptjs');

const hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
const password = 'test123';

console.log('Testing password comparison...');
console.log('Hash:', hash);
console.log('Password:', password);

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Password match result:', result);
  }
});