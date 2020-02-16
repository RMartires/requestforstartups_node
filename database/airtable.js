var Airtable = require('airtable');
var base = new Airtable({ apiKey: process.env.apiKey }).base(process.env.base);

module.exports = base;