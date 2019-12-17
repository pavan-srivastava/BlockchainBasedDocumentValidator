pragma solidity ^0.4.0;
contract DocValidator {

    struct DocState {
        string docId;
        string fromState;
        string toState;
        bytes docHash;
    }

    mapping(string => DocState[]) docDictionary;

    function addDoc(string _docId, string _fromState, string _toState, bytes _docHash) public {
        var docMap = DocState({docId:_docId, fromState:_fromState, toState:_toState, docHash:_docHash});
        docDictionary[_docId].push(docMap);
    }

    function getDoc(string _docId, string _fromState, string _toState) public returns (bytes) {
        
        DocState[] arr = docDictionary[_docId];
        for (uint itr =0; itr < arr.length ; itr++){
            DocState docstate = arr[itr];
            if (sha256(docstate.fromState) == sha256(_fromState) &&  
                sha256(docstate.toState) == sha256(_toState))
                {
                    return docstate.docHash;
                }
        }
        return "No doc found";
    }
}