module.exports = app => {
    const token = require("../middlewares/token.middleware");
    const user = require("../controllers/user.controller");

    var router = require("express").Router();

    // Credits
    router.get("/credits", token.authenticateToken, user.credits);

    // Weekly Usage
    router.get("/weekly", token.authenticateToken, user.weekly);

    // Referral
    router.post("/referral", token.authenticateToken, user.referral);

    app.use('/api/user', router);
};