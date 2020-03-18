var Comment = require('../models/comments');
var Idea = require('../models/ideas');
var User = require('../models/users');
//airtable
var base = require('../database/airtable');
const mainurl = require('../database/links');

exports.getcommments = (req, res, next) => {
    const id = req.params.ideaid;
    Idea.findByPk(id, {
        include: User
    })
        .then((idea) => {
            return idea;
        })
        .then(idea => {
            idea.getComments(
                {
                    include: ['Commenters']

                }
            )
                .then(comments => {
                    res.json({
                        idea: idea,
                        user: idea.user,
                        comments: comments
                    });
                });

        });

};

exports.postcomments = (req, res, next) => {
    const userid = req.body.userid;
    const comment = req.body.comment;
    const ideaid = req.params.ideaid;

    var mainidea;

    Comment.create({
        commentText: comment,
        createdBy: userid
    })
        .then(comment => {
            Idea.findByPk(ideaid)
                .then(idea => {
                    mainidea = idea;
                    return idea.addComment(comment.dataValues.id);

                })
                .then(() => {
                    return mainidea.getComments({
                        include: ['Commenters']
                    });
                })
                .then(comments => {
                    mainidea.trending = mainidea.upvote + comments.length;
                    mainidea.save()
                        .then(() => {
                            res.json({
                                comments: comments
                            });
                        });

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
                            return idea.save();
                        })
                        .then(idea => {
                            res.json({
                                idea: idea
                            });
                        });
                });
        });


};