const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mysql = require("mysql");

// parse application/json
// app.use(bodyParser.json());
app.use(bodyParser.json(), (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorizacion,X-API-KEY,Origin,X-Requested-With,Content-Type,Accept,Access-Control-Allow-Request-Method"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,OPTIONS,PUT,PATCH,DELETE"
  );
  res.header("Allow", "GET,POST,OPTIONS,PUT,PATCH,DELETE");
  next();
});

//create database connection
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "libreria"
});

//connect to database
conn.connect(err => {
  if (err) throw err;
  console.log("Mysql Connected...");
});

///////////////////////////// API LIBROS /////////////////////////////////////////

//show all books
app.get("/api/libros", (req, res) => {
  let sql = "SELECT * FROM book";
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    // res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
    res.send({ response: results });
  });
});
//get all book and authors
app.get("/api/libros/all", (req, res) => {
  let sql = "SELECT * FROM book INNER JOIN author ON book.id_autor=author.id";
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    // res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
    res.send({ response: results });
  });
});

//show single book
app.get("/api/libros/:id", (req, res) => {
  const id = req.params.id;

  let sql = "SELECT * FROM book WHERE id =" + id;
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({ status: 200, error: null, response: results }));
    // res.send({ "response": result });
  });
});

//find single autor in table book
app.get("/api/libros/autor/:id", (req, res) => {
  const id = req.params.id;
  let sql = "SELECT * FROM book WHERE id_autor =" + id;
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({ status: 200, error: null, response: results }));
    // res.send({ "response": result });
  });
});


//add new book
app.post("/api/libros", (req, res) => {
  let data = {
    name: req.body.title,
    isbn: req.body.isbn,
    id_autor: req.body.id_autor
  };
  let sql = "INSERT INTO book SET ?";
  let query = conn.query(sql, data, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({ status: 200, error: null, response: results }));
  });
});

//update a book
app.patch("/api/libros/:id", (req, res) => {
  let sql =
    "UPDATE book SET name='" +
    req.body.name +
    "', isbn='" +
    req.body.isbn +
    "', id_autor='" +
    req.body.id_autor +
    "' WHERE id=" +
    req.params.id;
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({ status: 200, error: null, response: results }));
  });
});

//delete a book
app.delete("/api/libros/:id", (req, res) => {
  let sql = "DELETE FROM book WHERE id=" + req.params.id;
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({ status: 200, error: null, response: results }));
  });
});

//////////////////////////////////////////////////////////////////////////////////

///////////////////////////////// API AUTORES /////////////////////////////////////

//show all authors
app.get("/api/autor", (req, res) => {
  let sql = "SELECT * FROM author";
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({ status: 200, error: null, response: results }));
  });
});

//show single author
app.get("/api/autor/:id", (req, res) => {
  const id = req.params.id;
  let sql = "SELECT * FROM author WHERE id =" + id;
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({ status: 200, error: null, response: results }));
  });
});

//add new author
app.post("/api/autor", (req, res) => {
  let data = { first_name: req.body.first_name, last_name: req.body.last_name };

  let sql = "INSERT INTO author SET ?";
  let query = conn.query(sql, data, (err, results) => {
    if (err) throw err;
    // console.log("----" + results.insertId);
    res.send(JSON.stringify({ status: 200, error: null, response: results }));
  });
});

//update a author
app.patch("/api/autor/:id", (req, res) => {
  let sql =
    "UPDATE author SET first_name='" +
    req.body.first_name +
    "', last_name='" +
    req.body.last_name +
    "' WHERE id=" +
    req.params.id;
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({ status: 200, error: null, response: results }));
  });
});

//delete a author
app.delete("/api/autor/:id", (req, res) => {
  let sql = "DELETE FROM author WHERE id=" + req.params.id;
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({ status: 200, error: null, response: results }));
  });
});

////////////////////////////////////////////////////////////////////////////////////////

//Server listening
app.listen(3000, () => {
  console.log("Server started on port 3000...");
});

// connection.query('INSERT INTO posts SET ?', { title: 'test' }, function (err, result) { if (err) throw err; console.log(result.insertId); });
// result.insertId
