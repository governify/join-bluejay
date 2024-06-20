const dotenv = require('dotenv');
dotenv.config();
if (process.env.NEW_RELIC_APP_NAME && process.env.NEW_RELIC_LICENSE_KEY) require('newrelic');

const express = require('express');
const app = express();
app.use(express.json());
const http = require('http').createServer(app);
const port = process.env.PORT || 5000;
const axios = require('axios');

var CryptoJS = require("crypto-js");
const e = require('express');

app.get('/', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        res.sendFile(__dirname + '/views/index.html');
    } else {
        res.sendFile(__dirname + '/views/index-local.html');
    }
});

app.get('/wizard', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        res.sendFile(__dirname + '/views/wizard.html');
    } else {
        res.sendFile(__dirname + '/views/wizard-local.html');
    }
});

app.get('/checker', (req, res) => {
    res.sendFile(__dirname + '/views/checker.html');
});

app.get('/encrypt', (req, res) => {
    var encrypted = CryptoJS.AES.encrypt(req.query.text, process.env.PRIVATE_KEY);
    res.send(encrypted.toString())
});

app.get('/check_encrypt', (req, res) => {
    var decrypted = CryptoJS.AES.decrypt(req.query.encValue, process.env.PRIVATE_KEY);
    res.send(decrypted.toString(CryptoJS.enc.Utf8) === req.query.value)
});

app.get('/getYml', async (req, res) => {
    let yml
    await axios.get('https://raw.githubusercontent.com/' + req.query.githubOwner + '/' + req.query.githubRepo + '/' + 'main' + '/' + 'info.yml', { headers: { Authorization: process.env.KEY_GITHUB ? 'token ' + process.env.KEY_GITHUB : '' } })
        .then(res => yml = res.data)
        .catch(error => console.log(error))
    res.send(yml)
});

app.get('/badge', (req, res) => {
    res.sendFile(__dirname + '/views/badge.html');
});
app.post('/wizzard-check', (req, res) => {
    console.log(req.body.name);
    console.log(req.body.data.name);
    fetch('https://scopes.bluejay.governify.io/api/v1/scopes/development/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: req.body?.name, data: req.body?.data })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            res.send(data);
        })
        .catch(function (error) {
            console.log(error);
        });
});

http.listen(port, () => {
    console.log("Server ready on http://localhost:" + port);
});


