const mysql = require("mysql");

let connection = mysql.createConnection({
  host: "localhost",
  database: "drplaza-attendance",
  user: "root",
  password: "",
});

connection.connect(function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Database Connected");
  }
});

module.exports = connection;
