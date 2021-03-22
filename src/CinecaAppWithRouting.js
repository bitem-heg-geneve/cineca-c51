import './App.css';
import React from 'react';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";

function App(props) {

  return (
    <BrowserRouter basename={process.env.REACT_APP_MYBASENAME}>
      <div className="pam-wrapper">
        <header className="pam-header">React SPA Demonstrator for Cineca Use Case 5.1</header>
        <nav className="pam-nav">
          <Link className="pam-link" to="/">Home</Link>&nbsp;
          <span className="pam-nav-text">Steps&nbsp;</span>
          <Link className="pam-link" to="/step1">Step1</Link>&nbsp;
          <Link className="pam-link-current" to="/step2">Step2</Link>&nbsp;
          <Link className="pam-link" to="/step3">Step3</Link>&nbsp;
          <Link className="pam-link" to="/step4">Step4</Link>&nbsp;
          <Link className="pam-link-disabled" to="#">Step5</Link>&nbsp;
        </nav>
        <main className="pam-main pam-flex-wrapper">
        <Switch>
          <Route path="/step1" component={Step1} />
          <Route path="/step2" component={Step2} />
          <Route path="/step3" component={Step3} />
          <Route path="/step4" component={Step4} />
          <Route path="/step5" component={Step5} />
          <Route path="/" component={Home} />
        </Switch>
        </main>
        <footer className="pam-footer">
          BiTeM group - March 2021 -
          node_env: {process.env.NODE_ENV} -
          basename: {process.env.REACT_APP_MYBASENAME}
        </footer>
      </div>
    </BrowserRouter>
  );
}

function Home() {
  return ( <div><h2>Home</h2>Some comments explaining the demontrator purpose and services called</div> );
}

function Step4() {
  return <h2>Step4</h2>;
}
function Step5() {
  return <h2>Step5</h2>;
}


export default App;
