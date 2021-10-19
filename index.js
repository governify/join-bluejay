const app = require('express')();
const http = require('http').createServer(app);
const port  = process.env.PORT || 5000;

app.get('/', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        res.sendFile(__dirname + '/index.html');
    } else {
        res.sendFile(__dirname + '/index-local.html');
    }
});

app.get('/badge', (req, res) => {
    res.send("Not implemented yet");
});

http.listen(port, () => {
    console.log("Server ready on port " +  port);
});
