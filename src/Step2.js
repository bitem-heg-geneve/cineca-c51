import './App.css';
import React from 'react';
import { Table } from 'evergreen-ui'
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
  return (<h3>Step2 - Studies related to query <span className="pam-query-string">"{decodeURI(getUrlParam('query'))}"</span></h3> );
}

function Debug(props) {
  return (
    <p className="pam-debug">
      url param query is: {getUrlParam('query')}
      state prev query is: {props.prevQuery} </p> );
}


function StudyTable(props) {

  const history = useHistory();
  const navigateTo = (id) => history.push('/Step3?query=' + id);

  return (
     <Table backgroundColor={'#eeeeee'}>
        <Table.Head width="100%" paddingLeft={0}>
          <Table.TextHeaderCell>EGA stableId</Table.TextHeaderCell>
          <Table.TextHeaderCell>Title</Table.TextHeaderCell>
          <Table.TextHeaderCell>Study type</Table.TextHeaderCell>
          <Table.TextHeaderCell flexBasis={'30%'} flexShrink={0} flexGrow={0} >Description</Table.TextHeaderCell>
          <Table.TextHeaderCell flexBasis={'30%'} flexShrink={0} flexGrow={0} >Study abstract</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body width="100%" paddingLeft={0}>
          {props.studies.map((study, index) => (
            <Table.Row height="auto" key={index} isSelectable onSelect={() => navigateTo(study.egaStableId)}>
              <Table.TextCell>{study.egaStableId}</Table.TextCell>
              <Table.TextCell><div className="pam-cell-div">{study.title}</div></Table.TextCell>
              <Table.TextCell>{study.studyType}</Table.TextCell>
              <Table.TextCell flexBasis={'30%'} flexShrink={0} flexGrow={0} ><div className="pam-cell-div">{study.description}</div></Table.TextCell>
              <Table.TextCell flexBasis={'30%'} flexShrink={0} flexGrow={0} ><div className="pam-cell-div">{study.studyAbstract}</div></Table.TextCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
);
}


class Step2 extends React.Component {

  constructor(props) {
    super(props);
    this.state = { externalData: {}, error: false, prevQuery: 'beuh' };
  }

  _loadAsyncData(query) {
    // external URL requires server to 'Access-Control-Allow-Origin' from anywhere (CORS)
    // the python service behind https://denver.text-analytics.ch is CORS compatible
    let url = 'https://denver.text-analytics.ch/bitem/cineca/fake/fake_studies.json';
    //let url = 'http://localhost:8088/bitem/cineca/fake/fake_studies.json'

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

    if (this.state.externalData == {}) {
      return   <div className="pam-flex-wrapper"><Header/><Debug/><p>No data</p></div>
    }

    if (this.state.externalData.data && this.state.externalData.data.length > 0) {
      const studies = this.state.externalData.data;
      return (
        <div className="pam-flex-wrapper">
          <Header/>
          <Debug/>
          <div className="pam-flexible">
            <StudyTable studies={studies} />
          </div>
        </div>
      );
    }

    return <div className="pam-flex-wrapper"><Header/><Debug/><p>Waiting...</p></div>;

  }
}


export default Step2;
