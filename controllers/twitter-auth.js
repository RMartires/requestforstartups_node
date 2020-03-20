const request = require('request');
var Twit = require('twit');
var base = require('../database/airtable');
const jwt = require('jsonwebtoken');
const Cookies = require('js-cookie');

const User = require('../models/users');

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

            User.findAll({ where: { name: userinfo.screen_name } })
                .then(users => {
                    if (users.length === 0) {
                        //no user so we create one
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
                                var temp_profile = profile_image_url;
                                var temp_image = temp_profile.split('_normal')[0] + temp_profile.split('_normal')[1];
                                userinfo.profile_image_url = temp_image;

                                User.create({
                                    name: userinfo.screen_name,
                                    twitterId: userinfo.user_id,
                                    profilePicture: userinfo.profile_image_url
                                })
                                    .then(user => {
                                        var { dataValues } = user;
                                        console.log('new user created');
                                        // const token = jwt.sign({
                                        //     user: userinfo,
                                        //     record_id: dataValues.id
                                        // }, 'heyphil123');
                                        // res.json({
                                        //     message: 'new user created',
                                        //     token: token,
                                        //     path: '/'
                                        // });
                                        var tokennum = (dataValues.id * 2) + 8945;
                                        var token = `RX${tokennum}`;
                                        res.redirect(mainurl + '/login/' + token);

                                    });

                            });

                    } else {
                        const tempuser = users[0];
                        var { dataValues } = tempuser;
                        // const token = jwt.sign({
                        //     user: userinfo,
                        //     record_id: dataValues.id
                        // }, 'heyphil123');

                        var tokennum = (dataValues.id * 2) + 8945;
                        var token = `RX${tokennum}`;
                        res.redirect(mainurl + '/login/' + token);
                    }

                });

        } else {
            //not loggedin
            // res.json({
            //     message: 'twitter login error',
            //     path: '/login'
            // });
            res.redirect(mainurl + '/login/');
        }

    });


};

exports.getusertoken = (req, res, next) => {
    const tokenid = req.params.tokenid;
    var userinfo = {};
    var decodedtoken = tokenid.split('RX')[1];
    decodedtoken = (decodedtoken - 8945) / 2;
    User.findByPk(decodedtoken)
        .then(user => {
            userinfo.screen_name = user.name;
            userinfo.user_id = user.twitterId;
            userinfo.profile_image_url = user.profilePicture;

            const token = jwt.sign({
                user: userinfo,
                record_id: decodedtoken
            }, 'heyphil123');

            res.json(
                {
                    decodedtoken: token,
                    token: {
                        user: userinfo,
                        record_id: decodedtoken
                    }
                });

        });

};