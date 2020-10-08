const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");

dotenv.config();
require("./db");

const app = express();

app.use(express.json())

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    name: "antiques project session",
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 30,
      httpOnly: true,
      secure: false,
      sameSite: "strict"
    }
  })
);

// Routes
app.use(require("./routes/userRoutes"));
app.use(require("./routes/productsRoutes"));
app.use(require("./routes/cartRoutes"));
app.use(require("./routes/wishlishRoutes"));
app.use(require("./routes/userEmailRoutes"));
app.use(require("./routes/orderRoutes"));
app.use(require("./routes/reviewsRoutes"));

module.exports = app;
