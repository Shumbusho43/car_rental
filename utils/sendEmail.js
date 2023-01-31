const nodemailer = require("nodemailer");

function sendEmail(options) {
    const transport = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    const mailOptions = {
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.message,
        // attachments: options.data
    }
    transport.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        }
    })
}
module.exports = sendEmail;