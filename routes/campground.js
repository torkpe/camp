var currentId   = require("async_hooks");

var express     = require("express");
var router      = express.Router({ mergeParams: true});
var Campground  = require("../models/campground");
var middleware  = require("../middleware");
var path        = require('path');
var multer      = require("multer");
var moment      = require("moment");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'Public/uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
    }
  })

var upload = multer({storage: storage});

//INDEX - show all campground
router.get("/", function(req,res){
    // Get all campground from DB
    Campground.find({}, function(err, allCampground){
        if(err){
            console.log(err);
        } else {
            res.render("campground/index",{campground:allCampground});
        }
    });
});

router.get("/contact",function(req,res){
    res.render("campground/contact")
});

//CREATE - add new campground to DB
router.post("/", upload.single('image'),middleware.isLoggedIn, function(req,res){
    //get data from form and add to campground array
    var urlBase = req.protocol + '://' + req.get('host');
    var name = req.body.name;
    var image = urlBase + "/uploads/" + req.file.filename;
    var description  =req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground ={name: name, image: image, description: description, author: author}
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if (err){
            console.log(err);
        } else {
            req.flash("success","Successfully Added a NewStatus!");
            //redirect back to campground page
            res.redirect("/campground")
        }
    });
});

router.get("/new", middleware.isLoggedIn, function(req,res){
    res.render("campground/new")
});

//SHOW - more info about one campground
router.get("/:id", function(req, res){
     //find the campground with provided ID
     Campground.findById(req.params.id).populate("comment").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else{
        console.log('>>>>>>>>>>>>>>>',foundCampground);
        //render show template with the campground
        res.render("campground/show",{campground:foundCampground, currentUser: req.user, moment: moment});
        }
    });
});     

//Edit campground route
router.get("/:id/edit",middleware.checkCampgroundOwnership, function(req, res){
       Campground.findById(req.params.id, function(err, foundCampground){
       res.render("campground/edit", {campground: foundCampground});
 });
});

//Update campground route
router.put("/:id",middleware.checkCampgroundOwnership, function(req, res){
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, Updatedcampground){
        if(err){
            res.redirect("/campground");
        } else {
            req.flash("success","Successfully Updated Your Status!");
            res.redirect("/campground/" + req.params.id);
        }
    });
});
 //DESTROY CAMPGROUND ROUTE
 router.delete("/:id",middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campground");
        } else {
            req.flash("success","Successfully Deleted Your Status!");
            res.redirect("/campground")
        }
    });
 });

module.exports = router;