const mongoose = require('mongoose');
const dbConfig = require('../db-config.json');

mongoose.connect(dbConfig.server + '/toutiao', {
    user: dbConfig.user,
    pass: dbConfig.pwd,
});
// console.log({db: db.connection.close,})
const conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'connection error:'))
conn.on('open', () => {
    console.log('ggc mongodb connected!')
});
conn.on('disconnected', () => console.log('disconnected from ggc!'));

module.exports = conn;
