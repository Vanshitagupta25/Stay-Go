const express = require("express");
const app = express();
const users = require("./routes/user.js");
const posts = require("./routes/post.js");
const session = require("express-session");
const { name } = require("ejs");
const flash = require("connect-flash");
const path = require("path");
const { info } = require("console");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true }
}));
app.use(flash());

app.use((req,res,next) => {
  res.locals.msg = req.flash("info");
  res.locals.err = req.flash("err");
  next();

});


app.get("/register" , (req,res) => {
  let {name = "anonymous"} = req.query;
  req.session.name = name;
  if(name === "anonymous") {
    req.flash("info" , "User registeration failed")
  } else {
    req.flash("err" , "User registeration successful");
  }
  res.redirect("/hello");
});

app.get("/hello" ,(req,res) => {
  res.render("pages.ejs" , {name: req.session.name});


});
// app.get("/reqcount" , (req,res)=> {
//   if( req.session.count) {
//     req.session.count++;
//   } else {
//     req.session.count = 1;
//   }
//   res.send(`sent a req ${req.session.count} times`);

// });

app.get("/test" , (req,res) => {
  res.send("test successful");

});

app.listen("3000", () => {
  console.log("server is listening");
});

// app.use(cookieParser("secretcode"));

// app.get("/signedcookies" , (req,res) => {
//   res.cookie("made-in" , "India" , {signed:true});
//   res.send("signed cookie send");

// });

// app.get("/verify" , (req,res) => {
// console.log(req.signedCookies);
// res.send("verified");
// });


// app.get("/cookies" , (req,res) => {
//    res.cookie("greet" , "hello");
//   res.send("this is a cookie msg");

// });

// app.get("/" , (req,res) => {
//   console.dir(req.cookies);
//   res.send("working");

// });
// app.use("/users" , users);
// app.use("/posts" , posts);
