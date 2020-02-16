const Twitter = require('twitter');
var base = require('../database/airtable');

exports.gettweets = (req, res, next) => {
    var client = new Twitter({
        consumer_key: process.env.consumer_secret,
        consumer_secret: process.env.consumer_secret,
        access_token_key: process.env.access_token_key,
        access_token_secret: process.env.access_token_secret
    });

    var stream = client.stream('statuses/filter', { track: '@startuprequest' });
    stream.on('data', function (event, error) {
        if (error) {
            console.log(errror);
        }
        console.log('listening for tweets');
        console.log(event.text);

        var { id } = event;
        var { text } = event;
        var { user } = event;
        var { screen_name } = user;

        var date = new Date();

        base('ideas').create([
            {
                "fields": {
                    "screen_name": screen_name,
                    "Problem": text,
                    "upvote": 0,
                    "date": date
                }
            }

        ], (err, records) => {
            if (err) {
                console.error(err);
                return;
            }
        });

    });

};