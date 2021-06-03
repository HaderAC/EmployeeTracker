const inquirer = require('inquirer');
const { async } = require('rxjs');
const { resolve } = require('path');
const { promises } = require('fs');

let connectionA;

const connect = (connection) => {
    connectionA = connection
    init();
}

const init = async () => {
    const userChoice = await promptResponse();

    const functionPicked = await switchChoices(userChoice.choices);

    const query = await getQueryType(functionPicked.choices);

    init();
};

const promptResponse = () => {
    return inquirer.prompt([{
        name: "choices",
        type: "list",
        choices: ["Department", "Roles", "Employees", "Quit"],
    }])
};

const switchChoices = async (choices) => {
    let answer;
    switch (choices) {
        case "Department":
            answer = await departmentQuestions();
            break;
        case "Roles":
            answer = await roleQuestions();
            break;
        case "Employees":
            answer = await employeeQuestions();
            break;
        default:
            quitApp();
            break;
    }

    return answer;
};

const departmentQuestions = () => {
    return inquirer.prompt([
        {
            name: "choices",
            type: "list",
            choices: ["View Departments", "Add Department"]
        }
    ])
};

const roleQuestions = () => {
    return inquirer.prompt([
        {
            name: "choices",
            type: "list",
            choices: ["View Roles", "Add Role"]
        }
    ])
};

const employeeQuestions = () => {
    return inquirer.prompt([
        {
            name: "choices",
            type: "list",
            choices: ["View all Employees", "Add Employee", "Update Employee"]
        }
    ])
};

const getQueryType = async (choice) => {
    switch (choice) {
        case "View Departments":
            await getAllDepartments();
            break;
        case "Add Department":
            await addDepartment();
            break;
        case "View Roles":
            await getAllRoles();
            break;
        case "Add Role":
            await addRole();
            break;
        case "View all Employees":
            await getAllEmployees();
            break;
        case "Add Employee":
            await addEmployee();
            break;
        case "Update Employee":
            await updateEmployee();
            break;
        default:
            init();
            break;
    }
};

const quitApp = () => {
    process.exit();
};

// SQL queries

// SQL queries for deprtments
const getAllDepartments = () => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM departments;`

        connectionA.query(query, (err, res) => {
            if (err) reject(err);
            else {
                console.log("All Departments: \n\n");
                console.table(res);
                resolve(res);
            }
        });
    });
}

const addDepartment = async () => {
    return new Promise(async (resolve, reject) => {
        const department = await inquirer.prompt([
            {
                name: "dept",
                message: "Enter deptartment name"
            }
        ]);

        const query = `
        INSERT INTO departments (name)
        VALUES (?);
        `

        connectionA.query(query, [department.dept], (err, res) => {
            if (err) reject(err);
            else {
                console.log("\n Successfully created department");
                resolve(res);
            }
        });
    });
};

const addRole = async () => {
    const depts = [];
    const departmentList = await getAllDepartments();
    for (const dept of departmentList) {
        depts.push(`${dept.id} ${dept.name}`)
    }

    const answer = await inquirer.prompt([
        {
            name: "department",
            type: "rawlist",
            message: "Select department",
            choices: depts
        },
        {
            name: "role",
            message: "Enter name of role"
        },
        {
            name: "salary",
            type: "number",
            message: "Enter salary or leave blank"
        }
    ]);

    return new Promise((resolve, reject) => {
        const query = `
         INSERT INTO role (title, salary, department_id)
         VALUES (?, ?, ?);
         `;

        connectionA.query(query, [answer.role, answer.salary ? answer.salary : null, parseInt(answer.department.split(" ")[0])], (err, res) => {
            if (err) reject(err);
            else {
                console.log(`Succesfully Added ${answer.role} to department ${answer.department.split(" ")[1]}`)
                resolve(res);
            }
        });
    });
};

const getAllRoles = () => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT role.id, role.title, role.salary, departments.name AS Department
        FROM role
        LEFT JOIN departments
        ON role.department_id = departments.id;
        `;

        connectionA.query(query, (err, res) => {
            if (err) reject(err);
            else {
                console.log("Roles:\n");
                console.table(res);
                resolve(res);
            }
        });
    });
};

