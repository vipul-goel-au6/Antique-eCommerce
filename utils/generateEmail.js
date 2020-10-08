const nodemailer = require("nodemailer");
const { GMAIL_EMAIL, GMAIL_PASSWORD } = process.env;

const transportOptions = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  debug: process.env.NODE_ENV === "development",
  auth: {
    user: GMAIL_EMAIL,
    pass: GMAIL_PASSWORD
  }
};

const mailTransport = nodemailer.createTransport(transportOptions);
const sendMail = async (mode, email, token) => {
  const domainName = process.env.DOMAIN_NAME || `http://localhost:1234`;
  let html = null
  if (mode === "confirm")
    html = `
    <h1>Welcome to Antiques E-Eommerse</h1>
    <p>Thanks for creating an account.<br> 
    Click <a href=${domainName}/confirm/${token}>here</a> to confirm your account.<br> 
    Or copy paste <br>${domainName}/confirm/${token}<br> to your browser.
    </p>
`;
  else if (mode === "reset")
    html = `<h1>Hi there.</h1>
<p>You have recently requested for a change in password.<br> 
Click <a href=${domainName}/reset/${token}>here</a> to reset your password.<br> Or copy paste<br>
 ${domainName}/reset/${token} <br>
 to your browser.<br> 
 If you didnt initiate the request. Kindly ignore. Thanks :)
</p>`;
  try {
    await mailTransport.sendMail({
      from: GMAIL_EMAIL,
      to: email,
      subject:
        mode === "confirm" ? "Confirm your email" : "Reset your password",
      html
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = sendMail;
