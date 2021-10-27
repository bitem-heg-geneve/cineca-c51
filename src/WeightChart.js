import './App.css';
import React from 'react';
import { Bar } from 'react-chartjs-2';

function WeightChart(props) {

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

  const weights = ["Unknown", "0-25", "26-50", "51-75", "76-100", "100+"];

  function getWeightCategory(age) {
    if (isNaN(age)) return weights[0];
    if (age <= 25)  return weights[1];
    if (age <= 50)  return weights[2];
    if (age <= 75)  return weights[3];
    if (age <= 100)  return weights[4];
    if (age >  100)  return weights[5];
  }

  function getWeightData() {
    var filtered_data = props.data;
    var label_data = {};
    for (var weight in weights) label_data[weight]=0;
    for (var i=0; i<filtered_data.length;i++) {
      var rec = filtered_data[i];
      var label = getWeightCategory(rec["_source"]["norm_weight"]);
      if (! (label in label_data)) label_data[label] = 0;
      label_data[label] += 1;
    }
    var labels = [];
    var data = [];
    for (var k in weights) {
      var label = weights[k];
      labels.push(label);
      data.push(label_data[label]);
    }
    var result = {
      labels: labels,
      datasets: [ {label: "Weight", data: data } ]
    };
    return result;
  }

  return (
      <Bar className="pam-weight-bar" data={getWeightData()} options={options} />
  );

}

export default WeightChart;
