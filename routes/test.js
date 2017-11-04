var express = require('express');
var nodemailer = require('nodemailer');

var router = express.Router();

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'seo.itradicals@gmail.com',
        pass: 'itradicals1233#'
    }
});

var mailOptions = {
    from: 'seo.itradicals@gmail.com', // sender address
    to: 'asif@itradicals.com', // list of receivers
    subject: 'Vendors Profile Details.', // Subject line
    text: 'Hello Mr. Lucifer', // plain text body
};

router.get('/', function(req, res, next) {
//res.send("Hello Mr Lucifer");
	transporter.sendMail(mailOptions, (error, info) => {
	    if (error) {
	        return console.log(error);
	    }
	    console.log('Message %s sent: %s', info.messageId, info.response);
	});
});

module.exports = router;