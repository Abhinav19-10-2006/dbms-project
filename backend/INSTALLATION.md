# Backend Installation Note

## ⚠️ bcrypt Installation Issue

The backend dependencies encountered an SSL certificate issue when installing `bcrypt`. This is a known issue with Node.js v24 and SSL certificates.

## Solutions

### Option 1: Use System CA (Recommended)

```bash
cd /Users/abhinavkeshav/libraryproject/backend
NODE_OPTIONS=--use-system-ca npm install
```

### Option 2: Use bcryptjs (Alternative)

If the above doesn't work, you can use `bcryptjs` (pure JavaScript implementation) instead:

1. Update `backend/package.json`:
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",  // Instead of "bcrypt": "^5.1.1"
    ...
  }
}
```

2. Update imports in controllers:
```javascript
// Change from:
const bcrypt = require('bcrypt');

// To:
const bcrypt = require('bcryptjs');
```

The API remains the same, so no other code changes are needed.

### Option 3: Manual Installation

```bash
cd /Users/abhinavkeshav/libraryproject/backend

# Install other dependencies first
npm install express pg jsonwebtoken cors dotenv

# Install nodemon as dev dependency
npm install --save-dev nodemon

# Try bcrypt with system CA
NODE_OPTIONS=--use-system-ca npm install bcrypt
```

## Verification

After successful installation, verify with:

```bash
cd /Users/abhinavkeshav/libraryproject/backend
npm list bcrypt
# OR
npm list bcryptjs
```

## Running the Backend

Once dependencies are installed:

```bash
cd /Users/abhinavkeshav/libraryproject/backend
npm run dev
```

The server should start on http://localhost:5000
