const { Router } = require('express');
const authRoutes = require('./authRoutes');
const deviceRoutes = require('./deviceRoutes');
const accessLogRoutes = require('./accessLogRoutes');
const systemLogRoutes = require('./systemLogRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/devices', deviceRoutes);
router.use('/logs/acesso', accessLogRoutes);
router.use('/logs/sistema', systemLogRoutes);

module.exports = router;
