const inquirer = require("inquirer");
const db = require("./db/index.js");
require("console.table");

init();

//Begin function with node index.js
function init() {
    questions();
}
//Inquirer prompt sequence
function questions() {
    inquirer.prompt([
        {
            name: "choice",
            message: "What would you like to do?",
            type: "list",
            choices: ["view all departments", "view all roles", "view all employees", "add a department", "add a role, add an employee", "update employee role", "quit"]

        }]).then(function (res) {
            let choice = res.choice;
            switch (choice) {
                case "view all departments":
                    viewAllDepartments();
                    break;
                case "view all roles":
                    viewAllRoles();
                    break;
                case "view all employees":
                    viewAllEmployees();
                    break;
                case "add a department":
                    createDepartment();
                    break;
                case "add a role":
                    createRole();
                    break;
                case "add an employee":
                    createEmployee();
                    break;
                case "update employee role":
                    updateEmployeeRole();
                    break;
                case "quit":
                    return;
            }
        })
}

//View all employees
function viewAllEmployees() {
    db.allEmployees()
        .then(([rows]) => {
            let employees = rows;
            console.log("\n");
            console.table(employees);
        })
        .then(() => questions());
}
//View all roles
function viewAllRoles() {
    db.allRoles()
        .then(([rows]) => {
            let roles = rows;
            console.log("\n");
            console.table(roles);
        })
        .then(() => questions());
}
// View all departments
function viewAllDepartments() {
    db.allDepartments()
        .then(([rows]) => {
            let departments = rows;
            console.log("\n");
            console.table(departments);
        })
        .then(() => questions());
}
// Add role
function createRole() {
    db.allDepartments()
        .then(([rows]) => {
            let departments = rows;
            const departmentChoices = departments.map(({ id, name }) => ({
                name: name,
                value: id
            }));
            prompt([
                {
                    name: "title",
                    message: "What is the name of the role?"
                },
                {
                    name: "salary",
                    message: "What is the salary for this role?"
                },
                {
                    type: "list",
                    name: "department_id",
                    message: "Which department does this role belong to?",
                    choices: departmentChoices
                }
            ]).then(role => {
                db.addRole(role)
                    .then(() => console.log(`Added ${role.title} to the database`))
                    .then(() => questions())
            })
        })
}
// Add department
function createDepartment() {
    prompt([
        {
            name: "name",
            message: "What is the name of the department"
        }
    ]).then(res => {
        let name = res;
        db.addDepartment(name)
            .then(() => console.log(`Added ${name.name} to the database`))
            .then(() => questions())
    })
}
// Add employee
function createEmployee() {
    prompt([
        {
            name: "first_name",
            message: "What's the employee's first name?"
        },
        {
            name: "last_name",
            message: "What's the employee's last name?"
        }
    ])
        .then(res => {
            let firstName = res.first_name;
            let lastName = res.last_name;

            db.allRoles()
                .then(([rows]) => {
                    let roles = rows;
                    const roleChoices = roles.map(({ id, title }) => ({
                        name: title,
                        value: id
                    }));

                    prompt({
                        type: "list",
                        name: "roleId",
                        message: "What's the employee's role?",
                        choices: roleChoices
                    })
                        .then(res => {
                            let roleId = res.roleId;

                            db.allEmployees()
                                .then(([rows]) => {
                                    let employees = rows;
                                    const managerChoices = employees.map(({ id, first_name, last_name }) => ({
                                        name: `${first_name} ${last_name}`,
                                        value: id
                                    }));

                                    managerChoices.unshift({ name: "None", value: null });

                                    prompt({
                                        type: "list",
                                        name: "managerId",
                                        message: "Who's the employee's manager?",
                                        choices: managerChoices
                                    })
                                        .then(res => {
                                            let employee = {
                                                manager_id: res.managerId,
                                                role_id: roleId,
                                                first_name: firstName,
                                                last_name: lastName
                                            }

                                            db.addEmployee(employee);
                                        })
                                        .then(() => console.log(`Added ${firstName} ${lastName} to the database`))
                                        .then(() => questions())
                                })
                        })
                })
        })
}

// Update employee role
function updateEmployeeRole() {
    db.allEmployees()
        .then(([rows]) => {
            let employees = rows;
            const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id
            }));

            prompt([
                {
                    type: "list",
                    name: "employeeId",
                    message: "Which employee's role do you need to change?",
                    choices: employeeChoices
                }
            ])
                .then(res => {
                    let employeeId = res.employeeId;
                    db.allRoles()
                        .then(([rows]) => {
                            let roles = rows;
                            const roleChoices = roles.map(({ id, title }) => ({
                                name: title,
                                value: id
                            }));
                            prompt([
                                {
                                    type: "list",
                                    name: "roleId",
                                    message: "What's the employee's new role?",
                                    choices: roleChoices
                                }
                            ])
                                .then(res => db.updateEmployeeRole(employeeId, res.roleId))
                                .then(() => console.log("Employee role is updated"))
                                .then(() => questions())
                        });
                });
        })
}

//End Sequence
function quit() {
    process.exit();
}