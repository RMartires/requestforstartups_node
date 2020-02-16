const Twitter = require('twitter');
var Airtable = require('airtable');
var base = new Airtable({ apiKey: 'key6g32DRULc2ELR4' }).base('appTIhrtdSQzoGMIf');

exports.gettweets = (req, res, next) => {

    var client = new Twitter({
        consumer_key: '2UEKwIijR55ZTyG7t6ccxfCVn',
        consumer_secret: 'kzTOcsI4KRSfQTeaCwYFPsccXcRoU0xNmN33cqYgwv3j7KV9an',
        access_token_key: '1228590283207499776-al87B7IiYwnPfzoB8xVb3RvLINha3E',
        access_token_secret: 'C2gAWmB0nrVzSALQmuS1TBdxGNzdRVAdEY7rvKijar3wF'
    });

    var stream = client.stream('statuses/filter', { track: '@startuprequest' });
    stream.on('data', function (event, error) {
        if (error) {
            console.log(errror);
        }

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