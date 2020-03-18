const Sequelize = require('sequelize');

//const sequelize = new Sequelize('rfs_india', 'root', 'ddbbzz', { dialect: 'mysql' });
const sequelize = new Sequelize('requestforstartups', 'admin', 'ddbbzz123', {
    host: 'requestforstartups.cxlen5iypvsc.ap-south-1.rds.amazonaws.com',
    dialect: 'mysql'/* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
});

module.exports = sequelize;