const express = require("express");
const router = express();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLogged,isOwner,validateListing} = require("../middleware.js");

const listingCantroller = require("../controller/listing.js");

//index route
router.get( "/", wrapAsync (listingCantroller.index));


//new route
router.get("/new",isLogged,listingCantroller.rendernewForm);

//show route
router.get("/:id",wrapAsync (listingCantroller.showlisting));

//create route
router.post(
    "/",validateListing,isLogged ,
    wrapAsync(listingCantroller.createListing)
);

//edit route
router.get("/:id/edit",isLogged,isOwner,
    wrapAsync (listingCantroller.renderEdit));

//update route
router.put("/:id",isLogged,isOwner,validateListing,wrapAsync(listingCantroller.updateListing));

//delete route
router.delete("/:id", isLogged,
    wrapAsync(listingCantroller.deleteListing)
);

module.exports = router;