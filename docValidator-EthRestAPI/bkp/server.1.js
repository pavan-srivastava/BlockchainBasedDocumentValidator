// server.js
const assert = require ('assert');
// const ganache = require ('ganache-cli');
const Web3 = require ('web3');


let accounts;
let docValidatorABI;


// -----Start of REST Related entries
const express        = require('express');
const bodyParser     = require('body-parser');
const cors     = require('cors');

const app            = express();
app.use (express.json());
app.use (cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 9000;

app.get('/', (req, res) => {
    console.log("GET: Please use /api/ethblock to access ethblock APIs.");
    res.send("GET: Please use /api/ethblock to access ethblock APIs.");
});

app.get('/api/ethblock', (req, res) => {
    console.log("Inside GET: /api/ethblock");
});

app.post('/api/ethblock', (req, res) => {
	console.log("inside POST /api/ethblock");
	console.log("req.body------111" + JSON.stringify(req.body)); 

addToEth(req.body,res);
	// END--------------------------------------------------------------------------
	res.send(200);
});

async function addToEth (bodyData, res) {
  let response;
  try {
  const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8888"));
  const {interface, bytecode} = require ('./compile');

  accounts = await web3.eth.getAccounts();
  web3.eth.personal.unlockAccount(accounts[0], "oracle", 10000);

    docValidatorABI = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: '0x'+ bytecode, arguments: []})
    .send({from: accounts[0],gas: 2000000});

    /*response = await docValidatorABI.methods.addDoc(bodyData.docId,
    	bodyData.fromWFStatus,
    	bodyData.toWFStatus,
    	"0x"+bodyData.fileHash).send({from: ACCOUNT, gas:1000000});
  		console.log("***************Record added to blockchain***************");*/


    response = await docValidatorABI.methods.addDoc(bodyData.docId,
    	bodyData.fromWFStatus,
    	bodyData.toWFStatus,
    	"0x"+bodyData.fileHash).send({from: ACCOUNT, gas:1000000});
  		console.log("***************Record added to blockchain***************"+ response);


      
      response2 = await docValidatorABI.methods.getDoc(bodyData.docId,
        bodyData.fromWFStatus,
        bodyData.toWFStatus).call();
        console.log("***************Record Read from  blockchain***************" + response2);
);

  } catch (err) {
    console.log('Error', err)
    return res.status(500).send()
  }
}

app.listen(port, () => {
  console.log('We are live on... ' + port);
});
