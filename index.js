const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const getConfig = require('./config').getConfig();
const { startServer } = require('./functions');
const saltRounds = 10;

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(bodyParser.urlencoded({ extended: false }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'todo',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to the database as ID ' + db.threadId);
});

app.use(session({
    secret: 'your_secret_key',
    resave: true,
    saveUninitialized: true,
}));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

app.get('/', (req, res) => {
    if (req.session.username) {
        const sql = 'SELECT id, status, content, creatorNickname FROM todos';
        db.query(sql, (err, results) => {
            if (err) {
                return next(err);
            }
            res.render('todo.ejs', { todos: results });
        });
    } else {
        res.redirect('/login');
    }
});

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.post('/register', (req, res, next) => {
    const { new_username, new_password } = req.body;

    if (!new_password) {
        return res.status(400).send('Password is required.');
    }

    bcrypt.hash(new_password, saltRounds, (err, hash) => {
        if (err) {
            return next(err);
        }

        const user = {
            username: new_username,
            password: hash,
        };

        db.query('INSERT INTO users SET ?', user, (err, results) => {
            if (err) {
                return next(err);
            }
            console.log('User registered with ID ' + results.insertId);
            req.session.username = new_username;
            res.redirect('/');
        });
    });
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', (req, res, next) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            return next(err);
        }
        if (results.length === 0) {
            res.send('User not found.');
        } else {
            const hashedPassword = results[0].password;
            bcrypt.compare(password, hashedPassword, (err, result) => {
                if (err) {
                    return next(err);
                }
                if (result) {
                    req.session.username = username;
                    res.redirect('/');
                } else {
                    res.send('Incorrect password.');
                }
            });
        }
    });
});

app.post('/create-todo', (req, res, next) => {
    const todoContent = req.body['todo-content'];
    const username = req.session.username;

    const sql = 'INSERT INTO todos (status, content, creatorNickname) VALUES (?, ?, ?)';
    db.query(sql, ['todo', todoContent, username], (err, result) => {
        if (err) {
            return next(err);
        }
        console.log('Todo created successfully');
        res.redirect('/');
    });
});

app.post('/delete-todo', (req, res, next) => {
    const todoId = req.body.todoId;
    const sql = 'DELETE FROM todos WHERE id = ?';
    db.query(sql, [todoId], (err, result) => {
        if (err) {
            return next(err);
        }
        console.log('Todo deleted successfully');
        res.redirect('/');
    });
});

app.post('/update-todo', (req, res, next) => {
    const todoId = req.body.todoId;
    const newStatus = req.body.status;
    const sql = "UPDATE todos SET status = ? WHERE id = ?";
    db.query(sql, [newStatus, todoId], (err, result) => {
        if (err) {
            return next(err);
        }
        console.log('Todo updated successfully');
        res.redirect('/');
    });
});

app.listen(getConfig.port, () => {
    console.log(`Server is running on port ${getConfig.port}`);
});
startServer();