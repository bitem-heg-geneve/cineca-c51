import './App.css';
import React, { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import ReactDOM from "react-dom";
import { default as ReactSelect, components } from "react-select";
import { getUrlParam, isDev } from "./utils";
import { Button, SearchInput } from 'evergreen-ui'

import logosib from './logos/logo_sib.png';
import logocineca from './logos/CINECA_logo.png';
import logoeuro from './logos/European_union_logo.png';
import logoelixir from './logos/logo_elixir.png';
import logohes from './logos/logo_hesso.png';


function GotoStep2Button(props) {
	const history = useHistory();
	const env = getUrlParam("env");
	const env_param = env=="" ? "" : "&env=" + env;
	const navigateTo = () => {history.push('/Step2?query=' + props.query + env_param);}

	return (
		<Button type="submit" onClick={navigateTo} appearance="primary" fontSize={'16px'} padding={'10px'} >Search</Button>
	);
}


const GetExpansion = ({query,expansionType,newKeywords,arraySave}) => {
	const [synonyms, setSynonyms] = useState([]);
	const [checked, setChecked] = useState(false);

	const basic_url = 'https://denver.text-analytics.ch/bitem/cineca/proxy/';
	const vertical_expansion_url = 'catalogue_explorer/VerticalExpansionMesh/?keywords=';
	const data_driven_expansion_url = 'catalogue_explorer/DatadrivenExpansion/?keywords=';
	const variant_expansion_url = 'synvar/generate/litterature/fromMutation?format=beacon&variant=';
	var searchTerm = query;

	const fetchVertical = async () => {
		setSynonyms([])
		var searchUrl = basic_url + vertical_expansion_url + searchTerm
		const response = await fetch(searchUrl)
		const myJson = await response.json()

		setSynonyms(Object.values(myJson.data.response)[0])
	};
	
	const fetchDataDriven = async () => {
		setSynonyms([])
		var searchUrl = basic_url + data_driven_expansion_url + searchTerm;
		const response = await fetch(searchUrl)
		const myJson = await response.json()

		setSynonyms(Object.values(myJson.data.response)[0])
	};
	
	const fetchVariant = async () => {
		setSynonyms([])
		var searchUrl = basic_url + variant_expansion_url + searchTerm;
		const response = await fetch(searchUrl)
		const myJson = await response.json()
console.log(myJson)
		setSynonyms(myJson.response.results.expansion.names)
	};

	useEffect(async () => {
		switch (expansionType) {
			case "data_driven_expansion":
				fetchDataDriven();
				break;
			case "variant_expansion":
				fetchVariant();
				break;
			default:
				fetchVertical();
				break;
		}
	}, []);
	
	if(synonyms){
		var myOpt = synonyms.map(
			item => ({value: item, label: item})
		);
	}

	return (
		<div>
			<ReactSelect
				options={myOpt}
				isMulti={true}
				value={checked}
				closeMenuOnSelect={false}
				hideSelectedOptions={false}
				components={{
					Option
				}}
				onChange={(event, data) => {setChecked(data.value)}}
				allowSelectAll={true}
			/>
		</div>
	);
}


const Option = (props) => {
	return (
		<div>
			<components.Option {...props}>
				<input
					type="checkbox"
					checked={props.isSelected}
					onChange={() => null}
				/>{" "}
				<label>{props.label}</label>
			</components.Option>
		</div>
	)
}



export default function Step1_QE(props) {
	//const { value, bind, reset } = useInput('');
	const [query,setQuery] = useState('');
	const [showQe, setShowQe] = useState(false);
	const [expansionType,setExpansionType]=useState('');

	const onQeClick = () => {setShowQe(!showQe);}
	
	const handleExpansionType=(e)=>{
		setExpansionType(e.target.value);
		
	}


	return (
		  <div class="pam-ext-box">
			  <div class="pam-int-box">
				<h3>Search studies</h3>
				<p className="pam-debug">State query is: {query}</p>
				<br />&nbsp;
				<SearchInput placeholder="Enter your query..." width="300px" value={query} onChange={event => setQuery(event.target.value)} />
				<div class="pam-example">Query example: BRCA1</div>
				<br />&nbsp;<br />
				<div>
					<form>
						<input type="radio" value="vertical_expansion" id="vertical_expansion"
							onChange={handleExpansionType} name="expansionType" />
						<label for="vertical_expansion">Vertical Expansion</label>
						<input type="radio" value="data_driven_expansion" id="data_driven_expansion"
							onChange={handleExpansionType} name="expansionType"/>
						<label for="data_driven_expansion">Data Driven Expansion</label>
					</form>
				</div>
				<div>
					<button type="button" onClick={onQeClick}>Show expansion</button>
						{showQe ? <GetExpansion query={query} expansionType={expansionType}/>:null}
				</div>
				<br />&nbsp;<br />
				<br />&nbsp;<br />
				<GotoStep2Button query={query} />
				<br />&nbsp;<br />
				<br />&nbsp;<br />
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


//export default Step1_QE;
