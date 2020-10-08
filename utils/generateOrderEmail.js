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
const sendMail = async (email, order) => {
  let html = null
    html = `
    <h1>Thanks for shopping from Antiques E-Eommerse</h1>
    <p><b>Your order has been placed successfully<br> 
    Order Value : ${order.orderValue} INR<br>
    Number of Products : ${order.numberOfProducts} items<br>
    Products :<br>
    ${order.products.map( product => {
        return `<img src="`+ product.image +`" width="100" height="100"><br>`+
            `Title : `+ product.title +`<br>`+
            `Price : `+ product.price +`<br>`+
            `Quantity : `+product.quantity +`<br>`+
            `Total Price :`+ product.totalPrice +`<br>`
    }).join(`<br>`)}
    </b></p>
`
;
  try {
    await mailTransport.sendMail({
      from: GMAIL_EMAIL,
      to: email,
      subject:
        "Order Confirmation",
      html
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = sendMail;
