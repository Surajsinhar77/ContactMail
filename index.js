const express = require('express');
const nodemailer = require('nodemailer');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

// Email authtication
const filedata = require('./params.json');

// const myEmail = 'idontknowyou717@gmail.com';
// const secretKey = 'ua6zt3a7qemp324ighbw56ci5jkxkfxl';
// const myEmailPass = 'hqtl wjya vbyk khvm';

// app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');



app.use(session({
    secret: filedata.secretKey, // Replace with a strong, random secret
    resave: false,
    saveUninitialized: true
}));




const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 5000,
    secure: false,
    auth: {
        user: filedata.myEmail,
        pass: filedata.myEmailPass,
    },
});

app.get('/', (req, res) => {
    try {
        const dataToSend = req.session.additionalData;
        return res.render('aditi', { dataToSend })
    } catch (err) {
        console.log(err);
        return res.render('aditi', { err });
    }
});


app.post('/mail', async (req, res) => {
    const email = req.body.email;
    const mailOptions = {
        from: email, // sender address
        to: filedata.myEmail, // receiver email
        subject: `${email} Is Subscribe`, // Subject line
        text: `Hi there, you were emailed from ${email} `,
        html: `<h1> ${email} is now Your Subscriber </h1>`,
    }



    try {
        const info = await transporter.sendMail(mailOptions)
        if (info) {
            console.log("done sending mail");



            const thank = await transporter.sendMail(
                {
                    from: filedata.myEmail, // sender address
                    to: email, // receiver email
                    subject: "Thank You", // Subject line
                    text: `Hi there, you were emailed from ${filedata.myEmail} `,
                    html: `<h1> Thank yor From Subscribe ${email} </h1>`,
                }
            )

            if (thank) {
                req.session.additionalData = {
                    response: { mailUser: true, ownMail: true, statusCode: 'ok', statusCode2: 'fail' },
                    userMessage: 'Form submitted successfully!',
                    ownMessage: 'Form submitted successfully!',
                };
            } else {
                req.session.additionalData = {
                    response: { mailUser: true, ownMail: false, statusCode1: 'ok', statusCode2: 'fail' },
                    userMessage: 'Form submitted successfully!',
                    ownMessage: 'Form submitted Unsuccessfully!',
                };
            }

            return res.redirect('/')
        }
    } catch (error) {
        console.log(error.message);
        req.session.additionalData = {
            response: { mailSent: false, statusCode: 'fail' },
            message: 'Form submit unsuccessfully!'
        };

        return res.redirect('/')
    }
})


app.listen(5000, () => {
    console.log("server is running on post ", 5000);
})

