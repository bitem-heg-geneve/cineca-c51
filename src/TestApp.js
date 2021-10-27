import React, { useState, useEffect } from 'react';
//import './App.css';

function Details(props) {

  const [data, setData] = useState([]);
  function getData() {
    console.log("fetching...");
    var clean_chars = props.chars.replace(" ", "");
    return fetch('http://localhost:8088/bitem/cineca/detail/' + clean_chars).then(resp => resp.json())
  }

  useEffect(() => {
   console.log("useEffects...");
   getData()
     .then(obj => {
         console.log("obj.data", obj.data);
         setData(obj.data);
     })
  }, [props.chars])

  return (
    <div>
      count: {data.length}
      <table>
      {data.map((it,idx) => <tr key={idx}><td>{it.ch}</td><td>{it.ord}</td></tr>)}
      </table>
    </div>
  );
}

function App() {

  const [welcome, setWelcome] = useState({"msg": "Hi", "people": "there"});
  const handleChange = (e) => { setWelcome({...welcome, [e.target.name]: e.target.value}); }

  // function handleInputChange(event) {
  //   const target = event.target;
  //   const value = target.type === 'checkbox' ? target.checked : target.value;
  //   const name = target.name;
  //   this.setState({[name]: value});
  // }

  return (
    <div>
      <hr />
      <input name="msg" type="text" value={welcome.msg} onChange={handleChange}/>
      <input name="people" type="text" value={welcome.people} onChange={handleChange}/>
      <hr />
      <div>I am saying "{welcome.msg} {welcome.people} !"</div>
      <hr />
      <Details chars={welcome.msg + " " + welcome.people} />
    </div>
  );
}

export default App;
