const _ = require('lodash');
const request = require('request');
const { getHoney, getSignature, timeout } = require("./utils");
const { conn, connInstance, saveArticles, getArticles } = require('./db');

const categories = [
    'news_tech',
    // 'news_entertainment',
    // 'news_game',
    // 'news_sports',
    // 'news_car',
    // 'news_finance',
    // 'funny',
    // 'news_world',
    // 'news_fashion',
    // 'news_travel',
    // 'news_discovery',
    // 'news_baby',
    // 'news_regimen',
    // 'news_essay',
    // 'news_history',
    // 'news_food'
];

const generateUrl = (category, max_behot_time = 0) => {
    const { as, cp } = getHoney();
    return `https://www.toutiao.com/api/pc/feed/?category=${category}&utm_source=toutiao&widen=1&max_behot_time=0&max_behot_time_tmp=${max_behot_time}&tadrequire=true&tadrequire=true&as=${as}&cp=${cp}&_signature=${getSignature(max_behot_time)}`;
}

const startSingleRequest = url => {
    return new Promise((resolve, reject) => {
        request({
            uri: url,
            jar: true //hold cookie
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            }
            else {
                reject();
            }
        })
    })
}

// const getData = async (url, data = []) => {
//     return await startSingleRequest(url);
// } 

const startRecursiveRequest = async (category, tempData, max_behot_time = 0) => {
    const url = generateUrl(category, max_behot_time);
    try {
        const retData = await startSingleRequest(url);
        max_behot_time = retData.next.max_behot_time;
        const articles = retData.data;
        const combined = _.concat(tempData, _.filter(articles, a => !_.some(tempData, { item_id: a.item_id })));
        if (combined.length < 10){
            timeout(100);
            return await startRecursiveRequest(category, combined, max_behot_time);
        }
        else
            return combined;
        // await saveArticles(retData.data);

    }
    catch (e) {
        return tempData;
    }
}

const startCrawlers = async () => {
    while(true) {
        timeout(100);
        await Promise.all(_.map(categories, async c => {
            const tempData = await startRecursiveRequest(c, []);
            await saveArticles(tempData, c);
        }));
    }
}

module.exports = {
    startCrawlers
}
