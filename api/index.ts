const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser'); // Import body-parser
const app = express();

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
    if (!newUser.name || !newUser.email || !newUser.username || !newUser.password) {
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

app.listen(3000, () => console.log('Server ready on port 3000.'));

module.exports = app;

