const app = require('express')();
const http = require('http').createServer(app);
const port  = process.env.PORT || 5000;
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

var CryptoJS = require("crypto-js");

app.get('/', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        res.sendFile(__dirname + '/views/index.html');
    } else {
        res.sendFile(__dirname + '/views/index-local.html');
    }
});

app.get('/wizard', (req, res) => {
    res.sendFile(__dirname + '/views/wizard.html');
});

app.get('/encripted_field_check', (req, res) => {
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

app.get('/getYml', async(req, res) => {
    let yml 
    await axios.get('https://raw.githubusercontent.com/' + req.query.githubOwner + '/' + req.query.githubRepo + '/' + 'main' + '/' + 'info.yml', { headers: { Authorization: process.env.KEY_GITHUB ? 'token ' + process.env.KEY_GITHUB : '' }})
        .then(res => yml = res.data)
        .catch(error => console.log(error))
    res.send(yml)
});

app.get('/badge', (req, res) => {
    res.send("Not implemented yet");
});

http.listen(port, () => {
    console.log("Server ready on port " +  port);
});


