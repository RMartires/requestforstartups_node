const jwt = require('jsonwebtoken');
//airtable
var base = require('../database/airtable');
const mainurl = require('../database/links');

exports.Postidea = (req, res, next) => {
    const domain = req.body.domain;
    const problem = req.body.problem;
    const token = req.body.jwttoken;

    var date = new Date();

    var decodedtoken;
    try {
        decodedtoken = jwt.verify(token, process.env.secret);
    } catch (err) {
        //res.json({ messege: 'Login in to submit ideas' });
        res.redirect(mainurl + '/login');
    }
    if (!decodedtoken) {
        //res.json({ messege: 'Login in to submit ideas' });
        res.redirect(mainurl + '/login');
    } else {
        const email = decodedtoken.email;
        let toprecord;

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
                        toprecord = record;
                    }
                });
                if (exist) {
                    base('ideas').create([{
                        "fields": {
                            "user": [toprecord.id],
                            "Domain": domain,
                            "Problem": problem,
                            "upvote": 0,
                            "date": date
                        }
                    }], (err, results) => {
                        if (err) {
                            console.log(err);
                        } else {
                            //console.log(results);
                            res.redirect(mainurl + '/');
                        }
                    });

                }
            }, err => {
                console.log(err);
            });
    }


};

exports.getideas = (req, res, next) => {
    var recordlist = [];
    base('ideas').select({
        view: "Grid view"
    }).eachPage((records, fetchNextPage) => {

        records.forEach((record) => {
            var { fields } = record;
            var { id } = record;
            var parsedrecord = {
                id: id,
                data: fields
            }
            recordlist.push(parsedrecord);
        });

        fetchNextPage();

    }, (err) => {
        if (err) {
            console.error(err);
            return;
        } else {
            //console.log(recordlist);
            res.json({
                messege: 'sent',
                recordlist: recordlist
            });
        }
    });

};

exports.getmyideas = (req, res, next) => {
    var email = req.params.email;
    var ideaidlist;
    var idealist = [];
    base('users').select({
        fields: ["ideas", "Email"],
        view: "Grid view",
    }).eachPage((records, fetchNextPage) => {

        records.forEach((record) => {
            var { fields } = record;
            if (fields.Email === email) {
                var { ideas } = fields;
                ideaidlist = ideas;
            }
        });

        fetchNextPage();

    }, (err) => {
        if (err) { console.error(err); return; }
        res.json({
            ideaidlist: ideaidlist
        });

    });

};

exports.getidea = (req, res, next) => {
    const id = req.params.ideaid;
    base('ideas').find(id, function (err, record) {
        if (err) { console.error(err); return; }
        var { fields } = record;
        console.log(fields);
        res.json({
            idea: fields,
            id: record.id
        });
    });
};

exports.putupvote = (req, res, next) => {
    const ideaId = req.params.ideaid;
    const userid = req.body.userid;

    var alreadyupvoted = false;
    var currentupvote = 0;
    //console.log(ideaId);
    base('ideas')
        .find(ideaId, (err, record) => {
            if (err) { console.error(err); return; }
            else {
                var { fields } = record;
                var { whoupvote } = fields;
                whoupvote = whoupvote || [];
                whoupvote.forEach(uid => {
                    if (uid === userid) {
                        alreadyupvoted = true;
                    }
                })
                if (!alreadyupvoted) {
                    whoupvote.push(userid);
                    currentupvote = record.fields.upvote;
                    currentupvote = currentupvote + 1;

                    base('ideas').update([
                        {
                            "id": ideaId,
                            "fields": {
                                "upvote": currentupvote,
                                "whoupvote": whoupvote
                            }
                        }], (err, record) => {
                            if (err) {
                                console.error(err);
                                return;
                            } else {
                                var { fields } = record[0];
                                var parsedrecord = {
                                    id: ideaId,
                                    data: fields
                                };
                                res.json({
                                    messege: 'sent',
                                    record: parsedrecord,
                                    link: '/'
                                });

                            }
                        });
                }

            }
        });

};
