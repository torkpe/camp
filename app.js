var currentId       = require("async_hooks");
var express         = require("express");
var app             = express();
var bodyParser      = require("body-parser");
var mongoose        = require("mongoose");
var flash           = require("connect-flash");
var passport        = require("passport");
var http            = require("http");
var LocalStrategy   = require("passport-local");
var methodOverride  = require("method-override")
var Campground      = require("./models/campground");
var Comment         = require("./models/comment");
var User            = require("./models/user");
//var seedDB          = require("./seed");

var commentRoutes       = require("./routes/comment");
var campgroundRoutes    = require("./routes/campground");
var indexRoutes         = require("./routes/index")
// mongoose.connect("mongodb://localhost/aremu_camp");
// mongoose.connect("mongodb://localhost/aremu_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
//seedDB();
app.use(flash());

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "I love my siblings",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash ('error');
    res.locals.success = req.flash ('success');
    // console.log(currentId)
    next();
});

app.use(indexRoutes);
app.use("/campground", campgroundRoutes);
app.use("/campground/:campgroundId/comment", commentRoutes);


mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/aremu_camp", function (err, client) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
//   db = mon``
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 5000, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// app.listen(5000,function(){
//     console.log('listening on port 5000')
// });