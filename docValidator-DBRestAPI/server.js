// server.js
const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;

const bodyParser     = require('body-parser');
const cors     = require('cors');

const app            = express();
app.use (express.json());
app.use (cors());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var url = "mongodb://localhost:27017/block_db";
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 8000;

app.get('/', (req, res) => {
    console.log("GET: Please use /api/dbblock to access dbblock APIs.");
    res.send("GET: Please use /api/dbblock to access dbblock APIs.");
});

app.get('/api/dbblock/:docId', (req, res) => {
    console.log("\n\n Inside GET: /api/dbblock/:docId" + req.params.docId);

	MongoClient.connect(url, (err, client) => {
		if (err) { throw err;}
		db = client.db("block_db");
		var query = {};
		query['docId'] =  req.params.docId;
		
		console.log("Query is " +  JSON.stringify(query));
		var allWFTransitions = db.collection("block_col").find(query).toArray().then((data) => {
			console.log("Mongo Query Response:::" + JSON.stringify(data));
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(data));
			//res.close();
	});

		client.close();
		});


});


app.post('/api/dbblock', (req, res) => {
	console.log("\n\n Inside POST /api/dbblock");
	console.log("req.body------>" + JSON.stringify(req.body)); 
	var docId = req.body.docId;
	console.log("docId is:" + JSON.stringify(docId));
	var queryResults; 
	MongoClient.connect(url, (err, client) => {
		if (err) { throw err;}
		db = client.db("block_db");
		db.collection("block_col").insertOne(req.body, (err, db_res) => {
			console.log ('Record inserted');

			var query = {};
			query['docId'] =  docId;
			
			console.log("Query is " +  JSON.stringify(query));
			var allWFTransitions = db.collection("block_col").find(query).toArray().then((data) => {
				console.log("Mongo Query Response:::" + data);
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify(data));
			});

			client.close();
		});
	});
});


	


app.listen(port, () => {
  console.log('We are live on... ' + port);
});