import './App.css';
import React from 'react';
import { Bar } from 'react-chartjs-2';



function GenderChart(props) {

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

  function getGenderData() {
    var filtered_data = props.data;
    var label_data = {};
    for (var i=0; i<filtered_data.length;i++) {
      var rec = filtered_data[i];
      var label = rec["_source"]["norm_gender"];
      if (! (label in label_data)) label_data[label] = 0;
      label_data[label] += 1;
    }
    var labels = [];
    var data = [];
    for (var k in label_data) {
      labels.push(k);
      data.push(label_data[k]);
    }
    var result = {
      labels: labels,
      datasets: [ {label: "Gender", data: data } ]
    };
    return result;
  }

  return (
      <Bar className="pam-gender-bar" data={getGenderData()} options={options} />
  );

}

export default GenderChart;
