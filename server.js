var express = require('express');
var app = express();
var sqlite = require('sqlite3').verbose();
const crypto = require('crypto');

const salt = "idkwhatthef*ckismysaltButIshouldmakethisasrandomaspossiblelolwubbalubbadubdubrandomsaltrandomsaltthatnoonewouldknowmuwahahahahaha";

//security enncryptions
function encrypt(text)
{
	let enc = crypto.createCipher("aes-256-ctr",salt);
	let crypted = enc.update(text,'utf-8','hex') ;
	crypted += enc.final('hex');
	return crypted;
}

function decrypt(text)
{
	let dec = crypto.createDecipher("aes-256-ctr",salt);
	let d = dec.update(text,'hex','utf-8');
	d += dec.final('utf-8');
	return d;
}


//middlewares
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var db = new sqlite.Database('planzen',sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE,(err)=>{
	if(err)
		throw err;
});

app.listen(3000);
console.log("App listening in the port 8080");

//navigator
app.get('/', function(req,res){
	res.sendfile('./index.html');
});
app.get('*', function(req,res){
	res.sendfile("./"+req.url.split("?")[0]);
});
app.post('/api/auth',function(req,res){
	console.log(req.body);
	let pword = crypto.createHmac('sha256',salt).update(req.body.password+"").digest('hex')+"";
	let uname = req.body.username;
	db.get(`SELECT * FROM user WHERE username=? AND password=?`,[uname,pword],(err, row)=>{
		if(err)
		{
			console.log("ERROR: "+err);
		}
		else
		if(row)
		{
			let sess_identifier = encrypt(row.id+"");
			res.cookie('sess_identifier', sess_identifier , {maxAge: 10800}).send(JSON.stringify({success:"Authentication Successful"}));
		}
		else
			res.send(JSON.stringify({error:"Authentication Error"}));
	});
});