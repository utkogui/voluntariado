const express = require('express');
const router = express.Router();

// Placeholder para rotas de comunicação
// Será implementado na tarefa 4.1

router.get('/messages', (req, res) => {
  res.status(501).json({ message: 'Funcionalidade em desenvolvimento' });
});

router.post('/messages', (req, res) => {
  res.status(501).json({ message: 'Funcionalidade em desenvolvimento' });
});

module.exports = router;
