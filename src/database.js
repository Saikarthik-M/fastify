const mysql = require('mysql');

const con = mysql.createConnection({
    host: "remotemysql.com",
    user: "hB7xGX00t3",
    password: "tjEFmUD2bZ",
    database: "hB7xGX00t3"
})
con.connect((err) => {
    if (err) throw err;

});

module.exports = con;