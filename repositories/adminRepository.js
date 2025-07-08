const { Admin, Role, Sequelize } = require("../models");
const { Op } = require("sequelize");

module.exports = {
  findById: (id) => Admin.findByPk(id),

  findAll: () => Admin.findAll(),

  findWithRoles: () =>
    Admin.findAll({
      attributes: {
        include: [[Sequelize.col("role.name"), "role_name"]],
      },
      include: {
        model: Role,
        as: "role",
        attributes: [],
      },
    }),

  findByUsernameOrEmail: (username, email) =>
    Admin.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    }),

  createUser: (data) => Admin.create(data),

  updateUser: (id, data) => Admin.update(data, { where: { id } }),

  deleteUser: (id) => Admin.destroy({ where: { id } }),
};
