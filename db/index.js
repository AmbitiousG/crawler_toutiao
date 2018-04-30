const _ = require('lodash');
const mongoose = require('mongoose');

const dbConfig = require('../db-config.json');
const { Article, Label } = require('./schema');

const conn = mongoose.connection;

const saveArticles = async function (articles, category) {
    //save labels
    const arrLabels = _(articles).map('label').flatten().uniq().compact().value();
    const labels = _(arrLabels).map(l => ({ label: l })).value();
    let labelMatched = [];
    if (labels.length > 0) {
        try {
            await Label.collection.insertMany(labels, { ordered: false });
        }
        catch (e) {
            // console.error(e);
        }
        try {
            labelMatched = await Label.where('label').in(arrLabels).exec();
        }
        catch (e) {
            // console.error(e);
        }
    }

    try {
        _.each(articles, a => {
            a.label = _.map(a.label || [], l => {
                const matched = _.find(labelMatched, { label: l });
                if (matched)
                    return matched._id
                else
                    return null;
            });
        });
        // console.log(_.map(articles, a => _.pick(a, ['label'])));
        return await Article.collection.insertMany(articles, {
            ordered: false // 插入失败则跳过
        })
    }
    catch (err) {
        // console.error(err);
    }
}

const getArticles = function (category, nextId = 0) {
    let options = {
        tag_url: category
    };
    if(nextId !== 0){
        _.assign(options, {item_id: {$lt: nextId}});
    }
    return Article.find(options, {
        _id: 0
    }).sort({item_id: -1}).populate('label').limit(10).exec();
}

module.exports = {
    conn: function (cb, isReadonly = false) {
        mongoose.connect(dbConfig.server + '/' + dbConfig.db, {
            user: isReadonly ? dbConfig.readonly_user : dbConfig.user,
            pass: isReadonly ? dbConfig.readonly_pwd : dbConfig.pwd,
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
