const User = require('../models/users');
const Idea = require('../models/ideas');
const Comment = require('../models/comments');

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
                    upvote: 0,
                    createdBy: tempuser.dataValues.id,
                    trending: 0
                })
                    .then(idea => {
                        res.redirect(mainurl + '/');
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
                ideas: ideas
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
    var upvts, trending;
    Idea.findByPk(ideaId)
        .then(idea => {
            idea.getUpvoters({ where: { id: userid } })//returns an empty arr if u did not upvote else arr.len=1
                .then(upvoters => {
                    if (upvoters.length === 1) {
                        idea.upvote = idea.upvote - 1;
                        upvts = idea.upvote;
                        idea.removeUpvoter(userid);
                        //idea.save();
                    } else {
                        idea.upvote = idea.upvote + 1;
                        upvts = idea.upvote;
                        idea.addUpvoter(userid);
                        //idea.save();
                    }
                    return idea.save();

                }).then(idea => {
                    idea.getComments()
                        .then(comments => {
                            trending = upvts + comments.length;
                            idea.trending = trending;
                            idea.save();

                        });

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
        var args = "trending";
    } else if (type === 'TOP') {
        var args = "upvote";
    } else {
        var args = "createdAt";
    }

    Idea.findAll({ order: [[args, 'DESC']] })
        .then(ideas => {
            res.json({
                ideas: ideas
            });
        });

};
