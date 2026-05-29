const { Router } = require('express');
const accessLogController = require('../controllers/accessLogController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = Router();

router.use(authenticate);

router.get('/', accessLogController.list);
router.get('/:id', accessLogController.getById);
router.get('/device/:deviceId', accessLogController.getByDevice);
router.get('/user/:userId', accessLogController.getByUser);

module.exports = router;
