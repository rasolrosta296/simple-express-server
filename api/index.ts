const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const app = express();

const SECRET_KEY = crypto.randomBytes(64).toString('hex'); // Generate secret key

app.use(bodyParser.json()); // Use body-parser middleware

app.get('/', (req, res) => res.send('Express on Vercel'));

app.get('/data', (req, res) => {
  const filePath = path.join(__dirname, 'db.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading database file');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    }
  });
});

app.post('/register', (req, res) => {
  const filePath = path.join(__dirname, 'db.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading database file');
    }
    
    const db = JSON.parse(data);
    const newUser = req.body;

    // Validate new user data (optional, add more checks as needed)
    if (!newUser.name || !newUser.email || !newUser.password) {
      return res.status(400).send('Invalid user data');
    }

    // Generate a new ID for the user
    const newId = db.user.length > 0 ? db.user[db.user.length - 1].id + 1 : 1;
    newUser.id = newId;

    // Add new user to the database
    db.user.push(newUser);

    // Write updated database back to file
    fs.writeFile(filePath, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error writing to database file');
      }

      res.status(201).send('User registered successfully');
    });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  const filePath = path.join(__dirname, 'db.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading database file');
    }

    const db = JSON.parse(data);
    const user = db.user.find(u => u.username === username && u.password === password);

    if (user) {
      const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful', token });
    } else {
      res.status(401).send('Invalid username or password');
    }
  });
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // No token provided
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Invalid token
    }
    req.user = user;
    next();
  });
};

app.get('/post', authenticateToken, (req, res) => {
  const userId = parseInt(req.query.id);

  if (!userId) {
    return res.status(400).send('User ID is required');
  }

  const filePath = path.join(__dirname, 'db.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading database file');
    }

    const db = JSON.parse(data);
    const user = db.user.find(u => u.id === userId);

    if (user) {
      res.status(200).json(user.posts);
    } else {
      res.status(404).send('User not found');
    }
  });
});

app.listen(3000, () => console.log('Server ready on port 3000.'));

module.exports = app;

