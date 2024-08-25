var http = require("http");
var fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const { error } = require("console");

// Require static assets from public folder
app.use(express.static(path.join(__dirname, "public")));

// Set 'views' directory for any views
// being rendered res.render()
app.set("views", path.join(__dirname, "views"));

// Set view engine as EJS
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.get("/", (req, res) => {
    console.log("Redirect to index");
    res.sendFile("/public/index.html", { root: __dirname });
});


app.listen(8080);
console.log("App listening on port 8080");
