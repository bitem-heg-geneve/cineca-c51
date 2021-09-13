import './App.css';
import React from 'react';
import { useHistory } from "react-router-dom";


function getUrlParam(name) {
  let params = window.location.search;
  if (params.startsWith("?")) params=params.substr(1);
  let nvlist = params.split("&");
  for (var i=0; i<nvlist.length; i++) {
    let nv = nvlist[i].split("=");
    if (nv[0]==name && nv.length==2) return nv[1];
  }
  return "";
}

function Header(props) {
  return (<h3>Step3 - Datasets of study {getUrlParam('query')}</h3> );
}

function Debug(props) {
  return (
    <p className="pam-debug">
      url param query is: {getUrlParam('query')}
      state prev query is: {props.prevQuery} </p> );
}


function DatasetTable(props) {

  return (
     <table>
        <thead>
          <tr>
          <th>EGA stableId</th>
          <th>Title</th>
          <th>Dataset types</th>
          <th>Description</th>
          <th>Access type</th>
          <th>Center name</th>
          <th>Technology(ies)</th>
          </tr>
        </thead>
        <tbody >
          {props.datasets.map((dataset, index) => (
            <tr key={index}  onClick={() => alert(dataset.egaStableId)}>
              <td>{dataset.egaStableId}</td>
              <td>{dataset.title}</td>
              <td>{dataset.datasetTypes}</td>
              <td>{dataset.description}</td>
              <td>{dataset.accessType}</td>
              <td>{dataset.centerName}</td>
              <td>{dataset.technology}</td>
            </tr>
          ))}
        </tbody>
      </table>
);
}

function MainContent(props) {
  if (props.status=='waiting') return <p>Waiting...</p>;
  if (props.status=='no data') return <p>Found no info about datasets related to this study</p>;
  return (
    <div className="pam-flexible">
      <DatasetTable datasets={props.datasets} />
    </div>);
}


class Step3 extends React.Component {

  constructor(props) {
    super(props);
    this.state = { externalData: {}, error: false, prevQuery: 'beuh' };
  }

  _loadAsyncData(query) {
    // example: query=EGAS00001003889
    // TODO?: use proxy python rather than direct access to ega-archive
    let url = 'https://ega-archive.org/metadata/v2/datasets?queryBy=study&queryId=' + query + '&limit=0';

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
    var datasets = [];
    if (this.state.externalData == {}) status = 'no data';
    if (this.state.externalData && this.state.externalData.response) {
      datasets = this.state.externalData.response.result;
      if (this.state.externalData.response.result.length == 0) status = 'no data';
      if (this.state.externalData.response.result.length  > 0) status = 'ok';
    }

    return (
      <div className="pam-flex-wrapper">
        <Header/>
        <Debug/>
        <MainContent datasets={datasets} status={status} />
      </div>
    );
}






}


export default Step3;
