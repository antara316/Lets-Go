const express = require("express");
const router = express.Router({mergeParams:true});
const reviews = require("../models/reviews");
const wrapAsync = require("../utils/wrapAsync.js");
const expresserror = require("../utils/expresserror.js");
const {listingSchema,reviewSchema} = require("../schema.js");
const Review = require ("../models/reviews.js");
const Listing = require("../models/listing.js");

const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new expresserror(400,errMsg);
    }else
    {
        next();
    }
}

//reviews
router.post("/", validateReview, wrapAsync (async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("new review send");
    req.flash("success","new review created");
    res.redirect(`/listings/${listing._id}`);
}));

//delete review route
router.delete("/:reviewid", 
    wrapAsync(
        async(req,res)=>{
            let {id,reviewid}= req.params;
            await Listing.findByIdAndUpdate(id,{pull:{reviews:reviewid}});
            await Review.findByIdAndDelete(reviewid);
            req.flash("success","review deleted");
            res.redirect(`/listings/${id}`);
        }
))

module.exports = router;