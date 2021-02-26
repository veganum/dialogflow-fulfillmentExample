const mysql = require('mysql');

var mysql_pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dialogflowdb',
});

function ejecutaQuery(q) {
    return new Promise((resolve, reject) => {
        mysql_pool.getConnection((err, con) => {
            if (err) {
                con.release();
                console.log(' Error getting mysql_pool connection: ' + err);
                throw err;
            }
            con.query(q, function(err2, result, fields) {
                if (err2) {
                    console.log(' Error in the query: ' + err);
                    throw err2
                };
                resolve(result);
                con.release();
            });
        });
    });
}

module.exports = {
    ejecutaQuery: ejecutaQuery
}




/*
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "dialogflowdb"
});
*/
//CREAR BBDD
/*con.connect(function(err) {
    if (err) throw err;
    console.log("Database Connected!");
  
    con.query("CREATE DATABASE dialogflowDB", function(err, result) {
        if (err) throw err;
        console.log("Base de datos creada");
    });

    

});
*/
/*
//CREAR TABLA
//https://www.w3schools.com/nodejs/nodejs_mysql_create_table.asp
con.connect(function(err) {
    if (err) throw err;
    console.log("Table Connected!");
    //Create a table named "customers":
    var sql = "CREATE TABLE login (user VARCHAR(255), password VARCHAR(255))";
    con.query(sql, function(err, result) {
        if (err) throw err;
        console.log("Tabla creada");
    });
});

*/