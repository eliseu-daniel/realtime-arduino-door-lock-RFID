const authService = require('../services/authService');
const systemLogService = require('../services/systemLogService');
const { asyncHandler } = require('../middlewares/errorHandler');

const authController = {
  register: asyncHandler(async (req, res) => {
    const { nome, email, senha, role } = req.body;
    const result = await authService.register({ nome, email, senha, role });
    
    // Registrar registro do sistema
    systemLogService.create({
      acao: 'REGISTRO',
      recurso: 'usuarios',
      metodo: 'POST',
      rota: '/api/auth/register',
      ip_address: getClientIp(req),
      user_agent: req.get('user-agent'),
      detalhes: { email },
    }).catch(err => {
      console.error('[AuthController] Erro ao registrar log REGISTRO:', err.message);
    });
    
    res.status(201).json(result);
  }),

  login: asyncHandler(async (req, res) => {
    const { email, senha } = req.body;
    const result = await authService.login({ email, senha });
    
    // Registrar login do sistema
    systemLogService.create({
      user_id: result.user?.id || null,
      acao: 'LOGIN',
      recurso: 'autenticacao',
      metodo: 'POST',
      rota: '/api/auth/login',
      ip_address: getClientIp(req),
      user_agent: req.get('user-agent'),
      detalhes: { email },
    }).catch(err => {
      console.error('[AuthController] Erro ao registrar log LOGIN:', err.message);
    });
    
    res.json(result);
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.id);
    res.json(user);
  }),
};

/**
 * Obtém o IP do cliente
 */
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'desconhecido'
  );
}

module.exports = authController;
