//airtable
var Airtable = require('airtable');
var base = new Airtable({ apiKey: 'key6g32DRULc2ELR4' }).base('appTIhrtdSQzoGMIf');
//const mainurl = 'http://localhost:3000';
const mainurl = 'https://cryptic-sea-72911.herokuapp.com';

exports.getcommments = (req, res, next) => {
    const id = req.params.ideaid;
    base('ideas').find(id, (err, record) => {
        if (err) { console.error(err); return; }
        var { fields } = record;
        var { commentslu } = fields;
        var { commentsuserslu } = fields;
        res.json({
            comments: commentslu,
            users: commentsuserslu
        });
    });
};

exports.postcomments = (req, res, next) => {
    const email = req.body.email;
    const comment = req.body.comment;
    const ideaid = req.params.ideaid;
    var recordid;

    base('users').select({
        view: "Grid view"
    }).eachPage((records, fetchNextPage) => {

        records.forEach((record) => {
            var currentemail = record.get('Email');
            if (email === currentemail) {
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