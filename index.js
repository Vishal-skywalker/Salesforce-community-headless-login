const BASE_PATH = '/api/v1/'

const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.get(BASE_PATH , (req, res) =>{
    res.send("Srver is running");
});

app.post(BASE_PATH + 'login',(req, res) => {
    const clientId = req.body.clientId;
    const communityUrl = req.body.communityUrl;
    const username = req.body.username;
    const password = req.body.password;
    if (!clientId || !communityUrl || !username || !password) {
        res.status(400).send("required parameter missing");
    }
    const encodedUNP = btoa(username + ':' + password);
    const headers = {
        "Authorization": "Basic " + encodedUNP,
        "Content-Type": "application/x-www-form-urlencoded",
        "Auth-Request-Type": "Named-User"
    };
    axios
        .post(communityUrl + `/services/oauth2/authorize?response_type=code_credentials&client_id=${clientId}&redirect_uri=http://localhost:3000/callback`,{},{
            headers
        })
        .then((result) => {
            // console.log('result :>> ', result.data);
            doCodeExchange(result.data, clientId, res);
            // res.json(result.data)
        }).catch((err) => {
            console.clear()
            // console.log('err :>> ', err.response.data);
            res.json(err.response.data);
        });
    res.end();
});

function doCodeExchange(authorizeResponse, clientId, res) {
    axios
        .post(authorizeResponse.sfdc_community_url + `/services/oauth2/token?code=${authorizeResponse.code}&grant_type=authorization_code&client_id=${clientId}&redirect_uri=http://localhost:3000/callback`)
        .then(response => {
            // console.log('response.data :>> ', response.data);
            res.json(response.data);
        })
        .catch(err => {
            // console.log('err :>> ', err);
            res.json(err.data);
        });
 }

app.get('/callback', (req, res) => {
    // console.log('req :>> ', req.query);
    res.json(req.query);
})

const port = 3000;
app.listen(port, () => 
    {
        console.clear();
        console.log('App listening at http://localhost:' + port);
    }
);