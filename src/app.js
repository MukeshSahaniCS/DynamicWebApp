require("dotenv").config();
const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const hbs = require("hbs");
require("../src/db/conn");
const Register = require("./models/registers");

const port = process.envPORT || 8000;

const staticPath = path.join(__dirname, "../public");
const templatesPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");
const headerPath = path.join(__dirname, "../templates/partials/header");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// console.log(path.join(__dirname, "../public"));
app.use(express.static(staticPath));
app.set("view engine", "hbs");
app.set("views", templatesPath);
hbs.registerPartials(partialsPath);
hbs.registerPartials(headerPath);

// console.log(process.env.SECRET_KEY);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/home", (req, res) => {
  res.render("home");
});
app.get("/home/*", (req, res) => {
  res.render("error404", {
    errorcomment: "Opps this home page couldn't be found",
  });
});
app.get("/about", (req, res) => {
  res.render("about");
});
app.get("/about/*", (req, res) => {
  res.render("error404", {
    errorcomment: "Opps this about us page couldn't be found",
  });
});

app.get("/contact", (req, res) => {
  res.render("contact");
});
app.get("/contact/*", (req, res) => {
  res.render("error404", {
    errorcomment: "Opps this contact us page couldn't be found",
  });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("*/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;

    if (password === cpassword) {
      const registerEmployee = new Register({
        name: req.body.name,
        mobno: req.body.mobno,
        email: req.body.email,
        password: password,
        confirmpassword: cpassword,
      });

      const token = await registerEmployee.generateAuthToken();

      const registered = await registerEmployee.save();
      res.status(201).render("home");
    } else {
      res.send("Password are not match");
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

// app.post("/login", async (req, res) => {
//   try {
//     const email = req.body.email;
//     const password = req.body.password;

//     const userEmail = await Register.findOne({ email: email });
//     if (userEmail.password === password) {
//       res.status(201).render("home");
//     } else {
//       res.send("password are not match");
//     }
//   } catch (err) {
//     res.status(400).send("Invalid id and password");
//   }
// });
//with hashing

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userEmail = await Register.findOne({ email: email });
    const ismatch = await bcrypt.compare(password, userEmail.password);

    const token = await userEmail.generateAuthToken();

    if (ismatch) {
      res.status(201).render("home");
    } else {
      res.send("Invalid login detail");
    }
  } catch (err) {
    res.status(400).send("Invalid id and password");
  }
});

//password hashing or password secure

// const securePassword = async (password) => {
//   const passwordHash = await bcrypt.hash(password, 10);
//   console.log(passwordHash);

//   const passwordMatch = await bcrypt.compare(password, passwordHash);
//   console.log(passwordMatch);
// };
// securePassword("mukesh@123");

// const createToken = async () => {
//   const token = await jwt.sign(
//     { _id: "65d8fe1013a4ffc13883d71d" },
//     "mynameismukeshsahani123456789",
//     {
//       expiresIn: "2m",
//     }
//   );
//   console.log(token);
//   const userVer = await jwt.verify(token, "mynameismukeshsahani123456789");
//   console.log(userVer);
// };
// createToken();

app.listen(port, () => {
  console.log(`Server is running at port no ${port}`);
});
