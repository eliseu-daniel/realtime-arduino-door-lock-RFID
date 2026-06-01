const systemLogRepository = require('../repositories/systemLogRepository');
const { NotFoundError } = require('../utils/errors');

const systemLogService = {
  async list({ limit, offset } = {}) {
    return systemLogRepository.findAll({ limit, offset });
  },

  async getById(id) {
    const log = await systemLogRepository.findById(id);
    if (!log) throw new NotFoundError('Log não encontrado');
    return log;
  },

  async getByUser(userId, { limit, offset } = {}) {
    return systemLogRepository.findByUser(userId, { limit, offset });
  },

  async getByAction(acao, { limit, offset } = {}) {
    return systemLogRepository.findByAction(acao, { limit, offset });
  },

  async getByResource(recurso, { limit, offset } = {}) {
    return systemLogRepository.findByResource(recurso, { limit, offset });
  },

  async create({
    user_id,
    acao,
    recurso,
    metodo,
    rota,
    ip_address,
    user_agent,
    detalhes,
  }) {
    return systemLogRepository.create({
      user_id,
      acao,
      recurso,
      metodo,
      rota,
      ip_address,
      user_agent,
      detalhes,
      resultado: 'pendente',
    });
  },

  async updateResult(id, { resultado, status_code, mensagem }) {
    return systemLogRepository.update(id, { resultado, status_code, mensagem });
  },
};

module.exports = systemLogService;
