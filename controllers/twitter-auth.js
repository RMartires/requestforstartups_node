const request = require('request');
var Twit = require('twit');
var base = require('../database/airtable');
const jwt = require('jsonwebtoken');
const Cookies = require('js-cookie');

const mainurl = require('../database/links');


exports.getrequesttoken = (req, res, next) => {
    request.post({
        url: 'https://api.twitter.com/oauth/request_token',
        oauth: {
            oauth_callback: mainurl + "/auth/twitter/cb/",
            consumer_key: process.env.consumer_key,
            consumer_secret: process.env.consumer_secret
        }
    }, function (err, r, body) {
        if (err) {
            return res.send(500, { message: err.message });
        }


        var jsonStr = body.split('=');
        var oauth_token = jsonStr[1].split('&')[0];
        var oauth_token_secret = jsonStr[2].split('&')[0];
        var oauth_callback_confirmed = jsonStr[3];
        if (oauth_callback_confirmed === 'true') {
            var url = 'https://api.twitter.com/oauth/authenticate?oauth_token=' + oauth_token;
            res.redirect(url);
        }
        //res.send(JSON.parse(jsonStr));
    });
};

exports.Oauthcb = (req, res, next) => {
    var oauth_token = req.query.oauth_token;
    var oauth_verifier = req.query.oauth_verifier;
    var url = 'https://api.twitter.com/oauth/access_token?' + 'oauth_token=' + oauth_token + '&oauth_verifier=' + oauth_verifier;
    var token;

    var userinfo = {};

    request.post({
        url: url
    }, (err, r, body) => {
        if (err) {
            return res.send(500, { message: err.message });
        }

        var temp = body.split('&');
        if (temp) {
            userinfo.oauth_token = temp[0].split('=')[1];
            userinfo.oauth_token_secret = temp[1].split('=')[1];
            userinfo.user_id = temp[2].split('=')[1];
            userinfo.screen_name = temp[3].split('=')[1];

            var users = [];
            var rec;

            base('users').select({
                view: "Grid view"
            }).eachPage(function page(records, fetchNextPage) {

                records.forEach(function (record) {
                    if (record.get('User_id') === userinfo.user_id) {
                        users.push(record.get('User_id'));
                        rec = record;
                    }

                });

                fetchNextPage();

            }, function done(err) {
                if (err) { console.error(err); return; }
                if (users.includes(userinfo.user_id)) {
                    const token = jwt.sign({
                        user: userinfo,
                        record_id: rec.id
                    }, 'heyphil123');
                    // res.json({
                    //     message: 'user exists',
                    //     token: token,
                    //     path: '/'
                    // });
                    res.redirect(mainurl + '/login/' + token);

                } else {

                    //user does not exist so we create a new one
                    var T = new Twit({
                        consumer_key: process.env.consumer_key,
                        consumer_secret: process.env.consumer_secret,
                        access_token: userinfo.oauth_token,
                        access_token_secret: userinfo.oauth_token_secret,
                        timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
                        strictSSL: true,     // optional - requires SSL certificates to be valid.
                    });

                    T.get('account/verify_credentials', { skip_status: true })
                        .catch(function (err) {
                            console.log('caught error', err.stack)
                        })
                        .then(function (result) {
                            var { profile_image_url } = result.data;
                            userinfo.profile_image_url = profile_image_url;

                            base('users').create([
                                {
                                    "fields": {
                                        "Name": userinfo.screen_name,
                                        "User_id": userinfo.user_id,
                                        "Pic": userinfo.profile_image_url
                                    }
                                }], function (err, records) {
                                    if (err) {
                                        console.error(err);
                                        return;
                                    }
                                    const token = jwt.sign({
                                        user: userinfo,
                                        record_id: records[0].id
                                    }, 'heyphil123');
                                    // res.json({
                                    //     message: 'new user created',
                                    //     token: token,
                                    //     path: '/'
                                    // });
                                    res.redirect(mainurl + '/login/' + token);


                                });

                        });

                }//end of the else block to create a new user

            });//end of the find users func





        } else {
            //not loggedin
            // res.json({
            //     message: 'twitter login error',
            //     path: '/login'
            // });
            res.redirect(mainurl + '/login/' + token);
        }

    });


};


