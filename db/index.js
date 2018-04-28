const _ = require('lodash');
const mongoose = require('mongoose');

const dbConfig = require('../db-config.json');
const { Article, Image, Label } = require('./schema');

// console.log({db: db.connection.close,})
const conn = mongoose.connection;

const saveArticles = async function (articles, category) {
    if (!_.isPlainObject(articles)) {
        // articles = _.map(articles, a => ({
        //     ...a,
        //     label: _.map(a.label, l => ({label: l}))
        // }));

    }
    try {
        //save labels
        const arrLabels = _(articles).map('label').flatten().uniq().compact().value();
        const labels = _(arrLabels).map(l => ({ label: l })).value();
        await Label.collection.insertMany(labels, { ordered: false });
        const labelMatched = await Label.where('label').in(arrLabels).exec();
        //save images
        const images = _(articles).map('image_list').flatten().uniq().compact().value();
        // const images = _(arrImages).map(l => ({url: l})).value();
        await Image.collection.insertMany(images, { ordered: false });
        const imageMatched = await Image.where('url').in(_.map(images, 'url')).exec();
        _.each(articles, a => {
            if (a.label && a.label.length > 0) {
                a.label = _.map(a.label, l => {
                    const matched = _.find(labelMatched, { label: l });
                    if (matched)
                        return matched._id
                    else
                        return null;
                });
            }
            else
                a.label = [];
            if (a.image_list && a.image_list.length > 0) {
                a.image_list = _.map(a.image_list, img => {
                    const matched = _.find(imageMatched, { url: img.url });
                    if (matched)
                        return matched._id
                    else
                        return null;
                });
            }
            else
                a.image_list = [];
        });

    return await Article.collection.insertMany(articles, {
        ordered: false // 插入失败则跳过
    })
    // return await Article.create(articles);
}
    catch (err) {
    console.error(err);
}
}

const getArticles = function () {
    return Article.find({}).exec();
}

module.exports = {
    conn: function (cb) {
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
