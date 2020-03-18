const Sequelize = require('sequelize');

//const sequelize = new Sequelize('rfs_india', 'root', 'ddbbzz', { dialect: 'mysql' });
const sequelize = new Sequelize('requestforstartups', process.env.RDS_username, process.env.RDS_password, {
    host: process.env.RDS_host,
    dialect: 'mysql'/* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
});

module.exports = sequelize;