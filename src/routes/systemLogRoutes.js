const { Router } = require('express');
const systemLogController = require('../controllers/systemLogController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = Router();

router.use(authenticate);

router.get('/', systemLogController.list);
router.get('/:id', systemLogController.getById);
router.get('/user/:userId', systemLogController.getByUser);
router.get('/action/:acao', systemLogController.getByAction);
router.get('/resource/:recurso', systemLogController.getByResource);

module.exports = router;
