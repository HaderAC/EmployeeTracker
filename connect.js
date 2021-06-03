const mysql = require("mysql");
require("dotenv").config();

const connect = require("./main");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Password2020!",
    database: "employeetracker_db",
});

connection.connect((e) =>{
    if (e) throw e;
    console.log(`connected as id ${connection.threadId}`);
    connect(connection);

})