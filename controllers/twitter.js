const Twitter = require('twitter');
var base = require('../database/airtable');

exports.gettweets = (req, res, next) => {
    var client = new Twitter({
        consumer_key: '2UEKwIijR55ZTyG7t6ccxfCVn',
        consumer_secret: 'kzTOcsI4KRSfQTeaCwYFPsccXcRoU0xNmN33cqYgwv3j7KV9an',
        access_token_key: '1228590283207499776-N2sUQ1zsiZ4HM4lF1Mc2UKSKQbZVGf',
        access_token_secret: 'bgjlS97XXIWM6yiWHzlDHf7R8hWHqlSAOOsSgt6ZPFqkE'
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