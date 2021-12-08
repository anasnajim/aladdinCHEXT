const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { sequelize } = require("../models");
const models = require("../models");
const User = models.user;
const Contact = models.contact;
const UserContact = models.user_contacts;
const UserCredits = models.user_credits;
const UserUsages = models.user_usages;
const Op = models.Sequelize.Op;
const where = models.Sequelize.where;
const fn = models.Sequelize.fn;
const col = models.Sequelize.col;
const literal = models.Sequelize.literal;

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
		let name = (req.body.name).toLowerCase().trim();
		let company = (req.body.company).toLowerCase().trim();

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

			let secureEmail = function (email) {
				if (!email) return "";
				return email.replace(/(.{0})(.*)(?=@)/,
					function (match, result, orig) {
						for (let i = 0; i < orig.length; i++) {
							result += "*";
						} return result;
					});
			};

			let securePhone = function (phone) {
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
			if(contact.email === null){
				contact.email = "";
			}
			let em = contact.email.split(',');
			let em_list = [];
			if (em.length > 1 && !userContact) {
				for (let x = 0; x < em.length; x++) {
					em_list.push(secureEmail(em[x]));
				}
				contact.email = em_list.join(',');
			} else if (!userContact) {
				contact.email = secureEmail(contact.email);
			}

			// multiple phone
			if(contact.phone === null){
				contact.phone = "";
			}
			let phone = contact.phone.split(',');
			let phone_list = [];
			if (phone.length > 1 && !userContact) {
				for (let x = 0; x < phone.length; x++) {
					phone_list.push(securePhone(phone[x]));
				}
				contact.phone = phone_list.join(',');
			} else if (!userContact) {
				contact.phone = securePhone(contact.phone);
			}

			// multiple tel
			if(contact.tel === null){
				contact.tel = "";
			}
			let tel = contact.tel.split(',');
			let tel_list = [];
			if (tel.length > 1 && !userContact) {
				for (let x = 0; x < tel.length; x++) {
					tel_list.push(securePhone(tel[x]));
				}
				contact.tel = tel_list.join(',');
			} else if (!userContact) {
				contact.tel = securePhone(contact.tel);
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
		let name = (req.body.name).toLowerCase().trim();
		let company = (req.body.company).toLowerCase().trim();

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
							literal(`"createdAt" + INTERVAL '14 days' >= now()`)
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
						}
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
						}
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

					free_wish.used_credits += process.env.PER_MAKE_WISH;
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

					referral_wish.used_credits += process.env.PER_MAKE_WISH;
					referral_wish.save();

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
					
					paid_wish.used_credits += process.env.PER_MAKE_WISH;
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
					week_usage: literal(`DATE_PART('week', now())`)
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

// meeting request
exports.reqmeet = async (req, res) => {
	try{
        
		const purpose = req.body.purose;
		const remail = req.body.remail;
		const rname = req.body.rname;
		const sched1 = req.body.sched1;
		const sched2 = req.body.sched2;
		const sched3 = req.body.sched3;

		// multiple emails
		let em = remail.split(',');
		let em_to = [];
		if (em.length > 0) {
			for (let x = 0; x < em.length; x++) {
				em_to.push({ 'email' : em[x].trim() });
			}
		}

		let em_bcc = [
			{ 'email' : 'kurt@aladdinb2b.com'}
		];

		const valid_user = await User.findOne({ where: { id: req.user_id } });

		const msg = {
			to: em_to,
			reply_to: valid_user.user_email,
			from: process.env.SENDGRID_MAIL_PORTAL,
			fromname: `${valid_user.user_firstname} ${valid_user.user_lastname}`,
			bcc: em_bcc,
			subject: "Request for a Meeting",
			text: `Hi ${rname}, I noticed you have an impressive profile and I’d to talk to you about ${purpose}. I’m available in any of the following time slots: ${sched1}, ${sched2}, ${sched3} Get your free meetings with Aladdin. Looking forward to e-meeting you, ${valid_user.user_firstname} ${valid_user.user_lastname} ${valid_user.user_email}`,
			html: `Hi ${rname},<br/><br/>I noticed you have an impressive profile and I’d to talk to you about ${purpose}.<br/><br/>I’m available in any of the following time slots:<br/><br/>${sched1}<br/>${sched2}<br/>${sched3}<br/><br/>Get your free meetings with Aladdin.<br/><br/><br/>Looking forward to e-meeting you,<br/>${valid_user.user_firstname} ${valid_user.user_lastname}<br/>${valid_user.user_email}`,
		};

		let free_wish = await UserCredits.findOne({
			where: {
				user_id: req.user_id,
				credit_type: 'trial',
				used_credits: {
					[Op.lt]: col('credits')
				},
				[Op.and]: [
					literal(`"createdAt" + INTERVAL '14 days' >= now()`)
				]
			},
			order: [
				['id', 'ASC']
			]
		});

		if (free_wish !== null && (free_wish.credits - free_wish.used_credits - parseInt(process.env.PER_MEET_REQUEST)) >= 0) {
			free_wish.used_credits += process.env.PER_MEET_REQUEST;
			free_wish.save();
		}else{
			res.status(500).send({
				message: "Meeting request unsuccessful. You have insufficient credits."
			});
		}

		sgMail
		.send(msg)
		.then( (response) => {
			if(response[0].statusCode === 202){
				res.send({ reqmeet: 'Meeting request sent successfully!' });
			}else{
				res.status(500).send({
					message: "Meeting request unsuccessful. Please try again."
				});
			}   
		})
		.catch((error) => {
			res.status(500).send({
				message: "Meeting request unsuccessful. Please try again."
			});
		});

    }catch(err){
        res.status(500).send({
			message: "Meeting request unsuccessful. Please try again."
        });
    }
};