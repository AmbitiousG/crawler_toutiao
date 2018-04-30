const _ = require('lodash');
const request = require('request');
const { getHoney, getSignature, timeout, random } = require("./utils");
const { saveArticles } = require('./db');
const { Max_Length = 50, Request_Interval_Max = 5000, Request_Interval_Min = 2000 } = require('./fetch-config');

const categories = [
    'news_tech',
    'news_entertainment',
    'news_game',
    'news_sports',
    'news_car',
    'news_finance',
    'funny',
    'news_world',
    'news_fashion',
    'news_travel',
    'news_discovery',
    'news_baby',
    'news_regimen',
    'news_essay',
    'news_history',
    'news_food'
];

const generateUrl = (category, max_behot_time, isRefresh) => {
    const { as, cp } = getHoney();
    const max_b_t = isRefresh ? 0 : max_behot_time;
    return `https://www.toutiao.com/api/pc/feed/?category=${category}&utm_source=toutiao&widen=1&max_behot_time=${max_b_t}&max_behot_time_tmp=${max_behot_time}&tadrequire=true&as=${as}&cp=${cp}&_signature=${getSignature(max_b_t)}`;
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

const getArticlesForSave = async (category) => {
    let tempData = [];
    let count = 0;
    let isRefresh = true;
    const startRecursiveRequest = async (category, temp = [], max_behot_time = 0) => {
        count == 3 && (count = 0);
        isRefresh = count == 0;
        const url = generateUrl(category, max_behot_time, isRefresh);
        try {
            count++;
            const retData = await startSingleRequest(url);
            if (!retData.next)
                return temp;
            max_behot_time = retData.next.max_behot_time;
            const articles = _(retData.data).map(a => ({
                ...a,
                middle_image: _.isPlainObject(a.middle_image) ? a.middle_image.url : a.middle_image
            })).filter({ is_feed_ad: false }).value();
            const combined = _.concat(temp, _.filter(articles, a => !_.some(temp, { item_id: a.item_id })));
            if (combined.length < Max_Length) {
                await timeout(random(Request_Interval_Min, Request_Interval_Max));
                return await startRecursiveRequest(category, combined, max_behot_time)
            }
            else
                return combined;

        }
        catch (e) {
            console.error(category, e);
            return temp;
        }
    }

    tempData = await startRecursiveRequest(category, [], 0);
    return tempData;
}

const startCrawlers = async () => {
    let tempData = [];
    while (true) {
        try {
            for (var i = 0; i < categories.length; i++) {
                tempData = [];
                await timeout(random(Request_Interval_Min, Request_Interval_Max));
                console.log(`Start fetch ${categories[i]} data...`);
                tempData = await getArticlesForSave(categories[i]);
                tempData.length > 0 && await saveArticles(tempData);
                console.log(`Fetch ${categories[i]} finish, total count: ${tempData.length}`);
            }
        }
        catch (e) {
            console.error(e);
        }
    }
}

module.exports = {
    startCrawlers
}
