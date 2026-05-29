const { Router } = require('express');
const deviceController = require('../controllers/deviceController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validateDevice } = require('../middlewares/validationMiddleware');

const router = Router();

router.use(authenticate);

router.get('/', deviceController.list);
router.get('/:id', deviceController.getById);
router.post('/', authorize('admin'), validateDevice, deviceController.create);
router.put('/:id', authorize('admin'), deviceController.update);
router.delete('/:id', authorize('admin'), deviceController.delete);

module.exports = router;
