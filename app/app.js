// Simple Node.js app
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('hello from eks shimi1');
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});