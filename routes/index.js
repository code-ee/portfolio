var express = require('express');
var router = express.Router();
var GitHubApi = require("github");
var contributions = require('github-yearly-contributions');
var nodemailer = require('nodemailer');

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
var age = 'err';
var repositories = 'err';
var yearlyContributions = 'err';
var followers = 'err';

// set up email
var myEmail = 'email@gmail.com';
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
    age = getAge('1991/07/11');

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

    res.render('index', {
        title: 'Express',
        age: age,
        followers: followers,
        repositories: repositories,
        contributions: yearlyContributions
    });
});

module.exports = router;
