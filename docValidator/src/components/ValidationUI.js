import React, {Component} from 'react';
import {Jumbotron,Button} from 'react-bootstrap';
//import '../../node_modules/bootstrap/dist/css/bootstrap.min.css'; 
import BootstrapTable from 'react-bootstrap-table-next';
import axios from 'axios';


class ValidationUI extends Component {
    constructor(props)
    {
        super(props);
        this.state = {
            _docId : null,
            docDetails : [{
                docId:'--',
                docTitle:'--',
                fromWFStatus:'--',
                toWFStatus:'--',
                validationResult:'--'
                }],
            columns : [
                {
                    dataField: 'docId',
                    text: 'Document ID'
                },
                {
                    dataField: 'docTitle',
                    text: 'Document Title'
                },
                {
                    dataField: 'fromWFStatus',
                    text: 'From Workflow Status'
                },
                {
                    dataField: 'toWFStatus',
                    text: 'To Workflow Status'
                },
                {
                    dataField: 'validationResult',
                    text: 'Validation Result'
                }

            ]
        };
        this.handleValidate = this.handleValidate.bind(this);
    }



    handleValidate(event) {
        console.log("Inside ValidationUI: this.props.dataFromParent: "+ this.props.parentDocId);
        console.log("Inside ValidationUI: this.state.docId: "+ this.props.parentDocId);
        event.preventDefault();

        axios.get('http://localhost:5555/validateEntires', {params: {"docId":this.props.parentDocId}})
        .then( (response) => {
            console.log("INSIDE HANDLEEVENT "+JSON.stringify(response.data));
            //this.props.updateParentState(this.state);
            this.setState({"docDetails":response.data});
            
        }).catch(function (error) {
            console.log(error);
        });
    }

    componentWillReceiveProps(nextProps){
        console.log("Inside componentWillReceiveProps Next Prof is:" + nextProps.parentDocId);
        this.getData(nextProps.parentDocId);

    }


    getData(parentDocId) {
        var docDetailsTemp = {"docDetails": null};
        if (parentDocId !== null && typeof parentDocId !== '' && typeof parentDocId !== undefined)
        {
            console.log("\n\n---------------------Inside getData(), and parent DocId is NOT NULL:" + parentDocId);
            axios.get('http://localhost:8000/api/dbblock/'+parentDocId).
            then((dbQueryResponse) => {
                console.log("Mongo Response is :" + dbQueryResponse.data);
                docDetailsTemp.docDetails = dbQueryResponse.data;
                //this.setState({docDetails:undefined});
                this.setState({docDetails: []});
                this.setState(docDetailsTemp);
            }).catch(function (error) {
               console.log(error);
           });
        }
        else
        {
            console.log("\n\n---------------------Inside getData(), and parent DocId is NULL:" + parentDocId);
            var responseArr = [];
            var emptyResponseObj = {
                docId:'**',
                docTitle:'**',
                fromWFStatus:'**',
                toWFStatus:'**',
                validationResult:'**'
                };
            responseArr.push(emptyResponseObj);
            docDetailsTemp.docDetails = responseArr;
            this.setState(docDetailsTemp);
        }
    }

    render (){
        console.log("Inside ValidateUI Render#########11" + JSON.stringify(this.state.docDetails));
        return(
            <div>
            <form onSubmit={this.handleValidate}>
                <Jumbotron>
                    <h3>Validate with blockchain</h3>
                    <div className="container" style={{ marginTop: 50 }}>
                        <BootstrapTable 
                        striped
                        hover
                        keyField='docId' 
                        data={ this.state.docDetails } 
                        columns={ this.state.columns } />
                    </div>
                    <Button 
                        onChange={this.handleValidate.bind(this)}
                        name="submit"
                        valut="bubmit" 
                        type="submit"
                        bsStyle="primary"
                        >Validate
                    </Button>

                </Jumbotron>
            </form>
            </div>
        )    

    }
}
export default ValidationUI;
