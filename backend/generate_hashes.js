const bcrypt = require('bcryptjs');

async function getHashes() {
    const adminHash = await bcrypt.hash('admin123', 10);
    const studentHash = await bcrypt.hash('student123', 10);
    console.log('Admin Hash:', adminHash);
    console.log('Student Hash:', studentHash);
}

getHashes();
