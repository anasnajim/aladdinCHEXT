const { sequelize } = require("../models");
const models = require("../models");
const Contact = models.contact;
const UserContact = models.user_contacts;
const UserCredits = models.user_credits;
const UserUsages = models.user_usages;
const Op = models.Sequelize.Op;
const where = models.Sequelize.where;
const fn = models.Sequelize.fn;
const col = models.Sequelize.col;
const literal = models.Sequelize.literal;

// create/save Contact model
// exports.create = async (req, res) => {
// 	if (!req.body.name) {
// 		res.status(400).send({
// 			message: "Contact name required!"
// 		});
// 		return;
// 	}

// 	const contact = {
// 		name: req.body.name,
// 		profile: req.body.profile,
// 		email: req.body.email,
// 		phone: req.body.phone
// 	};

// 	await Contact.create(contact)
// 		.then(data => {
// 			res.send(data);
// 		})
// 		.catch(err => {
// 			res.status(500).send({
// 				message:
// 					err.message || "Error saving contact."
// 			});
// 		});
// };

// get all Contact records
// exports.findAll = async (req, res) => {
// 	const name = req.query.name;
// 	var filter = name ? { name: { [Op.like]: `%${name}%` } } : null;

// 	await Contact.findAll({ where: filter })
// 		.then(data => {
// 			res.send(data);
// 		})
// 		.catch(err => {
// 			res.status(500).send({
// 				message:
// 					err.message || "Error retrieving contact."
// 			});
// 		});
// };

// find Contact by id
exports.findOne = async (req, res) => {
	const id = req.params.id;

	await Contact.findByPk(id)
		.then(data => {
			res.send(data);
		})
		.catch(err => {
			res.status(500).send({
				message: "Error retrieving Contact ID =" + id
			});
		});
};

// update Contact by id
// exports.update = async (req, res) => {
// 	const id = req.params.id;

// 	await Contact.update(req.body, {
// 		where: { id: id }
// 	})
// 		.then(num => {
// 			if (num == 1) {
// 				res.send({
// 					message: "Contact updated successfully."
// 				});
// 			} else {
// 				res.send({
// 					message: `Error updating Contact by id=${id}. Contact ID not found.`
// 				});
// 			}
// 		})
// 		.catch(err => {
// 			res.status(500).send({
// 				message: "Error updating Contact by id=" + id
// 			});
// 		});
// };

// delete Contact by id
// exports.delete = async (req, res) => {
// 	const id = req.params.id;

// 	await Contact.destroy({
// 		where: { id: id }
// 	})
// 		.then(num => {
// 			if (num == 1) {
// 				res.send({
// 					message: "Contact successfully deleted!"
// 				});
// 			} else {
// 				res.send({
// 					message: `Error deleting Contact by id=${id}. Contact ID not found.`
// 				});
// 			}
// 		})
// 		.catch(err => {
// 			res.status(500).send({
// 				message: "Error deleting Contact by id=" + id
// 			});
// 		});
// };

// delete ALL contact records
// exports.deleteAll = (req, res) => {
// 	Contact.destroy({
// 		where: {},
// 		truncate: false
// 	})
// 		.then(nums => {
// 			res.send({ message: `${nums} Contacts successfully deleted!` });
// 		})
// 		.catch(err => {
// 			res.status(500).send({
// 				message:
// 					err.message || "Error deleting all Contact(s)"
// 			});
// 		});
// };

// search specific contact record by name
exports.search = async (req, res) => {
	if (!req.body.name || !req.body.company) {
		res.send({
			email: "",
			phone: ""
		});
		return;
	}

	try {
		let name = (req.body.name).toLowerCase();
		let company = (req.body.company).toLowerCase();

		const contact = await Contact.findOne({
			where: {
				[Op.and]: [
					where(
						fn('concat', fn('lower', col('firstname')), ' ', fn('lower', col('lastname'))),
						{
							[Op.eq]: name
						}
					),
					where(
						fn('lower', col('company')),
						{
							[Op.eq]: company
						}
					)
				]
			}
		});

		if (contact === null) {
			res.send({
				email: "",
				phone: ""
			});
			return;
		} else {

			let secureEmail = await function (email) {
				if (!email) return "";
				return email.replace(/(.{0})(.*)(?=@)/,
					function (match, result, orig) {
						for (let i = 0; i < orig.length; i++) {
							result += "*";
						} return result;
					});
			};

			let securePhone = await function (phone) {
				if (!phone) return "";
				return phone.slice(0, parseInt(phone.length / 2)) + "*".repeat(parseInt(phone.length / 2));
			}

			let userContact = await UserContact.findOne({
				where: {
					user_id: req.user_id,
					contact_id: contact.id
				}
			});

			// multiple email
			let em = contact.email.split(',');
			let em_list = [];
			if (em.length > 1 && !userContact) {
				for (let x = 0; x < em.length; x++) {
					em_list.push(secureEmail(em[x]));
				}
				contact.email = em_list.join(',');
			} else if (!userContact) {
				contact.email = secureEmail(contact.email);
			} else {
				// do nothing
			}

			res.send({
				name: contact.name,
				email: contact.email,
				phone: userContact ? contact.phone : securePhone(contact.phone),
				tel: userContact ? contact.tel : securePhone(contact.tel),
				in_url: contact.in_url,
				company: contact.company,
				company_site: contact.company_site,
				about: contact.about,
				num_employees: contact.num_employees,
				industry_tags: contact.industry_tags,
				founded: contact.founded,
				hq: contact.hq,
				country: contact.country,
				social_fb: contact.social_fb,
				social_in: contact.social_in,
				social_ig: contact.social_ig,
				social_tw: contact.social_tw
			});
		}

	} catch (err) {
		res.send({
			email: "",
			phone: ""
		});
		return;
	};
};

