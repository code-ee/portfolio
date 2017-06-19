var express = require('express');
var router = express.Router();

var sections = {
    home: '#home',
    tech: '#tech',
    projects: '#projects',
    social: '#social',
    stats: '#stats',
    resume: '#resume',
    employment: '#employment',
    contact: '#contact'
};

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express', sections: sections});
});

module.exports = router;
