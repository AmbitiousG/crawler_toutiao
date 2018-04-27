const request = require("request");
const { getHoney, getSignature } = require("./utils");
const _ = require("lodash");
const { conn, connInstance, saveArticles, getArticles } = require('./db');
const {startCrawlers} = require('./api');

// const start = (cb) => {
//     let count = 0;

//     request({
//         uri: 'https://www.toutiao.com/ch/news_tech/',
//         jar: true
//     }, (error, response, body) => {
//         const req = (max_behot_time = 0) => {
//             const { as, cp } = getHoney();
//             const url = `https://www.toutiao.com/api/pc/feed/?category=news_tech&utm_source=toutiao&widen=1&max_behot_time=${max_behot_time}&max_behot_time_tmp=${max_behot_time}&tadrequire=true&tadrequire=true&as=${as}&cp=${cp}&_signature=${getSignature(max_behot_time)}`;
//             // console.log({ url })
//             request({uri: url, jar: true}, (error, response, body) => {
//                 const ret = JSON.parse(body);
//                 max_behot_time = ret.next.max_behot_time;
//                 count++;
//                 saveArticles(ret.data).then(async () => {
//                     if (count < 10)
//                         setTimeout(() => {
//                             req(max_behot_time);
//                         }, 100);
//                     else {
//                         await cb();
//                         connInstance.close();
//                     }
//                 });
//             })
//         };
    
//         conn(req);
//     })
// }

// start(async () => {
//     const articles = await getArticles();
//     const titles = _.map(articles, a => {
//         const obj = a.toObject();
//         return obj.title;
//     })
//     console.log({titles});

// });
startCrawlers();
