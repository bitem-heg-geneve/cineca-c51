import './App.css';
import React from 'react';
import { useHistory } from "react-router-dom";
import { Button } from 'evergreen-ui'
import { getUrlParam, isDev } from "./utils";



// function getUrlParam(name) {
//   let params = window.location.search;
//   if (params.startsWith("?")) params=params.substr(1);
//   let nvlist = params.split("&");
//   for (var i=0; i<nvlist.length; i++) {
//     let nv = nvlist[i].split("=");
//     if (nv[0]==name && nv.length==2) return nv[1];
//   }
//   return "";
// }

function Header(props) {
  return (<h3>Studies related to query <span className="pam-query-string">"{decodeURI(getUrlParam('query'))}"</span></h3> );
}

function Debug(props) {
  return (
    <p className="pam-debug">
      url param query is: {getUrlParam('query')}
      state prev query is: {props.prevQuery} </p> );
}


function shorten(txt, max_lng) {
  return txt && txt.length && txt.length > max_lng ? txt.substr(0, max_lng) + ' ...' : txt;
}

function BigTextDiv(props) {
  var lng = props.content ? props.content.length : 0;
  var max = parseInt(props.maxlng);
  if (lng <= max) {
    return ( <div className="tooltip">{props.content}</div> )
  } else {
    return (
      <div className="tooltip">{shorten(props.content, max)}
        <div className="tooltiptext">{props.content}</div>
      </div>
    )
  }
}

function BigHtmlDiv(props) {
  var lng = props.content.length;
  var max = parseInt(props.maxlng);
  if (lng <= max) {
    return ( <div className="tooltip" dangerouslySetInnerHTML={{__html: props.content}}></div> )
  } else {
    return (
      <div className="tooltip">{shorten(props.content, max)}
        <div className="tooltiptext" dangerouslySetInnerHTML={{__html: props.content}}></div>
      </div>
    )
  }
}

function GotoStep3Button(props) {

  const history = useHistory();
  const env = getUrlParam("env");
  const env_param = env=="" ? "" : "&env=" + env;

  function navigateTo(id) {
    var nodes = document.getElementsByName("checked_studies");
    console.log(nodes);
    var study_list=[];
    for (var i=0; i< nodes.length;i++) {
      var cb = nodes[i];
      if (cb.checked) study_list.push(cb.value);
    }
    var studies = study_list.join(",");
    history.push('/Step3?query=' + studies + env_param);
  }

  return (
   <Button className="pam-action-button" type="submit" onClick={navigateTo} appearance="primary" fontSize={'16px'} padding={'10px'} >Expand / Details</Button>
  );
}

function replace_underscore(str) {
  if (str) return str.replaceAll("_", " ");
  return "";
}

function StudyTable(props) {

  return (
     <table >
        <thead>
          <tr>
            <th>Selected</th>
            <th>Study id</th>
            <th>Title</th>
            <th>Study type</th>
            <th>Description</th>
            <th>Study abstract</th>
          </tr>
        </thead>
        <tbody>
          {props.studies.map((study, index) => (
            <tr key={index} >
              <td><input type="checkbox" name="checked_studies" value={study.egaStableId} /></td>
              <td>{study.egaStableId}</td>
              <td>{replace_underscore(study.title)}</td>
              <td>{study.studyType}</td>
              <td><BigHtmlDiv content={study.description} maxlng="200"></BigHtmlDiv></td>
              <td><BigTextDiv content={study.studyAbstract} maxlng="200"></BigTextDiv></td>
            </tr>
          ))}
        </tbody>
      </table>
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
    //let url = 'http://localhost:8088/bitem/cineca/proxy/ega_studies/_search?size=20&q=' + query;
    let url = 'https://denver.text-analytics.ch/bitem/cineca/proxy/ega_studies/_search?size=20&q=' + query;
    if (isDev()) url = 'http://localhost:8088/bitem/cineca/proxy/ega_studies/_search?size=20&q=' + query;

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
          <GotoStep3Button />
        </div>
      );
    }

    return <div className="pam-flex-wrapper"><Header/><Debug/><p>Waiting...</p></div>;

  }
}


export default Step2;
