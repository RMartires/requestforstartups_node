const Sequelize = require('sequelize');

const sequelize = new Sequelize('rfs_india', 'root', 'ddbbzz', { dialect: 'mysql' });

module.exports = sequelize;