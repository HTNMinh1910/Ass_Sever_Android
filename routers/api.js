var passport = require("passport");
var config = require("../configs/database");
require("../configs/passport")(passport);
var express = require("express");
var jwt = require("jsonwebtoken");
var router = express.Router();
var User = require("../models/UsersModel");
var Product = require("../models/ProductModel");

const bodyParser = require("body-parser");

const request = require('request');

// // parse requests of content-type - application/json
router.use(bodyParser.json());

const parser = bodyParser.urlencoded({ extended: true });

router.use(parser);

// #SIGN UP
const signUpObj = {
  pageTitle: "Sign up",
  task: "Sign up",
  actionTask: "/signUp",
};
router.get("/signUp", async (req, res) => {
  res.render("signUp", signUpObj);
});
router.post("/signUp", async function (req, res) {
  if (!req.body.email || !req.body.pass) {
    signUpObj.notify = "Please pass username and password.";
    return res.render("sign_up", signUpObj);
  } else {
    // check username available
    let check = await User.findOne({email: req.body.email}).lean().exec();
    console.log("check username available ", check);
    if (check) {
      signUpObj.notify = "username available. Try another username";
      return res.render("signUp", signUpObj);
    }

    var newUser = new User({
      email: req.body.email,
      name: req.body.name,
      pass: req.body.pass,
    });
    // save the user
    await newUser.save();
    return res.redirect("/signIn");
  }
});

// #SIGN IN
const signInObj = {
  pageTitle: "Sign in",
  task: "Sign in",
  actionTask: "/api/signIn",
  optionsRegister: true,
};
const homeObj = {
  pageTitle: "Trang chu",
};
router.get("/signIn", async (req, res) => {
  res.render("signIn", signInObj);
});
router.post("/signIn", async function (req, res) {
  console.log(req.body);
  let user = await User.findOne({email: req.body.email});
  console.log(user);
  if (!user) {
    signInObj.notify = "Authentication failed. User not found.";
    return res.render("signIn", signInObj);
  } else {
    // check if password matches
    user.comparePassword(req.body.pass, function (err, isMatch) {
      if (isMatch && !err) {
        // if user is found and password is right create a token
        var token = jwt.sign(user.toJSON(), config.secret);
        // return the information including token as JSON
        // res.json({ success: true, token: 'JWT ' + token });
        homeObj.token = "JWT " + token;
        homeObj.user = user.toObject();
        console.log("homeObj", homeObj);

        //res.header('Authorization', 'JWT ' + token);

        //res.header['Authorization'] = 'JWT ' + token;

        request.get('http://localhost:3000/api/book', {
          headers: { 'Authorization': 'JWT ' + token }
        }, function (error, response, body) {
          res.send(body);
        });

        //return res.redirect("/api/book");
      } else {
        // res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
        signInObj.notify = "Authentication failed. Wrong password.";
        return res.render("signIn", signInObj);
      }
    });
  }
});

// #BOOK
router.post(
  "/book",
  function (req, res) {
    passport.authenticate("jwt", { session: false });
    var token = getToken(req.headers);
    if (token) {
      console.log(req.body);
      var newProduct = new Product({
        isbn: req.body.isbn,
        title: req.body.title,
        author: req.body.author,
        publisher: req.body.publisher,
      });

      newProduct.save(function (err) {
        if (err) {
          return res.json({ success: false, msg: "Save book failed." });
        }
        res.json({ success: true, msg: "Successful created new book." });
      });
    } else {
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  }
);

router.get("/book", async function (req, res) {
  passport.authenticate("jwt", { session: false });
  console.log('Vao get api book');
  console.log("headers: ", req.headers);
  var token = getToken(req.headers);
  if (token) {
    let Products = await Product.find();

    res.json(Products);
    return res.render("home", homeObj);
  } else {
    return res.status(403).send({ success: false, msg: "Unauthorized." });
  }
});

getToken = (headers) => {
  console.log(headers && headers.authorization);
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(" ");
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

module.exports = router;
