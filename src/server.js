const path = require('path');
const express = require('express');
const security = require('./middleware/security');

const gitlabRoutes = require('./routes/gitlabRoutes');
const githubRoutes = require('./routes/githubRoutes');
const azureRoutes = require('./routes/azureRoutes');
const namecheapRoutes = require('./routes/namecheapRoutes');
const waveRoutes = require('./routes/waveRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(security());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/gitlab', gitlabRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/azure', azureRoutes);
app.use('/api/namecheap', namecheapRoutes);
app.use('/api/wave', waveRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Automation dashboard running at http://localhost:${PORT}`); // eslint-disable-line no-console
  });
}

module.exports = app;
