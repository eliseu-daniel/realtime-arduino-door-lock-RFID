const { Router } = require('express');
const authRoutes = require('./authRoutes');
const deviceRoutes = require('./deviceRoutes');
const accessLogRoutes = require('./accessLogRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/devices', deviceRoutes);
router.use('/logs', accessLogRoutes);

module.exports = router;
