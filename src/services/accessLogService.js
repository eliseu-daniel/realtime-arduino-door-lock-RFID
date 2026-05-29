const accessLogRepository = require('../repositories/accessLogRepository');
const { NotFoundError } = require('../utils/errors');

const accessLogService = {
  async list({ limit, offset } = {}) {
    return accessLogRepository.findAll({ limit, offset });
  },

  async getById(id) {
    const log = await accessLogRepository.findById(id);
    if (!log) throw new NotFoundError('Log não encontrado');
    return log;
  },

  async getByDevice(deviceId, { limit, offset } = {}) {
    return accessLogRepository.findByDevice(deviceId, { limit, offset });
  },

  async getByUser(userId, { limit, offset } = {}) {
    return accessLogRepository.findByUser(userId, { limit, offset });
  },

  async create(data) {
    return accessLogRepository.create(data);
  },
};

module.exports = accessLogService;
