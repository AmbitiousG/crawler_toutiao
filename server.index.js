const logger = require('koa-logger');
const Koa = require('koa');
const Router = require('koa-router');
const _ = require('lodash');
const { conn, connInstance, getArticles } = require('./db');

conn(null, true);

const app = new Koa();
const router = new Router({
    prefix: '/articles'
});

const getCategoryData = async (ctx, next) => {
    const { category } = ctx.params;
    let articles = await getArticles(category);
    articles = _.map(articles, a => {
        const parsed = _.omit(a.toJSON(), '_id');
        return {
            ...parsed,
            label: _.map(parsed.label, 'label')
        }
    });
    ctx.body = articles;
};

app.use(logger());

router.get('/:category', getCategoryData);

app.use(router.routes());

app.listen(4423);
