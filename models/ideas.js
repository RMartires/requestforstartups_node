const Sequelize = require('sequelize');

const sequelize = require('../database/sql');

const Idea = sequelize.define('idea', {
    // attributes
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    problem: {
        type: Sequelize.STRING,
        allowNull: false
    },
    domain: {
        type: Sequelize.STRING,
        allowNull: false
    },
    upvote: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    trending: {
        type: Sequelize.INTEGER,
        allowNull: true
    }

});

//Idea.belongsToMany(User, { through: 'whoUpvoted' });

module.exports = Idea;