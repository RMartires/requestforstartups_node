const bcrypt = require('bcryptjs');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookie = require('js-cookie');
//airtable

var base = require('../database/airtable');

const mainurl = require('../database/links');

exports.postSignup = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;
    const username = req.body.name;

    console.log(password + ' ' + confirmpassword);

    if (password === confirmpassword) {
        var exist = false;
        base('users').select({
            fields: ["Email"],
            cellFormat: "json",
            view: "Grid view"
        })
            .eachPage((records) => {
                records.map(record => {
                    var { fields } = record;
                    var { Email } = fields;
                    if (Email === email) {
                        exist = true;
                    }
                });
                if (exist) {
                    //console.log('user alredy exists');
                    res.json({
                        message: 'email exists'
                    });
                } else {
                    bcrypt.hash(password, 12)
                        .then(hashedpassword => {
                            base('users').create([{
                                "fields": {
                                    "Name": username,
                                    "Email": email,
                                    "Password": hashedpassword,
                                    "ideas": [],
                                    "comments": []
                                }
                            }], (record, err) => {
                                if (record) {
                                    console.log(record);
                                    return record;
                                } else {
                                    console.log(err);
                                }
                            })
                        })
                        .then(rec => {
                            console.log('new user added');
                            const token = jwt.sign({
                                email: email,
                                loggedin: true
                            }, 'heyphil123');
                            res.json({
                                message: 'done',
                                token: token
                            });
                        });
                }
            }, err => {
                console.log(err);
            });
    } else {
        //console.log("password does not match");
        res.json({
            message: 'password did not match'
        });
    }

};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    var exist = false;
    var topPassword;

    base('users').select({
        fields: ["Email", "Password"],
        cellFormat: "json",
        view: "Grid view"
    })
        .eachPage((records) => {
            records.map(record => {
                var { fields } = record;
                var { Email } = fields;
                var { Password } = fields;
                if (Email === email) {
                    exist = true;
                    topPassword = Password;
                    console.log(Password);
                }
            });
            if (exist) {
                bcrypt.compare(password, topPassword)
                    .then(doMatch => {
                        console.log(doMatch);
                        if (exist && doMatch) {
                            console.log('loggedin');
                            const token = jwt.sign({
                                email: email,
                                loggedin: true
                            }, 'heyphil123');
                            console.log(token);
                            res.json({
                                message: 'done',
                                token: token
                            });

                        } else {
                            res.json({
                                message: 'wrong password'
                            });
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }

        }, err => {
            console.log(err);
        });

};