const Listing = require("../models/listing");
module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings})
};

module.exports.showlisting = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews",
        populate:{
            path:"author"
        },
    })
    .populate("Owner");
    if(!listing){
        req.flash("error","listing you requested does not exist!");
        res.redirect("/listings");
    }
    res.render("Listings/show.ejs",{listing})
};

module.exports.rendernewForm = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.createListing = async(req,res,next)=>{
    const newListing = new Listing(req.body.listing);
    newListing.Owner = req.user._id;
   await newListing.save();
   req.flash("success","new listing created");
   res.redirect("/listings");
};

module.exports.renderEdit = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","listing you requested does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
};

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","listing updated");
    res.redirect("/listings");
};

module.exports.deleteListing = async(req,res)=>{
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
};
    