const getAllEmployees = () => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT emp.id,
        CONCAT(emp.first_name, " ", emp.last_name) Employee_name,
        role.title,
        role.salary,
        departments.name AS Department,
        CONCAT(manager.first_name, " ", manager.last_name) Manager_name
        FROM employee emp
        INNER JOIN role ON emp.role_id = role.id
        INNER JOIN departments ON role.department_id = departments.id
        LEFT JOIN employee manager ON manager.id = emp.manager_id;
        `;

        connectionA.query(query, (err, res) => {
            if (err) reject(err);
            else {
                console.log("Employee List:\n");
                console.table(res);
                resolve(res);
            }
        });
    });
};

const addEmployee = async () => {
    const deptList = [];
    const roleList = [];

    // Get all dept choices
    const departments = await getAllDepartments();
    for (const dept of departments) {
        deptList.push(`${dept.id} ${dept.name}`);
    }

    const employeeName = await inquirer.prompt([
        {
            name: "firstName",
            message: "Employee first name"
        },
        {
            name: "lastName",
            message: "Employee last name"
        }
    ]);

    const deptChoice = await inquirer.prompt([
        {
            name: "department",
            type: "list",
            message: "Select department employee will belong to",
            choices: deptList
        }
    ]);

    const deptRoles = await getRoleByDept(deptChoice.department);
    for (const role of deptRoles) {
        roleList.push(`${role.id} ${role.title}`);
    }

    const roleChoice = await inquirer.prompt([
        {
            name: "role",
            type: "list",
            message: "Select role",
            choices: roleList
        }
    ]);

    const managerChoice = await inquirer.prompt([
        {
            name: "manager",
            type: "list",
            message: "Do they have a manager?",
            choices: ["Yes", "No"]
        }
    ]);

    const managerList = [];
    let selectedManager;
    if (managerChoice.manager === "Yes") {
        const managers = await getManagers(deptChoice.department);
        if (managers.length > 0) {
            for (const manager of managers) {
                managerList.push(`${manager.id} ${manager.employee}`);
            }

            selectedManager = await inquirer.prompt([
                {
                    name: "manager",
                    type: "list",
                    choices: managerList
                }
            ]);
        }
    }

    return new Promise((resolve, reject) => {
        const query = `
        INSERT INTO employee (first_name, last_name, role_id, manager_id)
        VALUES (?, ?, ?, ?);
        `;

        let manager = null;
        if (selectedManager) {
            manager = parseInt(selectedManager.manager.split(" ")[0])
        };

        connectionA.query(query, [employeeName.firstName, employeeName.lastName, parseInt(roleChoice.role.split(" ")[0]), manager], (err, res) => {
            if (err) reject(err);
            else {
                console.log(`Added employee`);
                resolve(res);
            }
        });
    });
};

// function to help us get roles by selected department
const getRoleByDept = (dept) => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT role.id, role.title, role.salary
        FROM role
        LEFT JOIN departments ON role.department_id = departments.id
        WHERE departments.name = ?;
        `;

        connectionA.query(query, dept.split(" ")[1], (err, res) => {
            if (err) reject(err);
            else resolve(res);
        });
    });
};

// Get managers for selected department
getManagers = (department) => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT employee.id,
        CONCAT(employee.first_name, " ", employee.last_name) employee
        FROM employee
        INNER JOIN role
        ON employee.role_id = role.id AND role.title = "Manager"
        INNER JOIN departments ON role.department_id = departments.id
        AND departments.name = ?;
        `;

        connectionA.query(query, department.split(" ")[1], (err, res) => {
            if (err) reject(err);
            else resolve(res);
        });
    });
};

module.exports = connect;