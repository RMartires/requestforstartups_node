const Sequelize = require('sequelize');

const sequelize = require('../database/sql');

const Comment = sequelize.define('comment', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    commentText: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Comment;