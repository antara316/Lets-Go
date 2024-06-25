const express= require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const expresserror = require("./utils/expresserror.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require ("./models/reviews.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));//to parse the data
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

main()
   .then((res)=>{
    console.log("monoose is listening!");
   })
   .catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wonderLust');
}

app.get("/",(req,res)=>{
    res.send("port is listening!");
})

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

 

//index route
app.get(
    "/listings",
    wrapAsync (async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings})}
    ));


//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

//show route
app.get(
    "/listings/:id",
    wrapAsync (async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("Listings/show.ejs",{listing})}
    ));

//create route
app.post(
    "/listings",validateListing,
    wrapAsync(async(req,res,next)=>{
        const newListing = new Listing(req.body.listing);
       await newListing.save();
       res.redirect("/listings");
    }) 
);

//edit route
app.get("/listings/:id/edit",
    wrapAsync (async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//update route
app.put("/listings/:id",
    validateListing,
    wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings");
}));

//delete route
app.delete("/listings/:id",
    wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

//reviews
app.post("/listings/:id/reviews", validateReview, wrapAsync (async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("new review send");
    res.redirect(`/listings/${listing._id}`);
}));

//delete review route
app.delete("/listings/:id/reviews/:reviewid", 
    wrapAsync(
        async(req,res)=>{
            let {id,reviewid}= req.params;
            await Listing.findByIdAndUpdate(id,{pull:{reviews:reviewid}});
            await Review.findByIdAndDelete(reviewid);
            res.redirect(`/listings/${id}`);
        }
    ))

app.all("*",(req,res,next)=>{
    next(new expresserror(404,"page not found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
})

app.listen(8080,()=>{
    console.log("port is listening!");
});

