const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: '68090a35bed10a6352949c5', role: 'admin' },
  'educational_platform_secret_key_2023',
  { expiresIn: '30d' }
);

console.log('Generated token:');
console.log(token);
