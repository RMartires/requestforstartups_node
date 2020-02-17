const bcrypt = require('bcryptjs');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookie = require('js-cookie');
const { validationResult } = require('express-validator');

//airtable
var base = require('../database/airtable');

const mainurl = require('../database/links');

exports.postSignup = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;
    const username = req.body.name;
    const valerrors = validationResult(req);

    var topuserid;
    //console.log(password + ' ' + confirmpassword);

    if (!valerrors.isEmpty()) {
        res.json({
            message: valerrors.array()[0].msg
        });
    } else {
        //in feilds are valid
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
                            message: 'User with this email exists'
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
                                }], (err, records) => {
                                    if (records) {
                                        var { id } = records[0];
                                        topuserid = id;
                                        console.log(topuserid);
                                        const token = jwt.sign({
                                            email: email,
                                            loggedin: true,
                                            userid: topuserid
                                        }, 'heyphil123');
                                        res.json({
                                            message: 'done',
                                            token: token
                                        });
                                    } else {
                                        console.log(err);
                                    }
                                })
                            });
                    }
                }, err => {
                    console.log(err);
                });
        } else {
            //console.log("password does not match");
            res.json({
                message: 'Password and confirmpassword feild should match'
            });
        }

        //end after validdation part
    }


};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    var exist = false;
    var topPassword;
    var userid;
    const valerrors = validationResult(req);
    if (!valerrors.isEmpty()) {
        res.json({
            message: valerrors.array()[0].msg
        });
    } else {
        //if inputs are valid
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
                        userid = record.id;
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
                                    loggedin: true,
                                    userid: userid
                                }, 'heyphil123');
                                console.log(token);
                                res.json({
                                    message: 'done',
                                    token: token
                                });

                            } else {
                                res.json({
                                    message: 'Email and password did not match'
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

    }

};