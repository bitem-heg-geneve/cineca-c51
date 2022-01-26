import './App.css';
import React from 'react';
import { Button, SearchInput } from 'evergreen-ui'
import { useHistory } from "react-router-dom";
import logosib from './logos/logo_sib.png';
import logocineca from './logos/CINECA_logo.png';
import logoeuro from './logos/European_union_logo.png';
import logoelixir from './logos/logo_elixir.png';
import logohes from './logos/logo_hesso.png';
import { getUrlParam, isDev } from "./utils";


function GotoStep2Button(props) {
  const history = useHistory();
  const env = getUrlParam("env");
  const env_param = env=="" ? "" : "&env=" + env;
  const navigateTo = () => history.push('/Step2?query=' + props.query + env_param);
  return (
   <Button type="submit" onClick={navigateTo} appearance="primary" fontSize={'16px'} padding={'10px'} >Search</Button>
  );
}

class Step1 extends React.Component {

  constructor(props) {
    super(props);
    this.state = {query: ''};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
      //console.log(e.target.value);
      this.setState({query: e.target.value});
  }

  render() {
    //console.log('rendering with state query', this.state.query);
    return (
      <div class="pam-ext-box">
      <div class="pam-int-box">
        <h3>Search studies</h3>
        <p className="pam-debug">State query is: {this.state.query}</p>
        <br />&nbsp;
        <SearchInput placeholder="Enter your query..." width="300px" value={this.state.query} onChange={this.handleChange} />
        <div class="pam-example">Query example: BRCA1</div>
        <br />&nbsp;<br />
        <GotoStep2Button query={this.state.query} />
        <br />&nbsp;<br />
        <br />&nbsp;<br />
        <br />&nbsp;<br />
        <br />&nbsp;<br />
        <br />&nbsp;<br />
        <img class="pam-logos" src={logosib} alt="logo_SIB" />
        <img class="pam-logos" src={logohes} alt="logo_HES"  />
        <img class="pam-logos" src={logoelixir} alt="logo_Elixir" />
        <img class="pam-logos" src={logocineca} alt="logo_CINECA"  />
        <img class="pam-logos" src={logoeuro} alt="logo_Europe"  />
      </div>
      </div>
    );
  }
}


export default Step1;
