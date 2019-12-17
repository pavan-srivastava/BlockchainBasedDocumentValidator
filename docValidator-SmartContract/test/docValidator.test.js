const assert = require ('assert');
const ganache = require ('ganache-cli');
const Web3 = require ('web3');

let accounts;
let docValidatorABI;

//Local Ganache.
/*const provider = ganache.provider();
const web3 = new Web3(provider);*/

//Remote Ganache.
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8888"));


const {interface, bytecode} = require ('../compile');


beforeEach (async ()=> {
    // Get Accounts
    accounts = await web3.eth.getAccounts();
    console.log("------Account Balance-----[0]" + await web3.eth.getBalance(accounts[0]));
    console.log("------Account Balance-----[1]" + await web3.eth.getBalance(accounts[1]));

    docValidatorABI = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: '0x'+ bytecode, arguments: []})
    .send({from: accounts[0],gas: 2000000});
    
    //This needed only for local Ganache setup.
    //docValidatorABI.setProvider(provider);    

    
    console.log("-----Contract Address-----" + docValidatorABI.options.address);

    
});

    it('adds a record', async () => {
        await docValidatorABI.methods.addDoc('CMS-1001','Draft','Apporval', '0x4920686176652031303021').send({from: accounts[0], gas:1000000});
/*        await docValidatorABI.methods.addDoc('CMS-1002','Draft','Apporval', '0002').send({from: accounts[0], gas:1000000});
        await docValidatorABI.methods.addDoc('CMS-1003','Draft','Apporval', '0003').send({from: accounts[0], gas:1000000});
        await docValidatorABI.methods.addDoc('CMS-1004','Draft','Apporval', '0004').send({from: accounts[0], gas:1000000});*/
        console.log("Records added....");
        const hashCode = await docValidatorABI.methods.getDoc('CMS-1001','Draft','Apporval').call();
        console.log("-----output is-----------------------------------------------");
        console.log("-----output is =========" + web3.utils.hexToAscii(hashCode));
        //assert.equal(hashCode, '0x0004');
    });
   

