import './App.css';
import React from 'react';
import { Bar } from 'react-chartjs-2';



function YesNoUnknownChart(props) {

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

  function getFieldData() {
    var filtered_data = props.data;
    var label_data = {"Yes":0, "No":0, "Unknown": 0};
    for (var i=0; i<filtered_data.length;i++) {
      var rec = filtered_data[i];
      var fld = props.fld.name;
      var value = rec["_source"][fld];
      if (value==true) {
        label_data["Yes"] += 1;
      } else if (value==false) {
        label_data["No"] += 1;
      } else {
        label_data["Unknown"] += 1;
      }
    }
    var labels = [];
    var data = [];
    for (var k in label_data) {
      labels.push(k);
      data.push(label_data[k]);
    }
    var result = {
      labels: labels,
      datasets: [ {label: props.fld.label, data: data } ]
    };
    return result;
  }

  return (
      <Bar className="pam-gender-bar" data={getFieldData()} options={options} />
  );

}

export default YesNoUnknownChart;
