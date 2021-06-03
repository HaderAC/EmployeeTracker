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

}

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
            choices: ["View all employees", "Add Employee", "Update Employee"]
        }
    ])
};

module.exports = connect;