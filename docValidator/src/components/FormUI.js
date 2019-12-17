import React, {Component} from 'react';
import {FormGroup, FormControl,  ControlLabel, Button, Jumbotron,DropdownButton,MenuItem} from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import axios from 'axios';

class FormUI extends Component {
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
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onDrop = this.onDrop.bind(this);
    }

    onDrop(acceptedFiles, rejectedFiles) {
        this.setState({uploadedFiles:acceptedFiles});
        event.preventDefault();
    }
  
    handleChange(event) {
        event.preventDefault();
        console.log("event target is ->" + event.target.name);
        console.log('Name is ' + event.target.name);
        console.log( 'Value is '+ event.target.value);
        this.setState({[event.target.name] : event.target.value});
    }
    
    handleSubmit(event) {
        console.log("----------FormUI:Entering handleSubmit.......");
        event.preventDefault();

        const formData = new FormData();
        formData.append('uploadedFile', this.state.uploadedFiles[0]);
        formData.append('docId',this.state.docId);
        formData.append('docTitle',this.state.docTitle);
        formData.append('fromWFStatus',this.state.fromWFStatus);
        formData.append( 'toWFStatus', this.state.toWFStatus);

        console.log("---------Form Data is" + formData);

        axios.post('http://localhost:5555/blockEntires', formData)
        .then( (response) => {
            console.log("--------Received response from server..."+ JSON.stringify(response.body));
            this.props.updateParentState(this.state);
        }).catch(function (error) {
            console.log(error);
        });
    }

    ColorBlock() {
        let style1 = {
          margin: '20px',
          width: '625px',
          height: '150px',
          backgroundColor: 'white',
          borderWidth:'5px',
          borderColor:'gray',
          borderStyle: 'dashed',
          align:'left'
        }
        return style1;
    }

      render (){
        return(
            <div align='left'>
            <form onSubmit={this.handleSubmit} >
                <Jumbotron>
                    <h3>Blockchain based document validator.</h3>
                    <FormGroup >
                        <ControlLabel>Document Id</ControlLabel>{' '}
                        <FormControl 
                        name="docId"
                        type="text" 
                        value= {this.state.docId}
                        placeholder="Enter Document Id here..." 
                        onChange={this.handleChange.bind(this)}
                        />
                    </FormGroup>{' '}                
                    <FormGroup controlId="formInlineName">
                        <ControlLabel>Document Title</ControlLabel>{' '}
                        <FormControl 
                        name="docTitle"
                        type="text"
                        value= {this.state.docTitle} 
                        placeholder="Enter Document Title here..." 
                        onChange={this.handleChange.bind(this)}
                        />
                    </FormGroup>{' '}     


                    <FormGroup controlId="formControlsSelect">
                    <ControlLabel>Current Workflow Status</ControlLabel>
                    <FormControl 
                        name="fromWFStatus"
                        onChange={this.handleChange}
                        componentClass="select" placeholder="select">
                        <option value="Select...">Select...</option>
                        <option value="Draft">Draft</option>
                        <option value="Approval">Approval</option>
                        <option value="Final_Review">Final Review</option>
                        <option value="Publishing">Publishing</option>
                        <option value="Moodys_COM">Moodys_COM</option>
                    </FormControl>
                    </FormGroup>


                  <FormGroup controlId="formControlsSelect">
                    <ControlLabel>Target Workflow Status</ControlLabel>
                    <FormControl 
                        name="toWFStatus"
                        onChange={this.handleChange}
                        componentClass="select" placeholder="select">
                        <option value="Select...">Select...</option>
                        <option value="Draft">Draft</option>
                        <option value="Approval">Approval</option>
                        <option value="Final_Review">Final Review</option>
                        <option value="Publishing">Publishing</option>
                        <option value="Moodys_COM">Moodys_COM</option>
                    </FormControl>
                    </FormGroup>

                    <section>
                        <div className="dropzone">
                        <Dropzone onDrop={this.onDrop}
                        style={this.ColorBlock()}
                        >
                            <p>Try dropping some files here, or click to select files to upload.</p>
                        </Dropzone>
                        </div>
                        <aside>
                        <h4>Dropped files</h4>
                        <ul>
                            {
                                this.state.uploadedFiles.map(f => <li key={f.name}>{f.name} - {f.size} bytes</li>)
                            }
                        </ul>
                        </aside>
                    </section>
                    <Button 
                    onChange={this.handleSubmit.bind(this)}
                    name="submit"
                    valut="bubmit" 
                    type="submit"
                    aligh="right"
                    bsStyle="primary"
                    >Submit
                    </Button>
                </Jumbotron>
            </form>
            </div>
            )
    }
}
export default FormUI;
