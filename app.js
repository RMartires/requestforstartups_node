const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

var passport = require('passport'), TwitterTokenStrategy = require('passport-twitter');

const twittercontroller = require('./controllers/twitter');

const path = require('path');

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

// passport.use(new TwitterTokenStrategy({
//     consumerKey: '2UEKwIijR55ZTyG7t6ccxfCVn',
//     consumerSecret: 'kzTOcsI4KRSfQTeaCwYFPsccXcRoU0xNmN33cqYgwv3j7KV9an',
//     callbackURL: "http://localhost:5000/auth/twitter/"
// },
//     function (token, tokenSecret, profile, done) {
//         console.log(profile);
//         done(null, profile);
//     }

// ));



//port 5000
app.listen(process.env.PORT || 5000);

