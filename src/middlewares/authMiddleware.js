const { verifyToken } = require('../utils/jwt');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new UnauthorizedError('Token não fornecido');
  }
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new UnauthorizedError('Formato de token inválido');
  }
  try {
    const decoded = verifyToken(parts[1]);
    req.user = decoded;
    next();
  } catch (err) {
    throw new UnauthorizedError('Token inválido ou expirado');
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Usuário não autenticado');
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Você não tem permissão para acessar este recurso');
    }
    next();
  };
}

module.exports = { authenticate, authorize };
