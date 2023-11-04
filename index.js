const express = require('express')
const app = express()
const path = require('path');
const getConfig = require('./config').getConfig();
const { startServer } = require('./functions');
var bodyParser = require('body-parser');
const mysql = require('mysql');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'todo',
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(bodyParser.urlencoded({ extended: false }));

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

app.get('/', function(req, res) {
    const sql = 'SELECT * FROM todos';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching todos:', err);
        } else {
            res.render('todo.ejs', { todos: results });

            results.forEach(todo => {
                console.log('Todo Status:', todo.status);
            });
        };
    });
});

app.post('/create-todo', (req, res) => {
    const todoContent = req.body['todo-content'];

    const sql = 'INSERT INTO todos (status,content) VALUES (?,?)';
    db.query(sql, ['todo', todoContent], (err, result) => {
        if (err) {
            console.error('Error inserting todo:', err);
        } else {
            console.log('Todo created successfully');
            res.redirect('/');
        }
    });
});
app.post('/delete-todo', (req, res) => {
    const todoId = req.body.todoId;

    const sql = 'DELETE FROM todos WHERE id = ?';
    db.query(sql, [todoId], (err, result) => {
        if (err) {
            console.error('Error deleting todo:', err);
        } else {
            console.log('Todo deleted successfully');
        }
        res.redirect('/');
    });
});

app.post('/update-todo', (req, res) => {
    const todoId = req.body.todoId;
    const newStatus = req.body.status;

    const sql = "UPDATE todos SET status = ? WHERE id = ?";
    db.query(sql, [newStatus, todoId], (err, result) => {
        if (err) {
            console.error('Error updating todo:', err);
        } else {
            console.log('Todo updated successfully');
            res.redirect('/');
        }
    });
});
app.listen(getConfig.port, () => {
    console.log(`Server is running on port ${getConfig.port}`);
});
startServer();
