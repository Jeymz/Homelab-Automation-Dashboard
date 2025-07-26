const path = require('path');
const express = require('express');
const { security } = require('./middleware');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(security());

// Serve static files
app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/api/gitlab', routes.gitlab);
app.use('/api/github', routes.github);
app.use('/api/azure', routes.azure);
app.use('/api/namecheap', routes.namecheap);
app.use('/api/wave', routes.wave);

app.use('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Automation dashboard running at http://localhost:${PORT}`); // eslint-disable-line no-console
  });
}

module.exports = app;
