n"use strict";

const PORT            = 8080;
// const MONGODB_URI     = "mongodb://localhost:27017/tweeter";
const HASHROUNDS      = 10;
const express         = require("express");
// const bodyParser      = require("body-parser");
const app             = express();
// const cookieSession   = require("cookie-session");
// const MongoClient     = require("mongodb").MongoClient;
// const sassMiddleware  = require('node-sass-middleware');
// const methodOverride  = require('method-override')
const bcrypt          = require("bcrypt");

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
// app.use(methodOverride("_method"));


// app.use(cookieSession({
//   name: 'session',
//   keys: ['SuperTotallySecretKey1', 'AnotherReallySecretKey2'], // Secret keys

//   // Cookie options
//   maxAge: 24 * 60 * 60 * 1000 // 24 hours
// }));

// app.use(sassMiddleware({
//   src: './server/stylesheets',
//   dest: './public/styles',
//   prefix: '/styles'
// }));

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
