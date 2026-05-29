const { ValidationError } = require('../utils/errors');

function validateRegister(req, res, next) {
  const { nome, email, senha } = req.body;
  const errors = [];
  if (!nome || typeof nome !== 'string' || nome.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    errors.push('E-mail inválido');
  }
  if (!senha || typeof senha !== 'string' || senha.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }
  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }
  req.body.nome = nome.trim();
  req.body.email = email.trim().toLowerCase();
  next();
}

function validateLogin(req, res, next) {
  const { email, senha } = req.body;
  const errors = [];
  if (!email || typeof email !== 'string') {
    errors.push('E-mail é obrigatório');
  }
  if (!senha || typeof senha !== 'string') {
    errors.push('Senha é obrigatória');
  }
  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }
  next();
}

function validateDevice(req, res, next) {
  const { nome, serial_number } = req.body;
  const errors = [];
  if (!nome || typeof nome !== 'string' || nome.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }
  if (!serial_number || typeof serial_number !== 'string' || serial_number.trim().length < 1) {
    errors.push('Número de série é obrigatório');
  }
  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }
  req.body.nome = nome.trim();
  req.body.serial_number = serial_number.trim();
  next();
}

module.exports = { validateRegister, validateLogin, validateDevice };
