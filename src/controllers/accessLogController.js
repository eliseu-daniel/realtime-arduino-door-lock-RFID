const accessLogService = require('../services/accessLogService');
const { asyncHandler } = require('../middlewares/errorHandler');

const accessLogController = {
  list: asyncHandler(async (req, res) => {
    const { limit, offset } = req.query;
    const logs = await accessLogService.list({
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0,
    });
    res.json(logs);
  }),

  getById: asyncHandler(async (req, res) => {
    const log = await accessLogService.getById(req.params.id);
    res.json(log);
  }),

  getByDevice: asyncHandler(async (req, res) => {
    const { limit, offset } = req.query;
    const logs = await accessLogService.getByDevice(req.params.deviceId, {
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0,
    });
    res.json(logs);
  }),

  getByUser: asyncHandler(async (req, res) => {
    const { limit, offset } = req.query;
    const logs = await accessLogService.getByUser(req.params.userId, {
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0,
    });
    res.json(logs);
  }),
};

module.exports = accessLogController;
