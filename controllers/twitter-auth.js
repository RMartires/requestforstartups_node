const request = require('request');
var Twit = require('twit');

exports.getrequesttoken = (req, res, next) => {
    request.post({
        url: 'https://api.twitter.com/oauth/request_token',
        oauth: {
            oauth_callback: "http://localhost:5000/auth/twitter/cb/",
            consumer_key: '2UEKwIijR55ZTyG7t6ccxfCVn',
            consumer_secret: 'kzTOcsI4KRSfQTeaCwYFPsccXcRoU0xNmN33cqYgwv3j7KV9an'
        }
    }, function (err, r, body) {
        if (err) {
            return res.send(500, { message: err.message });
        }


        var jsonStr = body.split('=');;
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


    var userinfo = {};

    request.post({
        url: url
    }, (err, r, body) => {
        if (err) {
            return res.send(500, { message: err.message });
        }

        var temp = body.split('&');
        userinfo.oauth_token = temp[0].split('=')[1];
        userinfo.oauth_token_secret = temp[1].split('=')[1];
        userinfo.user_id = temp[2].split('=')[1];
        userinfo.screen_name = temp[3].split('=')[1];

        console.log(userinfo);

        var T = new Twit({
            consumer_key: '2UEKwIijR55ZTyG7t6ccxfCVn',
            consumer_secret: 'kzTOcsI4KRSfQTeaCwYFPsccXcRoU0xNmN33cqYgwv3j7KV9an',
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
                console.log(profile_image_url);
            });



    });


};

exports.getuser = (req, res, next) => {
    passport.authenticate('twitter-token', { session: false }), function (req, res, next) {
        if (!req.user) {
            return res.send(401, 'User Not Authenticated');
        }

        // prepare token for API
        req.auth = {
            id: req.user.id
        };

        return next();
    };

};

exports.generateToken = (req, res, next) => {
    req.token = createToken(req.auth);
    return next();
};

exports.sendToken = (req, res, next) => {
    res.setHeader('x-auth-token', req.token);
    return res.status(200).send(JSON.stringify(req.user));
};