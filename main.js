const inquirer = require('inquirer');
const { async } = require('rxjs');

let connectionA;

const connect = (connection) => {
    connectionA = connection
    init();
}

const init = async() => {
    const userChoice = await promptResponse();

    const functionPicked = await switchChoices(userChoice.choices);

    const query = await getQueryType(functionPicked.choices);

    init();
};

const promptResponse = ()=>{
    return inquirer.prompt([{
        name:"choices",
        type:"list",
        choices:["Department", "Roles", "Employees", "Quit"],
    }])
};

const switchChoices = async (choices) => {
    let answer;
    switch(choices) {
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
    switch(choice) {
        case "View Departments":
            await getAllDepartments();
            break;
        case "Add Department":
            await addDepartment();
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
}

module.exports = connect;