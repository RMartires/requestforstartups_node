const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
//
//sql-stuff
const sequelize = require('./database/sql');
//sql-models
const User = require('./models/users');
const Idea = require('./models/ideas');
const Comment = require('./models/comments');

const app = express();

const authRoute = require('./routes/auth');
const ideaRoute = require('./routes/idea');
const commRoute = require('./routes/comments');
const tweetRoute = require('./routes/twitter-auth');


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(multer().none());

app.use(authRoute);
app.use(ideaRoute);
app.use(commRoute);
app.use(tweetRoute);

//setting up relatons
Idea.belongsTo(User, { foreignKey: 'createdBy' });
Idea.belongsToMany(User, { as: 'Upvoters', through: 'whoUpvoted' });
Comment.belongsTo(User, { as: 'Commenters', foreignKey: 'createdBy' });
Idea.belongsToMany(Comment, { as: 'Comments', through: 'commentedOn' });

sequelize.sync()//{ force: true })
    .then(res => {
        //port 5000
        app.listen(process.env.PORT || 5000);
    });

