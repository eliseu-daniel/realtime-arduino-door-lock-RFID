const deviceRepository = require('../repositories/deviceRepository');
const { NotFoundError, ValidationError } = require('../utils/errors');

const deviceService = {
  async list() {
    return deviceRepository.findAll();
  },

  async getById(id) {
    const device = await deviceRepository.findById(id);
    if (!device) throw new NotFoundError('Dispositivo não encontrado');
    return device;
  },

  async create({ nome, serial_number }) {
    const existente = await deviceRepository.findBySerialNumber(serial_number);
    if (existente) {
      throw new ValidationError('Número de série já cadastrado');
    }
    return deviceRepository.create({ nome, serial_number });
  },

  async update(id, data) {
    await this.getById(id);
    if (data.serial_number) {
      const existente = await deviceRepository.findBySerialNumber(data.serial_number);
      if (existente && existente.id !== id) {
        throw new ValidationError('Número de série já cadastrado');
      }
    }
    return deviceRepository.update(id, data);
  },

  async delete(id) {
    await this.getById(id);
    return deviceRepository.delete(id);
  },
};

module.exports = deviceService;
