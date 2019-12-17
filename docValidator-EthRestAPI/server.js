// server.js
const assert = require ('assert');
// const ganache = require ('ganache-cli');
const Web3 = require ('web3');

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

//---------Application Variables-----------------
  let accounts;
  let docValidatorABI = null;
  let web3 = null;
  const ACCOUNT = '0x9BAa461020500FF7eb04AC0c2f40ec49412d505F';
//-----------------------------------------------


app.get('/api/ethblock', (req, res) => {
    console.log("Inside GET: /api/ethblock");
    getEthHash(req,res);
});

app.post('/api/ethblock', (req, res) => {
	console.log("inside POST /api/ethblock");
	//console.log("req.body------111" + JSON.stringify(req.body)); 
  addToEth(req.body,res);
	// END--------------------------------------------------------------------------
	// res.send(200);
});

async function addToEth (bodyData, res) {
  console.log("\n\n============================================");
  console.log("\nStart: Adding Record to Ethereum Blockchain.");
  console.log("\n============================================");
  let response;
  try {
    if (web3 === null)
    {
      console.log("\n\nStep1: Web3 Poriver is not Initilized.Initilizing web3.....");
      web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8888"));
      console.log("Step1: Initilizing web3.....DONE. Web3" + web3);
    }
    else {
        console.log("\n\nStep1: Web3 provider is already Initilized.....Web3" + web3);
    }
    
    if (docValidatorABI === null)
    {
      console.log("\n\nStep2: docValidatorABI is not Initilized.Initilizing docValidatorABI.....");
      const {interface, bytecode} = require ('./compile');
      await web3.eth.personal.unlockAccount(ACCOUNT, "oracle", 10000);    
      docValidatorABI = await new web3.eth.Contract(JSON.parse(interface))
      .deploy({data: '0x'+ bytecode, arguments: []})
      .send({from: ACCOUNT,gas: 2000000});
      console.log("Step2: Initilizing docValidatorABI.....DONE. docValidatorABI" + docValidatorABI);
    }
    else {
      console.log("\n\nStep2: docValidatorABI provider is already Initilized.....docValidatorABI" + docValidatorABI);  
    }
    
    
    console.log("\n\nStep3: Unlocking Account.");
    await  web3.eth.personal.unlockAccount(ACCOUNT, "oracle", 10000);
    console.log("Step3: Unlocking Account.-DONE");
    
    console.log("\n\nStep4: Adding record to Eth.");
    console.log("-------------------");
    console.log("docId " + bodyData.docId);
    console.log("romWFStatus " + bodyData.fromWFStatus);
    console.log("oWFStatus " + bodyData.toWFStatus);
    console.log("fileHash " + bodyData.fileHash);
    console.log("-------------------");

    let compositKey = bodyData.docId + getWFStatusCode(bodyData.fromWFStatus)  + getWFStatusCode(bodyData.toWFStatus);
    console.log("\ncompositKey" + compositKey );

    response = await docValidatorABI.methods.addDoc (compositKey, bodyData.fileHash)
                                                    .send({from: ACCOUNT, gas:1000000});
  	console.log("\n\nStep4: Adding record to Eth - DONE. Response from Eth:" + response);
    
    console.log("\n\nStep5: Try reading the same record from Eth");
    response2 = await docValidatorABI.methods.getDoc(compositKey).call();
    console.log("Step5: Try reading the same record from Eth -DONE: Response is ****" + response2);  
    res.setHeader('Content-Type', 'text/plain');
    res.send(response2);
  } catch (err) {
    console.log('Error', err)
    return res.status(500).send();
  }
}


async function getEthHash (req, res) {
  let response;
  try {
    if (web3 === null)
    {
      console.log("\nInitilizing web3.....");
      web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8888"));
    }
    console.log("\nweb3....." + web3);
    if (docValidatorABI === null)
    {
      console.log("\nInitilizing docValidatorABI.....");
      const {interface, bytecode} = require ('./compile');
      await web3.eth.personal.unlockAccount(ACCOUNT, "oracle", 50000);
      docValidatorABI = await new web3.eth.Contract(JSON.parse(interface))
      .deploy({data: '0x'+ bytecode, arguments: []})
      .send({from: ACCOUNT,gas: 2000000});
    }
    console.log("\n docValidatorABI:" + docValidatorABI);
    

    await  web3.eth.personal.unlockAccount(ACCOUNT, "oracle", 10000);
    
    console.log("\n-------------------");
    console.log("req.query " + req.query);
    console.log("docId " + req.query.docId);
    console.log("romWFStatus " + req.query.fromWFStatus);
    console.log("oWFStatus " + req.query.toWFStatus);
    console.log("\n-------------------");

    let compositKey = req.query.docId + getWFStatusCode(req.query.fromWFStatus)  + getWFStatusCode(req.query.toWFStatus);
    console.log("compositKey" + compositKey );

    response2 = await docValidatorABI.methods.getDoc(compositKey).call();
      console.log("***************Record Read from  blockchain***************" + response2);  
      
      res.setHeader('Content-Type', 'text/plain');
      res.send(response2);
   } catch (err) {
    console.log('Error', err)
    return res.status(500).send();
  }
}

function getWFStatusCode(longStatus)
{
  if (longStatus == "Draft")  {
    return "D";
  } else if (longStatus == "Approval")
  {
    return "A";
  }
  else if (longStatus == "Final_Review")
  {
    return "F";
  }
  else if (longStatus == "Publishing")
  {
    return "P";
  }
  else if (longStatus == "Moodys_COM")
  {
    return "M";
  }
  return "-";
}


app.listen(port, () => {
  console.log('We are live on... ' + port);
});
