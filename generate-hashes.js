// Run this with: node generate-hashes.js
const bcrypt = require('bcryptjs');

const password = 'admin123';
const saltRounds = 10;

async function generateHashes() {
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('\nBcrypt hash for password "admin123":');
  console.log(hash);
  console.log('\nUpdate your seed.sql with this hash for all test users.');
}

generateHashes();
