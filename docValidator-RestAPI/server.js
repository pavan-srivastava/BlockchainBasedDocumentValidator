const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sha256 = require ('sha256');
const web3 = require('web3');
var Request = require("request");
const async = require ("async");


//const FileReader = require ('filereader');
    var fs = require('fs');

var app = express();
var upload = require('express-fileupload');

// handle CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const http = require('http');
http.Server(app).listen(5555); // make server listen on port 5555

app.use(upload()); // configure middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


console.log("Server Started at port 5555..");

/*======================MAIN==============================================*/
app.post('/blockEntires', (req,res) => {
  console.log("============================================");
  _requestContext = null;
  saveFileToFileSys(req,res)
      .then((reqContext) => {
        console.log("\n\nStep 1 Complete: File location: "+ JSON.stringify(reqContext));
          calculateHash(reqContext)
              .then((reqContext)=> {
                console.log("\n\nStep 2 Complete: Calculate Hash: "+ reqContext.fileHash);
                _requestContext = reqContext;  
                saveToEth(reqContext).then((msg) => {
                    console.log("\n\nStep 3  Added to Eth" + msg);
                    saveToMongo(_requestContext).then((dbResponse) => {
                      console.log("\n\nStep 4  Added to Mongo: " + dbResponse);
                      res.setHeader('Content-Type', 'application/json');
                      res.send(dbResponse);
                    })
                })
              })
      })
})


app.get('/validateEntires', (req,res) => {
  const docId = req.query.docId;
  console.log ("\n\n=========Inside validateEntires\n\n");
  console.log ("DocID is" + docId);
  
  async.waterfall([
  // Waterfall Function -1 
  function getDataFromDB(callback){
        console.log ("\nStep:1 Inside getDataFromDB\n");
        Request('http://localhost:8000/api/dbblock/'+docId, function(err, res, body) {  
        if (err) { 
          callback (err, null);
          return;
        }
        console.log("\n\nBODY OF DB RESPONSE"+body);
        callback(null, JSON.parse(body));
      });
    },
  // Waterfall Function -2
  function enrichHashFromEth(dbResponse,callback){
        console.log ("\nStep:2 Inside getHashFromEth, arrary length is \n" + dbResponse.length);
        let dbResponseEnrich = [];
        async.each(dbResponse, function (dbRes, callback2){
          Request.get({url:"http://localhost:9000/api/ethblock", qs:dbRes}, function(err,res,body){
            if (err)
            {
              callback2(err);
              return;
            }
            console.log("\nINSIDE ENRICH FROM ETH - Eth Hash" + body);
          
            let fileContent = fs.readFileSync(dbRes.fileLocation, 'utf8');
            let localSha = sha256(fileContent);    
            console.log("\nINSIDE ENRICH FROM ETH - Local Hash" + localSha);
            if (localSha === body)  
            {
              console.log("\nITS A METCH");
              dbRes.validationResult = "Matched.";
            }
            else
            {
              console.log("\nITS A MIS-METCH");
              dbRes.validationResult = "Un-Matched.";
            }
            dbResponseEnrich.push(dbRes);
            callback2();
          })
        },
        function (error){
              if (error){
                  console.log("\n\nend of the chain ERROR" + JSON.stringify(dbResponseEnrich));  
              }
              else {
                  console.log("\n\nend of the chain PROCESSED" + JSON.stringify(dbResponseEnrich));
                  callback(null, dbResponseEnrich);
              }
        }
      );
    }
    ], function (err, result) {
      if (err){ 
        console.log ("err has occured" + JSON.stringify(err));
      }
      console.log ("Just before sending response back\n\n" + JSON.stringify(result));

      res.setHeader('Content-Type', 'application/json');
      res.send (result);
      
    })
})






function  getDataFromDB(docId) {
  return new Promise ((resolve, reject)=> {
  
    if (docId === null) { 
      console.log ("\n\nInside getDataFromDB, docId is null, Returning...");
      reject("Inside getDataFromDB, docId is null, Returning...");
    }  
    console.log("\n\n+++++++Inside getDataFromDB(), and DocId is NOT NULL:" + docId);
  
    Request('http://localhost:8000/api/dbblock/'+docId, function(err, res, body) {  
        console.log(body);
        resolve(body);
    });

  });

}


