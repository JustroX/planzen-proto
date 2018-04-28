var express = require('express');
var app = express();
var sqlite = require('sqlite3').verbose();
const crypto = require('crypto');

const main_salt = "idkwhatthef*ckismysaltButIshouldmakethisasrandomaspossiblelolwubbalubbadubdubrandomsaltrandomsaltthatnoonewouldknowmuwahahahahaha";

//security enncryptions
function encrypt(text,salt=main_salt)
{
	let enc = crypto.createCipher("aes-256-ctr",salt);
	let crypted = enc.update(text,'utf-8','hex') ;
	crypted += enc.final('hex');
	return crypted;
}

function decrypt(text,salt=main_salt)
{
	let dec = crypto.createDecipher("aes-256-ctr",salt);
	let d = dec.update(text,'hex','utf-8');
	d += dec.final('utf-8');
	return d;
}

function hash(text)
{
	return crypto.createHmac('sha256',main_salt).update(text+"").digest('hex')+"";
}

function unwrap(sess_identifier,sign)
{
	let str = encrypt(main_salt,sess_identifier);
	let sign2 = hash(str);
	return sign2==sign;
}

//middlewares
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());


var db = new sqlite.Database('planzen',sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE,(err)=>{
	if(err)
		throw err;
});

app.listen(3000);
console.log("App listening in the port 8080");

//navigator
app.post('/api/auth',function(req,res){
	console.log(req.body);
	let pword = hash(req.body.password+"");
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
			let sign = hash(encrypt(main_salt,sess_identifier));

			res.send(JSON.stringify({success:"Authentication Successful",id:sess_identifier,sign:sign}));
		}
		else
			res.send(JSON.stringify({error:"Authentication Error"}));
	});
});

app.post('/api/note/add',function(req,res){
	let b = req.body;
	if(unwrap(b.id,b.sign))
	{
		b.id = decrypt(b.id);
		let note = b.payload;
		db.run(`INSERT INTO note (owner,title,details,duration,schedule,due,reminder,contact,subtask) VALUES (?,?,?,?,?,?,?,?,?)`,
		[
			b.id,
			note.title,
			note.detail,
			JSON.stringify(note.duration),
			JSON.stringify(note.schedule),
			JSON.stringify(note.deadline),
			JSON.stringify(note.reminder),
			JSON.stringify(note.contact),
			JSON.stringify(note.subtask),
		]
		,function(err){
			if(err)
			{
				res.send(JSON.stringify({error:err}));
			}
			else
				res.send({success:"Note Added"});
		});
	}
	else
	res.send(JSON.stringify({error:"Token integrity failed."}));
});

app.get('/api/note/get/inlist/:page/:id/:sign',function(req,res){
	let param = req.params;
	// console.log(unwrap(param.id,param.sign));
	if(unwrap(param.id,param.sign))
	{
		let notes = [];
		db.all(`SELECT * FROM note WHERE owner = ? LIMIT 8 OFFSET ?`,[decrypt(param.id),param.page-1],(err,rows)=>
		{
			res.send({success:"Data retrieved.", payload: rows});
		});
	}
	else
		res.send({error: "Token integrity failed."});
});
app.get('/', function(req,res){
	res.sendfile('./index.html');
});
app.get('*', function(req,res){
	res.sendfile("./"+req.url.split("?")[0]);
});