const _ = require('lodash');
const mongoose = require('mongoose');

const dbConfig = require('../db-config.json');
const {Article, Image, Label} = require('./schema');

// console.log({db: db.connection.close,})
const conn = mongoose.connection;

const saveArticles = async function(articles, category) {
    console.log(articles.length);
    if(!_.isPlainObject(articles)){
        articles = _.map(articles, a => ({
            ...a,
            label: _.map(a.label, l => ({label: l}))
        }));
    }
    try{
        return await Article.create(articles);
    }
    catch(err) {
        console.error(err);
    }
}

const getArticles = function() {
    return Article.find({}).exec();
}

module.exports = {
    conn: function(cb) {
        mongoose.connect(dbConfig.server + '/' + dbConfig.db, {
            user: dbConfig.user,
            pass: dbConfig.pwd,
        });
        conn.on('error', console.error.bind(console, 'connection error:'))
        conn.on('disconnected', () => console.log('disconnected from ggc!'));
        conn.on('open', () => {
            console.log('ggc connected!');
            cb && cb();
            // console.log(Article.find({}).exec(arr => console.log(arr)))
        });
    },
    connInstance: conn,
    saveArticles,
    getArticles
};
