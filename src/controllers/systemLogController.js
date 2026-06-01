const systemLogService = require('../services/systemLogService');
const { asyncHandler } = require('../middlewares/errorHandler');

const systemLogController = {
  list: asyncHandler(async (req, res) => {
    const { limit, offset } = req.query;
    const logs = await systemLogService.list({
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0,
    });
    res.json(logs);
  }),

  getById: asyncHandler(async (req, res) => {
    const log = await systemLogService.getById(req.params.id);
    res.json(log);
  }),

  getByUser: asyncHandler(async (req, res) => {
    const { limit, offset } = req.query;
    const logs = await systemLogService.getByUser(req.params.userId, {
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0,
    });
    res.json(logs);
  }),

  getByAction: asyncHandler(async (req, res) => {
    const { limit, offset } = req.query;
    const logs = await systemLogService.getByAction(req.params.acao, {
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0,
    });
    res.json(logs);
  }),

  getByResource: asyncHandler(async (req, res) => {
    const { limit, offset } = req.query;
    const logs = await systemLogService.getByResource(req.params.recurso, {
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0,
    });
    res.json(logs);
  }),
};

module.exports = systemLogController;
