const request = require("request");
const { getHoney, getSignature } = require("./utils");
const _ = require("lodash");
const { conn, connInstance, saveArticles, getArticles } = require('./db');

const start = (cb) => {
    let count = 0;

    const req = (max_behot_time = 1524793759) => {
        const { as, cp } = getHoney();
        const url = `https://www.toutiao.com/api/pc/feed/?category=news_tech&utm_source=toutiao&widen=1&max_behot_time=${max_behot_time}&max_behot_time_tmp=${max_behot_time}&tadrequire=true&tadrequire=true&as=${as}&cp=${cp}&_signature=${getSignature(max_behot_time)}`;
        // console.log({ url })
        request(url, (error, response, body) => {
            const ret = JSON.parse(body);
            max_behot_time = ret.next.max_behot_time;
            // console.log(_.map(ret.data, 'title'));
            count++;
            // console.log('titles', _.map(ret.data, 'title'));
            // setTimeout(() => connInstance.close(), 2000)
            // console.log({connInstance})
            saveArticles(ret.data).then(async () => {
                if (count < 10)
                    setTimeout(() => {
                        req(max_behot_time);
                    }, 1000);
                else {
                    await cb();
                    connInstance.close();
                }
            });
        })
    };

    conn(req);
}

start(async () => {
    const articles = await getArticles();
    const titles = _.map(articles, a => {
        const obj = a.toObject();
        return obj.title;
    })
    console.log({titles});

});
