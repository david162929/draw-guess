/* ---------------Module--------------- */
const express = require("express");
const mysql = require('mysql2');
const Client = require('ssh2').Client;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fs = require('fs');

const app = express();

//Socket.io
var http = require('http').Server(app);
var io = require('socket.io')(http);
//server side socket.io
let onlineCount = 0;
io.on("connection", (socket) => {
	onlineCount ++;
	io.emit("online", onlineCount);
	console.log("a user connected.");

	socket.on("disconnect", () => {
		console.log('user disconnected.');
		if (onlineCount > 0) {
			onlineCount -= 1;
		}
		io.emit("online", onlineCount);
	});

	socket.on("hello", (msg) => {
		socket.emit("hi", msg);
	});

	socket.on("send", (msg) => {
		//console.log(msg);
		io.emit("msg",msg);
	});

	socket.on("resImgData", (imgData) => {
		console.log("2");
		io.emit("resImgData", imgData);
	});

	setTimeout(()=>{
		console.log("go");
		socket.emit("reqImgData");
	}, 5000);
});

/* io.on('connection', (socket) => {
	console.log('a user connected');
	socket.on('chat message', function(msg){
		console.log('message: ' + msg);
		io.emit('chat message', msg);
	});
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
}); */
  

//create TCP connection to MySQL over SSH by using mysql2 and ssh2 module
let sql;	//can't use const

const ssh = new Client();
ssh.on('ready', function() {
	ssh.forwardOut(
		'127.0.0.1',
		12345,
		'127.0.0.1',
		3306,
		function (err, stream) {
			if (err) throw err;
			// Create the connection pool. The pool-specific settings are the defaults
/* 			pool = mysql.createPool({
			  user: 'root',
			  database: 'stylish',
			  password: 'daviddata1357',
			  stream: stream,
			  waitForConnections: true,
			  connectionLimit: 100,
			  queueLimit: 0
			});	 */	
			
			sql = mysql.createConnection({
				user: 'root',
				database: 'stylish',
				password: 'daviddata1357',
				stream: stream // <--- this is the important part
			});
			
			// use sql connection as usual
			sql.query("SELECT id FROM product", function (err, result, fields) {
				if (err) throw err;
				console.log("Connect to MySQL succeed!");
			});
	
		});
	}).connect({
	// ssh connection config ...
	host: '52.15.89.192',
	port: 22,
	username: 'ec2-user',
	privateKey: require('fs').readFileSync("./../.ssh/2019-4-3-keyPair.pem")
}); 

//use bodyParser and cookieParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());								//receive POST request JOSN req.body
app.use(cookieParser());

//set pug
app.set("view engine", "pug");

//static files
app.use("/static", express.static("public"));




app.get("/", (req, res) => {
	let html = fs.readFileSync("./public/html/index.html", "utf8");
	
	res.send(html);
});

app.get("/2", (req, res) => {
	res.sendFile(__dirname + "/public/html/index.html");
});

app.get("/draw-board", (req, res) => {
	res.sendFile(__dirname + "/public/html/draw-board.html");
});

app.get("/image-change", (req, res) => {
	res.sendFile(__dirname + "/public/html/image-change.html");
});

app.get("/draw-board-test", (req, res) => {
	res.sendFile(__dirname + "/public/html/draw-board-test.html");
});

app.get("/test-board", (req, res) => {
	res.sendFile(__dirname + "/public/html/test-board.html");
});


/* ---------------Port--------------- */
http.listen(4000, () => {
	console.log("this app is running on port 4000.");
});