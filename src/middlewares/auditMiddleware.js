const systemLogService = require('../services/systemLogService');

// Rotas que não devem ser auditadas
const EXCLUDED_ROUTES = ['/health', '/api/auth/login', '/api/auth/register'];

async function auditMiddleware(req, res, next) {
  const startTime = Date.now();
  const originalJson = res.json;

  // Interceptar a resposta
  res.json = function (data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Determinar resultado baseado no status code
    const resultado =
      statusCode >= 200 && statusCode < 300
        ? 'sucesso'
        : statusCode >= 400
        ? 'erro'
        : 'pendente';

    // Registrar log assincronamente (não bloqueia a resposta)
    logAction({
      user_id: req.user?.id || null,
      acao: getAction(req.method, req.path),
      recurso: getResource(req.path),
      metodo: req.method,
      rota: req.path,
      status_code: statusCode,
      ip_address: getClientIp(req),
      user_agent: req.get('user-agent'),
      detalhes: {
        duration,
        query: Object.keys(req.query).length > 0 ? req.query : null,
        params: Object.keys(req.params).length > 0 ? req.params : null,
      },
      resultado,
      mensagem: data?.message || getStatusMessage(statusCode),
    }).catch((err) => {
      console.error('[AuditMiddleware] Erro ao registrar log:', err.message);
    });

    // Chamar o json original
    return originalJson.call(this, data);
  };

  next();
}

/**
 * Registra uma ação no banco de dados
 */
async function logAction({
  user_id,
  acao,
  recurso,
  metodo,
  rota,
  status_code,
  ip_address,
  user_agent,
  detalhes,
  resultado,
  mensagem,
}) {
  try {
    await systemLogService.create({
      user_id,
      acao,
      recurso,
      metodo,
      rota,
      ip_address,
      user_agent,
      detalhes,
    });

    // Atualizar resultado após criação
    // (idealmente isso seria feito de forma mais elegante)
  } catch (error) {
    console.error('[AuditMiddleware] Erro ao criar log:', error.message);
  }
}

/**
 * Determina a ação baseada no método HTTP e rota
 */
function getAction(method, path) {
  if (path.includes('/auth/login')) return 'LOGIN';
  if (path.includes('/auth/logout')) return 'LOGOUT';
  if (path.includes('/auth/register')) return 'REGISTRO';

  switch (method) {
    case 'GET':
      return 'VISUALIZACAO';
    case 'POST':
      return 'CRIACAO';
    case 'PUT':
    case 'PATCH':
      return 'ATUALIZACAO';
    case 'DELETE':
      return 'DELECAO';
    default:
      return 'ACAO_DESCONHECIDA';
  }
}

/**
 * Extrai o recurso da rota
 */
function getResource(path) {
  const parts = path.split('/').filter(Boolean);
  // Remove 'api' se existir
  if (parts[0] === 'api') parts.shift();
  return parts[0] || 'sistema';
}

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

/**
 * Obtém mensagem de status HTTP
 */
function getStatusMessage(statusCode) {
  const messages = {
    200: 'OK',
    201: 'Criado',
    204: 'Sem conteúdo',
    400: 'Requisição inválida',
    401: 'Não autenticado',
    403: 'Acesso proibido',
    404: 'Não encontrado',
    500: 'Erro interno do servidor',
  };
  return messages[statusCode] || 'Status desconhecido';
}

module.exports = auditMiddleware;
