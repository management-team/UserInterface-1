import React, { Fragment, Component } from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import { Table, Button } from 'reactstrap';
import { ISurvey } from '../../../model/surveys/survey.model';
import SurveyModal from './survey-assign-modal.component';
import { surveyClient } from '../../../axios/sms-clients/survey-client';
import { IAuthState } from '../../../reducers/management';
import { IState } from '../../../reducers';
import { connect } from 'react-redux';
import Loader from '../Loader/Loader';
import DatePicker from 'react-date-picker';

interface IComponentProps extends RouteComponentProps<{}> {
    auth: IAuthState;
}

interface IComponentState {
    surveys: ISurvey[],
    surveysLoaded: boolean,
    surveysToAssign: number[],
    redirectTo: string | null,
    title: string,
    description: string,
    createdDate: Date,
    endDate: Date

}

class AllSurveysComponent extends Component<IComponentProps, IComponentState> {
    constructor(props) {
        super(props);
        this.state = {
            surveys: [],
            surveysLoaded: false,
            surveysToAssign: [],
            redirectTo: null,
            title: "",
            description: "",
            createdDate: new Date(),
            endDate: new Date()
        }
    }

    componentDidMount() {
        this.loadAllSurveys();
    }

    // When the user clicks a data button for a survey, redirect to the data page for that survey
    handleLoadSurveyData = (surveyId: number) => {
        this.setState({
            redirectTo: `/surveys/survey-data/${surveyId}`
        })
    }

    // When the user clicks a users button for a survey, redirect to the respondents page for that survey
    loadSurveyRespondents = (surveyId: number) => {
        this.setState({
            redirectTo: `/surveys/respondents-data/${surveyId}`
        })
    }

    checkFunc = (e) => {
        const { checked } = e.target;
        const id = +e.target.id;

        if (checked) {
            if (!this.state.surveysToAssign.includes(id)) {
                this.setState({
                    surveysToAssign: [...this.state.surveysToAssign, id]
                });
            }
        } else {
            if (this.state.surveysToAssign.includes(id)) {
                this.setState({
                    surveysToAssign: this.state.surveysToAssign.filter((surveyId) => {
                        return surveyId !== id
                    })
                });
            }
        }
    }

    // Load the surveys into the state
    loadAllSurveys = async () => {
        const allSurveys = await surveyClient.findAllSurveys();
        this.setState({
            surveys: allSurveys,
            surveysLoaded: true
        })
    }

    // getting the surveys by title
    setTitleChange = async (event) => {
        this.setState({
            title: event.target.value
        });
    }
    getSurveysByTitle = async (event) => {
        event.preventDefault();
        if (this.state.title) {
            const surveyByTitle = await surveyClient.findSurveyByTitle(this.state.title);
            this.setState({
                surveys: surveyByTitle,
                surveysLoaded: true
            });
        }
        else { this.loadAllSurveys(); }
    }

    setDescriptionChange = (event) => {
        this.setState({
            description: event.target.value
        });
    }

    getSurveysByDescription = async (event) => {
        event.preventDefault();
        if (this.state.description) {
            const surveyByDescription = await surveyClient.findSurveyByDescription(this.state.description);
            this.setState({
                surveys: surveyByDescription,
                surveysLoaded: true
            });
        }
        else {
            this.loadAllSurveys();
        }
    }

    getDateCreated = async createdDate => {
        this.setState({ createdDate });
        
            const surveyByCreatedDate = await surveyClient.findSurveysByCreatedDate(createdDate);
            if (surveyByCreatedDate) {
                console.log(createdDate);
            this.setState({
                surveys: surveyByCreatedDate,
                surveysLoaded: true
            });
        }
        else {
            this.loadAllSurveys();
        }
    }
   
getDateClosed = async endDate => {
    this.setState({ endDate });
    const surveyByEndDate = await surveyClient.findSurveysByEndDate(endDate);
    if(surveyByEndDate) {
    console.log(endDate);
        this.setState({
            surveys: surveyByEndDate,
            surveysLoaded: true
        });
    }
        else {
            this.loadAllSurveys();
        } 
    
}

render() {
    if (this.state.redirectTo) {
        return <Redirect push to={this.state.redirectTo} />
    }
    return (
        <>
            {this.state.surveysLoaded ? (
                <Fragment>
                    <Table striped id="manage-users-table" className="tableUsers">
                        <thead className="rev-background-color" style={maxWidth}>
                            <tr>
                                <th>Select</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Date Created</th>
                                <th>Closing Date</th>
                                <th>Published</th>
                                <th>Analytics</th>
                                <th>Respondents</th>
                            </tr>

                            <tr style={secondHeadFilter}>

                                <td></td>
                                <td>

                                    <div className="inputWrapper">

                                        <input type="text" id="inputTItle" name="title"
                                            className="inputBox form-control" placeholder="Title"
                                            value={this.state.title} onChange={this.setTitleChange} />
                                        <button type="submit" className="btn btn-success searchbtn" onClick={this.getSurveysByTitle}>o</button>
                                    </div>
                                </td>
                                <td>
                                    <div className="inputWrapper">

                                        <input type="text" id="inputDescription" name="description"
                                            className=" inputBox form-control" placeholder="Description"
                                            value={this.state.description} onChange={this.setDescriptionChange} />
                                        <button type="submit" className="btn btn-success searchbtn" onClick={this.getSurveysByDescription}>o</button>
                                    </div>
                                </td>
                                <td>
                                    <DatePicker
                                        onChange={this.getDateCreated}
                                        value={this.state.createdDate}
                                    /></td>

                                <td>
                                    <DatePicker
                                        onChange={this.getDateClosed}
                                        value={this.state.endDate}
                                    /></td>

                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.surveys.map(survey => (
                                <tr key={survey.surveyId} className="rev-table-row">


                                    <td><input type="checkbox" onChange={e => this.checkFunc(e)} id={survey.surveyId.toString()} /></td>

                                    <td>{survey.title}</td>
                                    <td>{survey.description}</td>
                                    <td>{survey.dateCreated && new Date(survey.dateCreated).toDateString()}</td>
                                    <td>{survey.closingDate && new Date(survey.closingDate).toDateString()}</td>
                                    <td>{survey.published ? 'Yes' : 'No'}</td>
                                    <td><Button className='assignSurveyBtn' onClick={() =>
                                        this.handleLoadSurveyData(survey.surveyId)}>Data</Button></td>
                                    <td><Button className='assignSurveyBtn' onClick={() =>
                                        this.loadSurveyRespondents(survey.surveyId)}>Status</Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <div className="assignButtonDiv">
                        <SurveyModal
                            buttonLabel='Assign To Cohorts'
                            surveysToAssign={this.state.surveysToAssign} />
                    </div>
                </Fragment>
            ) : (
                    <Loader />
                )}
        </>
    );
}
}

const mapStateToProps = (state: IState) => ({
    auth: state.managementState.auth
});

export default connect(mapStateToProps)(AllSurveysComponent);

const maxWidth = {
    width: '100%'
}

const secondHeadFilter = {
    width: '100%',
    background: 'white'
}