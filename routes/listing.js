const express = require("express");
const router = express();
const wrapAsync = require("../utils/wrapAsync.js");
const expresserror = require("../utils/expresserror.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new expresserror(400,errMsg);
    }else
    {
        next();
    }
}
//index route
router.get(
    "/",
    wrapAsync (async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings})}
    ));


//new route
router.get("/new",(req,res)=>{
    res.render("listings/new.ejs");
})

//show route
router.get(
    "/:id",
    wrapAsync (async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","listing you requested does not exist!");
        res.redirect("/listings");
    }
    res.render("Listings/show.ejs",{listing})}
    ));

//create route
router.post(
    "/",validateListing,
    wrapAsync(async(req,res,next)=>{
        const newListing = new Listing(req.body.listing);
       await newListing.save();
       req.flash("success","new listing created");
       res.redirect("/listings");
    }) 
);

//edit route
router.get("/:id/edit",
    wrapAsync (async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","listing you requested does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
}));

//update route
router.put("/:id",
    validateListing,
    wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","listing updated");
    res.redirect("/listings");
}));

//delete route
router.delete("/:id",
    wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
}));

module.exports = router;