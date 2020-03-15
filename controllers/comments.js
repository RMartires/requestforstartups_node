var Comment = require('../models/comments');
var Idea = require('../models/ideas');
//airtable
var base = require('../database/airtable');
const mainurl = require('../database/links');

exports.getcommments = (req, res, next) => {
    const id = req.params.ideaid;
    Idea.findByPk(id)
        .then(idea => {
            idea.getComments()
                .then(comments => {
                    res.json({
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
                    return mainidea.getComments();
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