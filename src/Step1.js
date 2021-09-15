import './App.css';
import React from 'react';
import { Button, SearchInput } from 'evergreen-ui'
import { useHistory } from "react-router-dom";


function GotoStep2Button(props) {
  const history = useHistory();
  const navigateTo = () => history.push('/Step2?query=' + props.query);
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
      <div>
        <h3>Step1 - Search studies</h3>
        <p className="pam-debug">State query is: {this.state.query}</p>
        <SearchInput placeholder="Enter your query..." width="300px" value={this.state.query} onChange={this.handleChange} />
        <br />
        <GotoStep2Button query={this.state.query} />
      </div>
    );
  }
}


export default Step1;
