const authService = require('../services/authService');
const { asyncHandler } = require('../middlewares/errorHandler');

const authController = {
  register: asyncHandler(async (req, res) => {
    const { nome, email, senha, role } = req.body;
    const result = await authService.register({ nome, email, senha, role });
    res.status(201).json(result);
  }),

  login: asyncHandler(async (req, res) => {
    const { email, senha } = req.body;
    const result = await authService.login({ email, senha });
    res.json(result);
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.id);
    res.json(user);
  }),
};

module.exports = authController;
