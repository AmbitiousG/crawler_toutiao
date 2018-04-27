const request = require("request");
const {getHoney, getSignature} = require("./utils");
const _ = require("lodash");
const conn = require('./db');

const getArticles = () => {
    const {as, cp} = getHoney();
    const url = `https://www.toutiao.com/api/pc/feed/?category=news_tech&utm_source=toutiao&widen=1&max_behot_time=0&max_behot_time_tmp=0&tadrequire=true&as=${as}&cp=${cp}&_signature=${getSignature()}`;
    request(url, (error, response, body) => {
        const ret = JSON.parse(body);
        console.log(_.map(ret.data, 'title'));

        setTimeout(() => conn.close(), 2000)
        console.log({conn})
    })
}

getArticles();
