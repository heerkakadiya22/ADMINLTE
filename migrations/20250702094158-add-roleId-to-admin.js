'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'admin', // your admin table name
      'roleId',
      {
        type: Sequelize.INTEGER,
        allowNull: true, // or false if you want it required
        references: {
          model: 'roles', // target table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // adjust if you want 'CASCADE'
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('admin', 'roleId');
  }
};
