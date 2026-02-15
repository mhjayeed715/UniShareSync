let app;

try {
  app = require('../server');
} catch (error) {
  console.error('Failed to load server:', error);
  const express = require('express');
  app = express();
  app.use('*', (req, res) => {
    res.status(500).json({ 
      error: 'Server failed to start', 
      message: error.message,
      stack: error.stack 
    });
  });
}

module.exports = app;
