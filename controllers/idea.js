const User = require('../models/users');
const Idea = require('../models/ideas');

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
        console.log(decodedtoken + 'catch');
    }
    if (!decodedtoken) {
        //res.json({ messege: 'Login in to submit ideas' });
        res.redirect(mainurl + '/login');
        console.log(decodedtoken + 'if');
    } else {
        const name = decodedtoken.user.screen_name;

        User.findAll({ where: { name: name } })
            .then(users => {
                const tempuser = users[0];
                Idea.create({
                    problem: problem,
                    domain: domain,
                    upvote: 0
                })
                    .then(idea => {
                        console.log(idea);
                        tempuser.getIdeas()
                            .then(oldideas => {
                                var newideas = oldideas.concat(idea);
                                tempuser.setIdeas(newideas)
                                    .then(result => {
                                        //console.log(result); added new idea
                                        res.redirect(mainurl + '/');
                                    });

                            })

                    });

            });


    }


};

exports.getideas = (req, res, next) => {
    //var recordlist = [];
    Idea.findAll()
        .then(ideas => {
            //console.log(ideas);
            res.json({
                messege: 'sent',
                recordlist: ideas
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
    //console.log(ideaId)
    Idea.findAll({ where: { id: ideaId } })
        .then(ideas => {
            var idea = ideas[0];
            if (idea.whoUpvote.includes(userid)) {
                //already upvoted so remmove
                idea.upvote = idea.upvote - 1;
            } else {
                //inc upvote count
                idea.upvote = idea.upvote + 1;
            }
            return idea.save();
        })
        .then(idea => {
            res.json({
                updatedidea: idea
            });
        });

};

exports.getfilteredideas = (req, res, next) => {
    const domain = req.params.domain;
    //console.log(domain);
    Idea.findAll({ where: { domain: domain } })
        .then(ideas => {
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