// PAID: search specific contact record by name
exports.paidsearch = async (req, res) => {
	if (!req.body.name || !req.body.company) {
		res.send({
			email: "",
			phone: ""
		});
		return;
	}

	try {
		let name = (req.body.name).toLowerCase();
		let company = (req.body.company).toLowerCase();

		const contact = await Contact.findOne({
			where: {
				[Op.and]: [
					where(
						fn('concat', fn('lower', col('firstname')), ' ', fn('lower', col('lastname'))),
						{
							[Op.eq]: name
						}
					),
					where(
						fn('lower', col('company')),
						{
							[Op.eq]: company
						}
					)
				]
			}
		});

		if (contact === null) {
			res.send({
				email: "",
				phone: ""
			});
			return;
		} else {

			const user_contact = {
				user_id: req.user_id,
				contact_id: contact.id
			};

			let user_contact_link_exist = await UserContact.findOne({
				where: user_contact
			});

			let wish_usage = false;

			if (!user_contact_link_exist) {

				let free_wish = await UserCredits.findOne({
					where: {
						user_id: req.user_id,
						credit_type: 'trial',
						used_credits: {
							[Op.lt]: col('credits')
						},
						[Op.and]: [
							literal(`createdAt + INTERVAL 90 day >= now()`)
						]
					},
					order: [
						['id', 'ASC']
					]
				});

				let referral_wish = await UserCredits.findOne({
					where: {
						user_id: req.user_id,
						credit_type: 'referral',
						used_credits: {
							[Op.lt]: col('credits')
						},
						[Op.and]: [
							literal(`createdAt + INTERVAL 90 day >= now()`)
						]
					},
					order: [
						['id', 'ASC']
					]
				});

				let paid_wish = await UserCredits.findOne({
					where: {
						user_id: req.user_id,
						credit_type: 'paid',
						used_credits: {
							[Op.lt]: col('credits')
						},
						[Op.and]: [
							literal(`createdAt + INTERVAL 90 day >= now()`)
						]
					},
					order: [
						['id', 'ASC']
					]
				});

				// @todo - non-hardcoded access_types from table: user_access_types
				if (free_wish !== null) {
					
					let new_user_contact = await UserContact.create(user_contact);
					if (!new_user_contact) {
						res.status(500).send({
							message: "Contact link not saved!"
						});
						return;
					}

					free_wish.used_credits += 1;
					free_wish.save();

					// set access type: 0 - trial
					await UserContact.update({
						access_type: 0
					}, {
						where: {
							id: new_user_contact.id
						}
					});

					wish_usage = true;

				} else if (referral_wish !== null) {

					let new_user_contact = await UserContact.create(user_contact);
					if (!new_user_contact) {
						res.status(500).send({
							message: "Contact link not saved!"
						});
						return;
					}

					free_wish.used_credits += 1;
					free_wish.save();

					// set access type: 1 - referral
					await UserContact.update({
						access_type: 1
					}, {
						where: {
							id: new_user_contact.id
						}
					});

					wish_usage = true;

				} else if (paid_wish !== null) {

					let new_user_contact = await UserContact.create(user_contact);
					if (!new_user_contact) {
						res.status(500).send({
							message: "Contact link not saved!"
						});
						return;
					}
					
					paid_wish.used_credits += 1;
					paid_wish.save();

					// set access type: 2 - paid
					await UserContact.update({
						access_type: 2
					}, {
						where: {
							id: new_user_contact.id
						}
					});

					wish_usage = true;

				}else{
					// no free and paid wish credits
					// return blanks
					res.send({
						email: "",
						phone: ""
					});
					return;
				}
			}

			if(wish_usage){
				const usage_info = {
					user_id: req.user_id,
					week_usage: literal(`week(now())`)
				};
				await UserUsages.create(usage_info);
			}

			res.send({
				name: contact.name,
				email: contact.email,
				phone: contact.phone,
				tel: contact.tel,
				in_url: contact.in_url,
				company: contact.company,
				company_site: contact.company_site,
				about: contact.about,
				num_employees: contact.num_employees,
				industry_tags: contact.industry_tags,
				founded: contact.founded,
				hq: contact.hq,
				country: contact.country,
				social_fb: contact.social_fb,
				social_in: contact.social_in,
				social_ig: contact.social_ig,
				social_tw: contact.social_tw
			});
		}

	} catch (err) {
		res.send({
			email: "",
			phone: ""
		});
		return;
	};
};

// contact deep search
exports.deepsearch = async (req, res) => {



};