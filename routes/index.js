const express = require('express');
const router = express.Router();
const GitHubApi = require("github");
const contributions = require('github-yearly-contributions');
const nodemailer = require('nodemailer');
const async = require('async');

// get age of person given date string
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

// REST endpoint returns age
router.get('/REST/getAge', function(req, res, next) {
    var myAge = getAge('1991/07/11');
    res.send({age: myAge});
});

// REST endpoint returns github stats
router.get('/REST/getStats', function(req, res, next) {
    var repositories = 'er';
    var yearlyContributions = 'er';
    var followers = 'er';

    // connect the github api
    var github = new GitHubApi({
        protocol: "https",
        host: "api.github.com",
        pathPrefix: "",
        headers: {
            "user-agent": "codytpatterson-github-request"
        },
        followRedirects: false,
        timeout: 5000
    });

    async.parallel({
        repositoyInfo: function (cb) {
            github.users.getForUser({
                username: "code-ee",
            }, function(err, response) {
                repositories = JSON.stringify(response.data.public_repos);
                followers = JSON.stringify(response.data.followers);
                cb(err, {repositories:repositories, followers:followers});
                //console.log(res);
            });
        },
        contributions: function (cb) {
            contributions('code-ee', function(err, amount){
                yearlyContributions = amount;
                cb(err, yearlyContributions);
            });
        }
    }, function (err, result) {
        if(err){
            console.error("an error occurred getting information from github: ", {
                err: err
            });
            res.status(500).send({error: 'Something failed!'});
            return;
        }
        res.send({
            followers: result.repositoyInfo.followers,
            repositories: result.repositoyInfo.repositories,
            contributions: result.contributions
        });
    });
});

// initialize connection with gmail account
var myEmail = 'myEmail@gmail.com';
var myPass = 'password123';
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: myEmail,
        pass: myPass
    }
});

// send email
router.post('/REST/sendEmail', function(req, res, next) {
    var from = '"' + req.body.first;
    from += ' ' + req.body.last + '" <';
    from += req.body.email + '>';
    var subject = req.body.subject;
    var text = 'AUTOMATED EMAIL FROM CODYPATTERSON.COM:\n';
    text += 'from: ' + from + '\n';
    text += 'phone: ' + req.body.phone + '\n\n';
    text += req.body.message;

    // send the email to myself
    var mailOptions = {
        from: from,
        to: myEmail,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    var autoEmailResponse = 'You are receiving this email because you recently submitted a form on codypatterson.com\n\n';
    autoEmailResponse += 'Thank you for sending me the email, I\'ll be sure to get back to you within 48 hours or less.';

    // send email back to sender automatically letting them know it was send
    mailOptions = {
        from: myEmail,
        to: from,
        subject: 'DO NOT REPLY: CODY PATTERSON',
        text: autoEmailResponse
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    res.end();
});


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

module.exports = router;
