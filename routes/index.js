var express = require('express');
var router = express.Router();

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

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express', age: age});
});

module.exports = router;
