import './App.css';
import React from 'react';
import { useHistory } from "react-router-dom";
import { Button } from 'evergreen-ui';
import { getUrlParam} from "./utils";


function shorten(txt, max_lng) {
  return txt && txt.length && txt.length > max_lng ? txt.substr(0, max_lng) + ' ...' : txt;
}




function Header(props) {
  return (<h3>Step3 - Datasets of selected study(ies) <span className="pam-query-string">{getUrlParam('query')}</span></h3> );
}

function Debug(props) {
  return (
    <p className="pam-debug">
      url param query is: {getUrlParam('query')}
      state prev query is: {props.prevQuery} </p> );
}

function ErrorMsg(props) {
  if (props.error) return ( <p className="pam-error">{props.error}</p> ) ;
  return null;
}

function replace_underscore(str) {
  if (str) return str.replaceAll("_", " ");
  return "";
}

function get_study_title(study) {
  return "Study " + study.egaStableId + " - " + replace_underscore(shorten(study.title,200));
}

function StudyList(props) {
  return (
    <div>
    {props.studies.map((study, index) => (
      <div key={"ST" + index} >
        <DatasetTable datasets={study.datasets} title={get_study_title(study)} />
        <ErrorMsg error={study.error} />
        <div className="pam-study-spacer" />
      </div>
    ))}
    </div>

  )
}

function DatasetTitleRow(props) {
  return ( <tr><th colSpan="9" className="pam-table-title">{props.title}</th></tr> );
}

function DatasetHeaderRow(props) {
  return (
        <tr>
          <th>Selected</th>
          <th>Dataset id</th>
          <th>Title</th>
          <th>Dataset types</th>
          <th>Description</th>
          <th>Beacon</th>
          <th>Access type</th>
          <th>Center name</th>
          <th>Technologies</th>
        </tr>
    );
}

function DatasetTable(props) {

  if (props.datasets.length==0) {
    return (
       <table>
        <thead>
         <DatasetTitleRow title={props.title} />
        </thead>
       </table>
    );
  } else {
    return (
       <table>
         <thead>
          <DatasetTitleRow title={props.title} />
          <DatasetHeaderRow />
         </thead>
         <tbody>
           {props.datasets.map((dataset, index) => (
             <tr key={"DS" + index} >
               <td><input type="checkbox" name="checked_datasets" value={dataset.egaStableId} /></td>
               <td>{dataset.egaStableId}</td>
               <td>{dataset.title}</td>
               <td>{dataset.datasetTypes}</td>
               <td>{dataset.description}</td>
               <td>Yes</td>
               <td>{dataset.accessType}</td>
               <td>{dataset.centerName}</td>
               <td>{dataset.technology}</td>
             </tr>
           ))}
         </tbody>
       </table>
    );
  }
}

function MainContent(props) {
  if (props.status=='waiting') return <p>Waiting...</p>;
  if (props.status=='no data') return <p>Found no info about datasets related to these studies</p>;
  return (
      <StudyList studies={props.studies} />
  );
}


function GotoStep4Button(props) {

  const history = useHistory();

  function navigateTo(id) {
    var nodes = document.getElementsByName("checked_datasets");
    console.log(nodes);
    var ds_list=[];
    for (var i=0; i< nodes.length;i++) {
      var cb = nodes[i];
      if (cb.checked) ds_list.push(cb.value);
    }
    var datasets = ds_list.join(",");
    console.log("checked_datasets", datasets);
    history.push('/Step4?query=' + datasets);
  }

  return (
   <Button className="pam-action-button" type="submit" onClick={navigateTo} appearance="primary" fontSize={'16px'} padding={'10px'} >Request/Get access</Button>
  );
}


class Step3 extends React.Component {

  constructor(props) {
    super(props);
    this.state = { externalData: {}, error: false, prevQuery: 'beuh' };
  }

  _loadAsyncData(query) {
    //let url = 'http://localhost:8088/bitem/cineca/proxy/ega_datasets?studies=' + query
    let url = 'https://denver.text-analytics.ch/bitem/cineca/proxy/ega_datasets?studies=' + query;


    fetch(url)
      .then(this.handleFetchError)
      .then((result) => result.json() )
      .then((result) => this.setState({ externalData: result, error: false }))
      .catch((error) => this.setState({ externalData: {}, error: error.name + " : " + error.message}));
  }

  static getDerivedStateFromProps(props, state) {
    // Store prevQuery in state so we can compare when props change.
    // Clear out previously-loaded data (so we don't render stale stuff).
    let currQuery = getUrlParam('query');
    if (state.prevQuery !== currQuery) {
      console.log("getDerivedStateFromProps updating state");
      return {
        externalData: {},
        error: false,
        prevQuery: currQuery
      };
    }
    // No state update necessary
    return null;
  }

  componentDidMount() {
    console.log("componentDidMount triggering _loadAsyncData");
    this._loadAsyncData(getUrlParam('query'));
  }

  __componentDidUpdate(prevProps, prevState) {
    if (this.state.externalData === {} && ! this.state.error) {
      console.log("componentDidUpdate triggering _loadAsyncData");
      this._loadAsyncData(getUrlParam('query'));
    }
  }

  handleFetchError(response) {
    if (response.ok) return response;
    throw Error(response.statusText);
  }

  render() {

    console.log('rendering, props, state', this.props, this.state);

    var status = 'waiting';
    var studies = [];
    console.log("externale data", this.state.externalData);
    if (this.state.externalData == {}) status = 'no data';
    if (this.state.externalData && this.state.externalData.data) {
      studies = this.state.externalData.data;
      console.log("studies", studies);
      if (studies.length == 0) status = 'no data';
      if (studies.length  > 0) status = 'ok';
    }

    return (
      <div className="pam-flex-wrapper">
        <Header/>
        <Debug/>
        <div className="pam-flexible">
          <MainContent studies={studies} status={status} />
        </div>
        <GotoStep4Button />
      </div>
    );
}






}


export default Step3;
