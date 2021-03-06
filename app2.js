/* ---------------Module--------------- */
const express = require("express");
const mysql = require("mysql2");
const Client = require("ssh2").Client;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();

// create TCP connection to MySQL over SSH by using mysql2 and ssh2 module
let pool;// can't use const

const credMysql = require("./../.credentials/mysql.js");
const credEc2 = require("./../.credentials/ec2.js");
const ssh = new Client();
ssh.on("ready", function() {
    ssh.forwardOut(
        "127.0.0.1",
        12345,
        "127.0.0.1",
        3306,
        function(err, stream) {
            if (err) throw err;
            // Create the connection pool. The pool-specific settings are the defaults
            pool = mysql.createPool({
                user: credMysql.user,
                database: credMysql.database,
                password: credMysql.password,
                stream: stream,
                waitForConnections: true,
                connectionLimit: 20,
                queueLimit: 0
            });

            /* sql = mysql.createConnection({
                user: credMysql.user,
                database: credMysql.database,
                password: credMysql.password,
                stream: stream // <--- this is the important part
            }); */

            // use sql connection as usual
            pool.query("SELECT id FROM product", function(err, result, fields) {
                if (err) throw err;
                console.log("Connect to MySQL succeed!");
            });
        });
}).connect({
    // ssh connection config ...
    host: credEc2.host,
    port: 22,
    username: credEc2.username,
    privateKey: credEc2.privateKey
});

// use bodyParser and cookieParser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());// receive POST request JOSN req.body
app.use(cookieParser());

// set pug
app.set("view engine", "pug");

// static files
app.use("/static", express.static("public"));


/* --------------- Socket.io --------------- */
// eslint-disable-next-line new-cap
const http = require("http").Server(app);
const io = require("socket.io")(http);

const mainSocket = require("./socket_io/io.js");
mainSocket(io);


/* class Client{
    constructor(socket){
        this.socket=socket;
        this.data=null;
        socket.on("reqDataURL", () => {
            this.data=3;
            socket.broadcast.emit("reqDataURL");
        });
    }
} */


// for draw-board
const drawSocket = require("./socket_io/draw.js");
drawSocket(io, pool);


// require routes
const mainRoutes = require("./routes/main.js");
const apiRoutes = require("./routes/api.js");

app.use(mainRoutes);
app.use("/api/1.0", apiRoutes);


/* ---------------Error--------------- */
// 404 error
app.use((req, res) => {
    res.status(404).send("Page not found.");
});

// error handler
app.use((err, req, res, next) => {
    console.log(err);
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});


/* ---------------Port--------------- */
http.listen(4000, () => {
    console.log("this app is running on port 4000.");
});
