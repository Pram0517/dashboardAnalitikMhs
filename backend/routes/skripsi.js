const express = require('express');
const router = express.Router();

// Get all skripsi
router.get('/', (req, res) => {
  res.json({
    status: 'Success',
    data: []
  });
});

// Get skripsi by id
router.get('/:id', (req, res) => {
  res.json({
    status: 'Success',
    data: null
  });
});

// Create skripsi
router.post('/', (req, res) => {
  res.json({
    status: 'Success',
    message: 'Skripsi created'
  });
});

module.exports = router;