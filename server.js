const express = require('express');
const app = express();
const port = 4000;

app.get('/', (req, res) => {
  res.send('Hello, World from GitHub Codespace!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`App listening at http://localhost:${port}`);
});
