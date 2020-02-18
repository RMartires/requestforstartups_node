const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const Twitter = require('twitter');

const twittercontroller = require('./controllers/twitter');

const path = require('path');

const app = express();

const authRoute = require('./routes/auth');
const ideaRoute = require('./routes/idea');
const commRoute = require('./routes/comments');
//const tweetRoute = require('./routes/twitter');

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
//app.use(tweetRoute);


var client = new Twitter({
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token_key: process.env.access_token_key,
    access_token_secret: process.env.access_token_secret
});
var stream = client.stream('statuses/filter', { track: '@startuprequest' });
stream.on('data', function (event, error) {
    if (error) {
        console.log(errror);
    }
    //console.log(event.text);
    twittercontroller.addtweets(event);
});


//port 5000
app.listen(process.env.PORT || 5000);

