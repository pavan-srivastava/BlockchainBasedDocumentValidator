import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import FormUI from './components/FormUI';
import ValidationUI from './components/ValidationUI';
import Header from './components/Layouts/Header';

class App extends Component {
    
    constructor(props)
    {
        super(props);
        this.state = {
            docId:null,
            docTitle:null,
            fromWFStatus:null,
            toWFStatus:null,
            uploadedFiles:[]
        };
    }
    
    upateState(childState)
    {
        console.log("Inside updateParentState: Old Sate:" + this.state.docId);
        this.setState(childState);
        console.log("***********Inside updateParentState: update Sate:***********" + this.state.docId);
    }

    getState()
    {
        return this.state;
    }

    render () {
        return(
            <div>
                <Header/>
                <FormUI 
                    updateParentState = {this.upateState.bind(this)}
                    getParentState = {this.getState.bind(this)}
                />
                <ValidationUI 
                    parentDocId = {this.state.docId}
                />
            </div>
        );
    }
}


ReactDOM.render(<App/>, document.querySelector('.container'));



