var fs = require("fs");
var express = require('express');
var app = express();

app.use(function (req, res, next) {
    if (req.is('text/json')) {
        req.text = '';
        req.setEncoding('utf8');
        req.on('data', function (chunk) { req.text += chunk });
        req.on('end', function () {
            req.text = JSON.parse(req.text);
            next();
        });
    } else {
        next();
    }
});
app.use(express.bodyParser());

app.get('/', function (request, response) {
    response.sendfile("./html/index.html");
});

app.post('/product', function (req, res) {
    require('http').get({
        host: 'api.zappos.com',
        path: '/Product/' + req.text.query + '?key=52ddafbe3ee659bad97fcce7c53592916a6bfd73&includes=["styles"]'
    }, function (response) {

        var body = '';
        response.on("data", function (chunk) { body += chunk.toString('utf8'); });
        response.on("end", function () {
            var result = new Array();
            try {
                JSON.parse(body).product.forEach(function (item) {
                    result.push({
                        "id": item.productId,
                        "name": item.productName,
                        "img": item.defaultImageUrl,
                        "price": item.styles[0].price,
                        "discount": item.styles[0].percentOff,
                        "url": item.defaultProductUrl
                    });
                });
            } catch (ex) { }
            res.send(result);
        });
    });

});

app.post('/search', function (req, res) {
    require('http').get({
        host: 'api.zappos.com',
        path: '/Search?term=' + req.text.query + '&key=52ddafbe3ee659bad97fcce7c53592916a6bfd73'
    }, function (response) {

        var body = '';
        response.on("data", function (chunk) { body += chunk.toString('utf8'); });
        response.on("end", function () {
            var result = new Array();
            try {
                JSON.parse(body).results.forEach(function (item) {
                    result.push({
                        "id": item.productId,
                        "name": item.productName,
                        "img": item.thumbnailImageUrl,
                        "price": item.price,
                        "discount": item.percentOff,
                        "url": item.productUrl
                    });
                });
            } catch (ex) { }
            res.send(result);
        });
    });
});

app.get('/result', function (req, res) {

});

app.listen(process.env.PORT || 3000);

console.log("Server listening on port " + (parseInt(process.env.PORT) || 3000));