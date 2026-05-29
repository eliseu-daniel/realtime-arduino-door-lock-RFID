const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const { generateToken } = require('../utils/jwt');
const { UnauthorizedError, ValidationError } = require('../utils/errors');

const SALT_ROUNDS = 10;

const authService = {
  async register({ nome, email, senha, role }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ValidationError('E-mail já cadastrado');
    }
    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    const user = await userRepository.create({ nome, email, senha: senhaHash, role });
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return { user, token };
  },

  async login({ email, senha }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Credenciais inválidas');
    }
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      throw new UnauthorizedError('Credenciais inválidas');
    }
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },

  async getProfile(userId) {
    return userRepository.findById(userId);
  },
};

module.exports = authService;
