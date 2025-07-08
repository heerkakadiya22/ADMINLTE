const { Role } = require("../models");

class RoleRepository {
  async findAll() {
    return await Role.findAll();
  }

  async getById(id) {
    return await Role.findByPk(id);
  }

  async getByName(name) {
    return await Role.findOne({ where: { name } });
  }

  async create(data) {
    return await Role.create(data);
  }

  async update(id, data) {
    const role = await Role.findByPk(id);
    if (!role) return null;
    return await role.update(data);
  }

  async delete(id) {
    const role = await Role.findByPk(id);
    if (!role) return null;

    await role.destroy();
    return true;
  }
}

module.exports = new RoleRepository();
