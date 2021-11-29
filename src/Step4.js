import './App.css';
import GenderChart from './GenderChart';
import AgeChart from './AgeChart';
import WeightChart from './WeightChart';
import YesNoUnknownChart from './YesNoUnknownChart';
import React, { useState, useEffect } from 'react';
import { Button, SearchInput } from 'evergreen-ui';
import { useHistory } from 'react-router-dom';

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

// - - - - - - - - - - - - - - - - - - - - - - - - - -
function GlobalResult(props) {
// - - - - - - - - - - - - - - - - - - - - - - - - - -
  const [data, setData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [selectedSources,setSelectedSources] = useState({});

  const formFilled = () => { return props.criteria.disease != "" || props.criteria.variants != "" || props.criteria.other != "" }

  function getData() {
    var params = "";
    params += "disease=" + encodeURI(props.criteria.disease) + "&"
    params += "variants=" + encodeURI(props.criteria.variants) + "&"
    params += "other=" + encodeURI(props.criteria.other)
    var url = 'https://denver.text-analytics.ch/bitem/cineca/proxy/cohorts/_search?' + params;
    return fetch(url).then(resp => resp.json())
  }

  function getSummaryData(data) {
    var total = 0;
    var summary = {};
    for (var i=0; i<data.length;i++) {
      var src = data[i]["_source"].dataset;
      if (summary[src] == undefined) summary[src] = {source: src, sampleMatches:0, sampleCount:0};
      summary[src].sampleMatches += 1;
      total +=1;
    }
    var summaries = [];
    for (var k in summary) {
      summary[k].sampleCount = total;
      summaries.push(summary[k] );
    }
    return summaries;
  }

  useEffect(() => {
    if (formFilled()) {
      getData().then(obj => { setData(obj.data); setSummaryData(getSummaryData(obj.data)); console.log("state.data", data);})
    } else {
      setData([]); setSummaryData([]);
    }
  }, [props.submitCount]);

  function handleSelectionChange(e) {
      setSelectedSources({...selectedSources, [e.target.name]: e.target.checked});
  }

  const resultTable = () => {
    if (summaryData.length > 0 && props.formDirty==0) {
      return (
        <div className="pam-flex-y-content pam-flex-y-container pam-padding">
          <div>
          <table>
            <thead>
              <tr><th>Beacon</th><th>Matching samples</th><th>Sample count</th></tr>
            </thead>
            <tbody>
              {summaryData.map((it,idx) => <tr key={it.source}>
                <td><input type="checkbox" name={it.source} onChange={handleSelectionChange} />&nbsp;{it.source}</td>
                <td>{it.sampleMatches}</td>
                <td>{it.sampleCount}</td></tr>)}
            </tbody>
          </table>
          </div>
          <DetailedStats className="pam-flex-y-content pam-flex-y-container" data={data} sources={selectedSources}></DetailedStats>
        </div>
      );
    }
  };

  return (
    <div className="pam-flex-y-content pam-flex-y-container">
      <div>&nbsp;</div>
      {/*
        <div className="pam-padding">submitCount: {props.submitCount}, formDirty: {props.formDirty}</div>
      */}
      {resultTable()}
    </div>
  );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - -
function DetailedStats(props) {
// - - - - - - - - - - - - - - - - - - - - - - - - - -

  function getFilteredData() {
    var full_data = props.data;
    console.log("data.length", props.data.length);
    var filtered_data = [];
    for (var i=0; i<full_data.length;i++) {
      var ds = full_data[i]["_source"].dataset;
      if (props.sources[ds]) filtered_data.push(full_data[i]);
    }
    return filtered_data;
  }

  return (
    <div className="pam-flex-y-content pam-flex-y-container pam-padding-bottom">
      <div>&nbsp;</div>
      <div>Selected sample count: { getFilteredData().length }</div>
      <div>&nbsp;</div>
      <div className="pam-flex-y-content pam-flex-x-container">
        <GenderChart data={getFilteredData()}  />
        &nbsp;
        <AgeChart    data={getFilteredData()}  />
        &nbsp;
        <WeightChart data={getFilteredData()}  />
        &nbsp;
        <YesNoUnknownChart data={getFilteredData()} fld={{name:"norm_hypertension", label:"Hypertension"}}  />
        &nbsp;
        <YesNoUnknownChart data={getFilteredData()} fld={{name:"norm_cancer", label:"Cancer"}}  />
      </div>
    </div>
  );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - -
function Step4(props) {
// - - - - - - - - - - - - - - - - - - - - - - - - - -
  const [criteria, setCriteria] = useState({"disease": getUrlParam("disease"), "variants": getUrlParam("variants"), "other": getUrlParam("other")});
  const [submitCount, setSubmitCount] = useState(0);
  const [formDirty, setFormDirty] = useState(1);
  const handleChange = (e) => { setCriteria({...criteria, [e.target.name]: e.target.value}); setFormDirty(1);}
  const handleGetStats = (e) => { setFormDirty(0); setSubmitCount(submitCount + 1); e.preventDefault();  }

  return (
    <div className="pam-flex-y-content pam-flex-y-container">
      <h3>Step4 - Beacon data</h3>
      <div className="pam-padding">
        <SearchInput name="disease" placeholder="Disease..." width="300px" value={criteria.disease} onChange={handleChange} />&nbsp;
        <SearchInput name="variants" placeholder="Variants..." width="300px" value={criteria.variants} onChange={handleChange} />&nbsp;
        <SearchInput name="other" placeholder="Other..." width="300px" value={criteria.other} onChange={handleChange} />&nbsp;
        <Button type="submit" onClick={handleGetStats} appearance="primary" fontSize={'16px'} padding={'10px'} >Get stats</Button>
      </div>
      <GlobalResult className="pam-flex-y-content pam-flex-y-container" criteria={criteria} formDirty={formDirty} submitCount={submitCount}></GlobalResult>
    </div>
  );

}


export default Step4;
