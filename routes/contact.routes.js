module.exports = app => {

	const token = require("../middlewares/token.middleware");
	const contact = require("../controllers/contact.controller");

	var router = require("express").Router();

	// Create a new Contact
	router.post("/", token.authenticateToken, contact.create);

	// Retrieve all Contact
	// router.get("/", token.authenticateToken, contact.findAll);

	// Retrieve a Contact by id
	router.get("/:id", token.authenticateToken, contact.findOne);

	// Update a Contact by id
	// router.put("/:id", token.authenticateToken, contact.update);

	// Delete Contact by id
	// router.delete("/:id", token.authenticateToken, contact.delete);

	// Delete all Contacts
	// router.delete("/", token.authenticateToken, contact.deleteAll);

	// Search specific Contact
	router.post("/search", token.authenticateToken, contact.search);

	// search specific Contact (PAID version)
	router.post("/paidsearch", token.authenticateToken, contact.paidsearch)

	// contact deep search
	router.post("/deepsearch", token.authenticateToken, contact.deepsearch)

	app.use('/api/contacts', router);
};