//Imports
const express = require("express");
const session = require("express-session");
const flash = require('connect-flash')
const bodyParser = require("body-parser");
const mysql_config = require('./mysql_config')
const mysql = require("mysql2");
const ejs = require("ejs");
var path = require("path");
const { log } = require("console");
const { config } = require("process");
const app = express();

const conn = mysql.createConnection(mysql_config);

//Middlewares
    //Configurando a sessão
    app.use(session({ 
        secret: "9dsa98d98has89dhas",
        resave: true,
        saveUninitialized: true
    }))

    app.use(flash())

    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        next()
    })
    
    app.use(bodyParser.urlencoded( { extended: "true" } ));
    app.use(bodyParser.json())

    app.use("/public", express.static(path.join(__dirname, "public")));

    app.engine("html", ejs.renderFile);
    app.set("view engine", "html");
    app.set("views", './views');



conn.connect((err) => {
    if (err) {
        console.log("Erro de conexão com a base");
    } else {
        console.log("Conectado a base de dados");
    }
});

//Initial route
app.get("/", (req, res) => {
    if (req.session.login) {
        res.render("create");
    } else {
        res.render("login");
    }
});

//Login POST route
app.post("/", (req, res) => {
    const login = req.body.login;
    const senha = req.body.password;

    //console.log(login, senha);

    conn.query(`SELECT * FROM usuarios WHERE login = '${login}' AND senha = '${senha}'`, (err, rows) => {
        if (err) {
            console.log(err.message);
        } else {
            if (login != "" && senha != "") {
                if (rows.length > 0) {
                    req.session.login = login;
                    res.redirect("/create");
                } else {
                    res.redirect("/");
                }
            } else {
                console.log("Preencha os dados de login");
            }
        }
    });
});

//Register route
app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const nome = req.body.nome;
    const login = req.body.login;
    const senha = req.body.senha;
    const confirmaSenha = req.body.confirmaSenha;

    //console.log(nome, login, senha, confirmaSenha);

    if (nome != "" && login != "" && senha != "" && confirmaSenha != "") {
        if (senha === confirmaSenha) {
            conn.query(
                `INSERT INTO usuarios (login, senha, nome)
                        VALUES ('${login}', '${senha}', '${nome}')`,
                (err, rows) => {
                    if (err) {
                        console.log("Ocorreu um erro ao incluir usuario");
                        return;
                    } else {
                        if (rows.affectedRows > 0) {
                            console.log("Usuario cadastrado com sucesso");
                            res.redirect("/");
                        } else {
                            console.log("Não foi possivel cadastrar o usuario");
                        }
                    }
                }
            );
        } else {
            console.log("A confirmação de senha nao confere - Register");
        }
    } else {
        console.log("Preencha todos os campos - Register");
    }
});

app.get("/usuarios/read", (req, res) => {
    //Retorno das tarefas da base de dados
    conn.query(`SELECT * FROM usuarios`, (err, rows) => {
        if (err) {
            console.log("Ocorreu um erro");
        } else {
            res.status(200).json(rows);
        }
    });
});

app.get("/read", (req, res) => {
    if (req.session.login){
    res.render("read");
    }else{
        res.redirect("/");
    }
});

//   /Create
app.get("/create", (req, res) => {
    if (req.session.login) {
        res.render("create");
    } else {
        res.redirect("/");
    }
});
app.post("/create", (req, res) => {
    const { nome, login, senha, confirmaSenha } = req.body;

    if (nome != "" && login != "" && senha != "" && confirmaSenha != "") {
        if (senha === confirmaSenha) {
            conn.query(
                `INSERT INTO usuarios (login, senha, nome)
                        VALUES ('${login}', '${senha}', '${nome}')`,
                (err, rows) => {
                    if (err) {
                        console.log("Ocorreu um erro ao incluir usuario");
                        return;
                    } else {
                        if (rows.affectedRows > 0) {
                            console.log("Usuario cadastrado com sucesso");
                        } else {
                            console.log("Não foi possivel cadastrar o usuario");
                        }
                    }
                }
            );
        } else {
            console.log("A confirmação de senha nao confere - Register");
        }
    } else {
        console.log("Preencha todos os campos - Register");
    }
});

//Escutando o servidor
app.listen(3001, () => {
    console.log("Servidor rodando na porta 3001");
});
