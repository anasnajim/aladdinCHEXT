const dbConfig = require("../config/db.config");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./User.js")(sequelize, Sequelize);
db.user_credits = require("./UserCredits.js")(sequelize, Sequelize);
db.user_usages = require("./UserUsages.js")(sequelize, Sequelize);
db.user_referrals = require("./UserReferrals.js")(sequelize, Sequelize);
db.user_contacts = require("./UserContacts.js")(sequelize, Sequelize);
db.user_access = require("./UserAccessTypes.js")(sequelize, Sequelize);
db.department = require("./Department.js")(sequelize, Sequelize);
db.contact = require("./Contact.js")(sequelize, Sequelize);

module.exports = db;