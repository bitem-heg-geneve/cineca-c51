import './App.css';
import React from 'react';
import { Bar } from 'react-chartjs-2';

function AgeChart(props) {

  const options = {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  };

  const ages = ["Unknown", "0-10", "11-20", "21-50", "51-65", "65+"];

  function getAgeCategory(age) {
    if (isNaN(age)) return ages[0];
    if (age <= 10)  return ages[1];
    if (age <= 20)  return ages[2];
    if (age <= 50)  return ages[3];
    if (age <= 65)  return ages[4];
    if (age >  65)  return ages[5];
  }

  function getAgeData() {
    var filtered_data = props.data;
    var label_data = {};
    for (var age in ages) label_data[age]=0;
    for (var i=0; i<filtered_data.length;i++) {
      var rec = filtered_data[i];
      var label = getAgeCategory(rec["_source"]["norm_age"]);
      if (! (label in label_data)) label_data[label] = 0;
      label_data[label] += 1;
    }
    var labels = [];
    var data = [];
    for (var k in ages) {
      var label = ages[k];
      labels.push(label);
      data.push(label_data[label]);
    }
    var result = {
      labels: labels,
      datasets: [ {label: "Age", data: data } ]
    };
    return result;
  }

  return (
      <Bar className="pam-age-bar" data={getAgeData()} options={options} />
  );

}

export default AgeChart;
