var express = require('express');
var router = express.Router();
var GitHubApi = require("github");
var contributions = require('github-yearly-contributions');

// connect the github api
var github = new GitHubApi({
    // optional
    debug: true,
    protocol: "https",
    host: "api.github.com",
    pathPrefix: "",
    headers: {
        "user-agent": "codytpatterson-github-request"
    },
    Promise: require('bluebird'),
    followRedirects: false,
    timeout: 5000
});

// get age of cody
function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

var age = getAge('1991/07/11');
var repositories = 'err';
var yearlyContributions = 'err';
var followers = 'err';

// optional authenticate, not needed for non-sensitive info such as followers
// github.authenticate({
//     type: "basic",
//     username: "username123",
//     password: "password321"
// });

github.users.getForUser({
    username: "code-ee",
}, function(err, res) {
    repositories = JSON.stringify(res.data.public_repos);
    followers = JSON.stringify(res.data.followers);
});

// get the number of user code-ee's contributions within the last year
contributions('code-ee', function(err, amount){
    yearlyContributions = amount;
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express',
        age: age,
        followers: followers,
        repositories: repositories,
        contributions: yearlyContributions
    });
});

module.exports = router;
