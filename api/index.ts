const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.get('/', (req, res) => res.send('Express on Vercel'));

app.get('/data', (req, res) => {
  const filePath = path.join(__dirname, 'db.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading database file');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(data.user);
    }
  });
});

app.listen(3000, () => console.log('Server ready on port 3000.'));

module.exports = app;

