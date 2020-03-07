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
        decodedtoken = jwt.verify(token, 'heyphil123');
    } catch (err) {
        //res.json({ messege: 'Login in to submit ideas' });
        res.redirect(mainurl + '/login');
    }
    if (!decodedtoken) {
        //res.json({ messege: 'Login in to submit ideas' });
        res.redirect(mainurl + '/login');
    } else {
        const name = decodedtoken.user.screen_name;
        let toprecord;

        base('users').select({
            fields: ["Name"],
            cellFormat: "json",
            view: "Grid view"
        })
            .eachPage((records) => {
                records.map(record => {
                    var { fields } = record;
                    var { Name } = fields;
                    if (Name === name) {
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

exports.getfilteredideas = (req, res, next) => {
    const domain = req.params.domain;
    //console.log(domain);
    var ideas = [];

    base('ideas').select({
        view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {

        records.forEach(function (record) {
            var recorddom = record.get('Domain');
            if (recorddom === domain) {
                var { fields } = record;
                var { id } = record;
                var parsedrecord = {
                    id: id,
                    data: fields
                }
                ideas.push(parsedrecord);
            }
        });

        fetchNextPage();

    }, function done(err) {
        if (err) { console.error(err); return; }
        res.json({ recordlist: ideas });
    });

};



exports.getorderideas = (req, res, next) => {
    const type = req.params.type;
    if (type === 'TRENDING') {
        var args = [{ field: "trending", direction: "desc" }];
    } else if (type === 'TOP') {
        var args = [{ field: "upvote", direction: "desc" }];
    } else {
        var args = [{ field: "date", direction: "desc" }];
    }
    var ideas = [];

    base('ideas').select({
        view: "Grid view",
        sort: args
    }).eachPage(function page(records, fetchNextPage) {

        records.forEach(function (record) {
            var { fields } = record;
            var { id } = record;
            var parsedrecord = {
                id: id,
                data: fields
            }
            ideas.push(parsedrecord);
        });

        fetchNextPage();

    }, function done(err) {
        if (err) { console.error(err); return; }
        res.json({ recordlist: ideas });
    });

};