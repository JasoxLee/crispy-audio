const fs = require('fs');
const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const router = require('./server/router');

const app = express();

// default port number
const PORT = process.env.PORT || 3000

// use logger
app.use(logger('dev'));
// use cors
app.use(cors());
// use cookie-parser
app.use(cookieParser())
// use body-parser
app.use(bodyParser.urlencoded({ parameterLimit: 100000, limit: '50mb', extended: true }));
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.raw());
app.use('/api', router);
app.listen(PORT, function () {
    console.log(`Runing on ${PORT}`);
})




module.exports = app;



