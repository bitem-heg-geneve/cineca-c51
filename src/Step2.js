import './App.css';
import React from 'react';
import { Table } from 'evergreen-ui'


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

function StudyTable(props) { return (

 <Table backgroundColor={'#eeeeee'}>
    <Table.Head width={'100%'} paddingLeft={0}>
      <Table.TextHeaderCell>EGA stableId</Table.TextHeaderCell>
      <Table.TextHeaderCell>Title</Table.TextHeaderCell>
      <Table.TextHeaderCell>Study type</Table.TextHeaderCell>
      <Table.TextHeaderCell flexBasis={'30%'} flexShrink={0} flexGrow={0} >Description</Table.TextHeaderCell>
      <Table.TextHeaderCell flexBasis={'30%'} flexShrink={0} flexGrow={0} >Study abstract</Table.TextHeaderCell>
    </Table.Head>
    <Table.Body height={240} width={'100%'} paddingLeft={0}>
      {props.studies.map(study => (
        <Table.Row height="auto" backgroundColor={'#ddffff'} key={study.id} isSelectable onSelect={() => alert(study.egaStableId)}>
          <Table.TextCell>{study.egaStableId}</Table.TextCell>
          <Table.TextCell>{study.title}</Table.TextCell>
          <Table.TextCell>{study.studyType}</Table.TextCell>
          <Table.TextCell  flexBasis={'30%'} flexShrink={0} flexGrow={0} >{study.description}</Table.TextCell>
          <Table.TextCell  flexBasis={'30%'} flexShrink={0} flexGrow={0} >{study.studyAbstract}</Table.TextCell>
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
    // let url = 'https://denver.text-analytics.ch/fake_EGA/EGA_studies_pancreatic_cancer.json';
    // let url = "https://candy.hesge.ch/fake_EGA/EGA_studies_pancreatic_cancer.json";
    // external URL requires server to 'Access-Control-Allow-Origin' from anywhere (CORS)
    let url = 'http://localhost:8088/bitem/cineca/fake/fake_studies.json'

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

  Studylist() {
    if (this.state.externalData == {}) {
      return <p>No data</p>
    } else {
      return <p>Some data</p>
    }
  }

  render() {

    console.log('rendering, props, state', this.props, this.state);

    const header =
      <React.Fragment>
      <h3>Step2</h3>
      <p className="pam-mini">
      props query is: {getUrlParam('query')}
      state prev query is: {this.state.prevQuery} </p>
      </React.Fragment> ;


    if (this.state.externalData == {}) {
      return <p>No data</p>
    }

    if (this.state.externalData.data && this.state.externalData.data.length > 0) {
      const studies = this.state.externalData.data;
      return (
        <div>
        {header}
        <StudyTable studies={studies} />
        </div>
      );
    }

    return <p>Waiting...</p>;

  }
}


export default Step2;
