const mongoose = require('mongoose');
const arrayUniquePlugin = require('mongoose-unique-array');


const imageSchema = new mongoose.Schema({
    url: String
});

const labelSchema = new mongoose.Schema({
    label: {
        type: String,
        unique: true,
        index: true,
    },
});

const articleSchema = new mongoose.Schema({
    abstract: String,
    article_genre: String,
    chinese_tag: String,
    group_id: String,
    group_source: Number,
    has_gallery: Boolean,
    image_list: [imageSchema],
    image_url: String,
    is_feed_ad: Boolean,
    item_id: {
        type: String,
        unique: true,
        index: true,
    },
    label: [labelSchema],
    media_avatar_url: String,
    media_url: String,
    middle_image: String,
    middle_mode: Boolean,
    more_mode: Boolean,
    single_mode: Boolean,
    source_url: String,
    tag: String,
    tag_url: String,
    title: String
});

labelSchema.plugin(arrayUniquePlugin);
articleSchema.plugin(arrayUniquePlugin);

const Article = mongoose.model('Article', articleSchema);
const Image = mongoose.model('Image', articleSchema);
const Label = mongoose.model('Label', labelSchema);

module.exports = {
    Article, Image, Label
};
