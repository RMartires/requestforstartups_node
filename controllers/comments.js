//airtable
var base = require('../database/airtable');
const mainurl = require('../database/links');

exports.getcommments = (req, res, next) => {
    const id = req.params.ideaid;
    base('ideas').find(id, (err, record) => {
        if (err) { console.error(err); return; }
        var { fields } = record;
        var { commentslu } = fields;
        var { commentsuserslu } = fields;
        res.json({
            fields: fields,
            comments: commentslu,
            users: commentsuserslu
        });
    });
};

exports.postcomments = (req, res, next) => {
    const name = req.body.name;
    const comment = req.body.comment;
    const ideaid = req.params.ideaid;
    var recordid;

    base('users').select({
        view: "Grid view"
    }).eachPage((records, fetchNextPage) => {

        records.forEach((record) => {
            var currentname = record.get('Name');
            if (name === currentname) {
                recordid = record.id;
            }
        });

        fetchNextPage();

    }, (err) => {
        if (err) { console.error(err); return; }
        addcoment(recordid);
    });

    const addcoment = (user) => {
        base('comments').create([
            {
                "fields": {
                    "comment": comment,
                    "idea": [
                        ideaid
                    ],
                    "user": [
                        user
                    ]
                }
            }
        ], function (err, record) {
            if (err) {
                console.error(err);
                return;
            }
            res.json({
                messege: 'done'
            });
        });

    }

};