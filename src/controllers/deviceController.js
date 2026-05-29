const deviceService = require('../services/deviceService');
const { asyncHandler } = require('../middlewares/errorHandler');

const deviceController = {
  list: asyncHandler(async (req, res) => {
    const devices = await deviceService.list();
    res.json(devices);
  }),

  getById: asyncHandler(async (req, res) => {
    const device = await deviceService.getById(req.params.id);
    res.json(device);
  }),

  create: asyncHandler(async (req, res) => {
    const device = await deviceService.create(req.body);
    res.status(201).json(device);
  }),

  update: asyncHandler(async (req, res) => {
    const device = await deviceService.update(req.params.id, req.body);
    res.json(device);
  }),

  delete: asyncHandler(async (req, res) => {
    await deviceService.delete(req.params.id);
    res.status(204).end();
  }),
};

module.exports = deviceController;
