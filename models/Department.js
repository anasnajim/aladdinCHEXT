module.exports = (sequelize, Sequelize) => {
    const Department = sequelize.define("departments", {
        dept_name: {
            type: Sequelize.STRING
        }
    });

    return Department;
};