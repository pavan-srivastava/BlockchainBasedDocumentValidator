pragma solidity ^0.4.0;
contract DocValidator {


    mapping(string => string) docDictionary;
    string fileHash = "No Doc Found";

    function addDoc(string _compositKey, string _docHash) public {
        docDictionary[_compositKey] = _docHash;
    }

    function getDoc(string _compositKey) public returns (string) {
        fileHash = docDictionary[_compositKey];
        return fileHash;
    }
}