function saveFileToFileSys(req,res)
{
  return new Promise ((resolve, reject)=> {

    console.log("Entering saveFileToFileSys...");
    var docId = req.body.docId;
    var docTitle = req.body.docTitle;
    var fromWFStatus = req.body.fromWFStatus;
    var toWFStatus = req.body.toWFStatus;
    var uploadpath;
    console.log("docId ->" + docId);
    console.log("docTitle ->" + docTitle);
    console.log("fromWFStatus ->" + fromWFStatus);
    console.log("toWFStatus ->" + toWFStatus);
    
    let reqContext = {
      "docId" : docId,
      "docTitle" : docTitle,
      "fromWFStatus" : fromWFStatus,
      "toWFStatus" : toWFStatus,
      "fileLocation" : null,
      "fileHash"  : null
    };
  
    if(req.files){
      var uploadedFile = req.files.uploadedFile;
      var uploadedFileName = uploadedFile.name;
      console.log ("Uploaded File Name:"+uploadedFileName);
  
      uploadpath = __dirname + '/uploads/' + reqContext.docId+"-"+reqContext.fromWFStatus+"-"+reqContext.toWFStatus+"-"+uploadedFileName;
      uploadedFile.mv(uploadpath,function(err){
        if(err){
          console.log("File Upload Failed",uploadedFileName,err);
          reject ("An error has occured while saving the file...");
          //res.send("Error Occured!")
        }
        else {
          console.log("File Name ...",uploadedFileName);
          reqContext.fileLocation = uploadpath;
          console.log("File stored to ...",reqContext.fileLocation);
          console.log("Leaving saveFileToFileSys...");
          resolve (reqContext);
        }
      });
    }
  });
};


function calculateHash(reqContext)
{
  return new Promise ((resolve, reject) => {
    console.log("Entering calculateHash...");
    var fileHash = null;
    fs.readFile(reqContext.fileLocation, 'utf8', function(err, data) {
      if (err) {
        reject ("Error while calculating hash....");
      }
      reqContext.fileHash = sha256(data);
      console.log("File hash is " + reqContext.fileHash);
      resolve(reqContext);
    });
  });

}

function saveToEth(reqContext)
{
  return new Promise ((resolve, reject) =>
  {
    Request.post({
      "headers": { "content-type": "application/json" },
      "url": "http://localhost:9000/api/ethblock",
      "body": JSON.stringify(reqContext)
    }, (error, response, body) => {
    if(error) {
      console.log("Error while saving in Ethereum..." + error);
      reject("Error while saving in Ethereum..." + error);
    }
    else
    {
        console.log("-------SUCCESS: Response from Eth:" + body);
        resolve("-------SUCCESS: Response from Eth:" + body);
    }

  });

  })  

}

function saveToMongo(reqContext)
{
  return new Promise((resolve, reject)=>{
    var allDocforDocId = [];
    let _reqContext = reqContext;
    delete _reqContext.fileHash;
    //------- Call REST API to save data in MongoDB.
    Request.post({
      "headers": { "content-type": "application/json" },
      "url": "http://localhost:8000/api/dbblock",
      "body": JSON.stringify(_reqContext)
    }, (error, response, body) => {
      if(error) {
          console.log(error);
          reject("error occured while saving in MongoDB");
        }
      else {
        //console.log("Response form DB Service -->" + JSON.stringify(response.body));
        resolve(response.body);
      }
  });

  })
  
}


function getFileHashFromLocal(requestJson) {
    return new Promise((resolve, reject)=> {
    let err = false;  
    let fileContent = fs.readFileSync(dbResponse.fileLocation, 'utf8');
    let localSha = sha256(fileContent);    
    console.log("\n\nLocal Hash calculating..." + localSha)
    resolve(localSha);
    });
}




  
  

