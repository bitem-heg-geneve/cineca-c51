import './App.css';
import React from 'react';
import Step1 from './Step1';
import Step1_QE from './Step1_QE';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import StepTest from './StepTest';
import { BrowserRouter, Switch, Route, Link, NavLink , Redirect } from "react-router-dom";


function App(props) {

  /*
          <nav className="pam-nav">
            <NavLink className="pam-link" activeClassName="pam-link-current" to="/home">Home</NavLink>&nbsp;
            <span className="pam-nav-text">Steps&nbsp;</span>
            <NavLink className="pam-link" activeClassName="pam-link-current" to="/step1">Step1</NavLink>&nbsp;
            <NavLink className="pam-link" activeClassName="pam-link-current" to="/step2">Step2</NavLink>&nbsp;
            <NavLink className="pam-link" activeClassName="pam-link-current" to="/step3">Step3</NavLink>&nbsp;
            <NavLink className="pam-link" activeClassName="pam-link-current" to="/step4">Step4</NavLink>&nbsp;
            <NavLink className="pam-link" activeClassName="pam-link-current" to="/step5">StepTest</NavLink>&nbsp;
            <NavLink className="pam-link-disabled"  to="#">Step5</NavLink>&nbsp;
          </nav>
  */

  return (
    <BrowserRouter basename={process.env.REACT_APP_MYBASENAME}>
      <form className="pam-wrapper">
        <header className="pam-header">React SPA Demonstrator for Cineca Use Case 5.1</header>
        <main className="pam-main pam-flex-wrapper">
        <Switch>
          <Redirect exact strict from="/" push to="/home" />
          <Route exact path="/home"><Home /></Route> />
          <Route path="/step1" component={Step1} />
		  <Route path="/step1_QE" component={Step1_QE} />
          <Route path="/step2" component={Step2} />
          <Route path="/step3" component={Step3} />
          <Route path="/step4" component={Step4} />
          <Route path="/step5" component={StepTest} />
          <Route><NoMatch /></Route>
        </Switch>
        </main>
        <footer className="pam-footer">
          <a href="https://www.sib.swiss/patrick-ruch-group">BiTeM group</a> - February 2022 - <a href="https://github.com/bitem-heg-geneve/cineca-c51">Source</a> -
          node_env: {process.env.NODE_ENV} -
          basename: {process.env.REACT_APP_MYBASENAME}
        </footer>
      </form>
    </BrowserRouter>
  );
}

function Home() {
	return (
		<div>
			<h2>Home</h2>
			<p>T5.1 aims at investigating how information about biospecimens can be used to generate scientific hypotheses. For example, is folate differentially expressed in blood samples of rheumatoid arthritis compared to other immune diseases, are results affected by the pre-analytical conditions, are there readily available and adapted samples for the experimental validation of the data analysis findings? Specific structured query templates will be defined to leverage the linking between bio-samples and analytical features. For example, duration between sample collection and storage; gene or gene product expression networks, laboratory analysis, etc, to support a panel of advanced representations and visualisation artefacts (e.g. regression, clustering, etc) based on the population described in each dataset.</p>
		</div>
	);
}

function NoMatch() {
  return <h2>Unknown page</h2>;
}


export default App;
