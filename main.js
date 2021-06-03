const inquirer = require('inquirer');
const { async } = require('rxjs');

let connectionA;

const connect = (connection) => {
    connectionA = connection
    init();
}

const init = async() => {
    const userChoice = await promptResponse();
}

const promptResponse = ()=>{
    return inquirer.prompt([{
        name:"choices",
        type:"list",
        choices:["Department", "Roles", "Employees", "Quit"],
    }])

}

module.exports = connect;