module.exports = app => {
    const auth = require("../controllers/auth.controller");

    var router = require("express").Router();

    // Registration
    router.post("/register", auth.register);

    // Login
    router.post("/login", auth.login);

    app.use('/api/user', router);
};