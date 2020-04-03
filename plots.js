function init() {
  var selector = d3.select("#selDataset");

  d3.json("samples.json").then((data) => {
    console.log(data);
    var sampleNames = data.names;
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
    
    //sampIndex0 = sampleNames[0]
    optionChanged(sampleNames[0]);

  })
}

init();

function optionChanged(newSample) {
  buildMetadata(newSample);
  buildCharts(newSample);
};

function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    var PANEL = d3.select("#sample-metadata");

    PANEL.html("");
    //PANEL.append("h6").text(result.location);
    Object.entries(result).forEach(([key, value]) =>
      {PANEL.append("h5").text(key + ': ' + value);});
  });
};

function buildCharts(sample) {
  d3.json("samples.json").then((data) => {
         
    //get the sample data for the selected id
    var idSamples = data.samples.filter(sampleObj => sampleObj.id == sample);
    console.log("idSamples");
    console.log(idSamples);

    // Bar Chart
    //set variable to use to build bar chart and sort data
    var sortSamples = idSamples.sort(function(a, b) {
      return parseFloat(b.sample_values) - parseFloat(a.sample_values);
    });
    
    // Slice the first 10 objects for plotting
    var xValues = sortSamples.map(row => row.sample_values.slice(0,10));
    var yValues = sortSamples.map(row => row.otu_ids.slice(0,10));
    var textValues = sortSamples.map(row => row.otu_labels.slice(0,10));
    
    // Reverse the array due to Plotly's defaults
    xValues = xValues[0].reverse();
    yValues = yValues[0].reverse();
    yValues = yValues.map(i => 'OTU ' + i);
    textValues = textValues[0].reverse();

    // Trace for the bar chart
    var trace1 = {
      x: xValues,
      y: yValues,
      text: textValues,
      type: "bar",
      orientation: "h"
    };

    // data
    var dataBar = [trace1];

    // Apply title to the layout
    var layout = {
      title: "Top 10 Bacterial Species"
    };

    // Render the plot to the div tag with id "bar"
    Plotly.newPlot("bar", dataBar, layout);


    // Bubble Chart


    //dataset for trace
    var resultsTrace2 = idSamples[0];
    
    var xValuesBubble = resultsTrace2.otu_ids;
    var yValuesBubble = resultsTrace2.sample_values;
    var textValuesBubble = resultsTrace2.otu_labels;
    //var colorsBubble = xValuesBubble.map(String);
       
    var desired_maximum_marker_size = 80;
    var size = yValuesBubble;
    var trace2 = {
      x: xValuesBubble,
      y: yValuesBubble,
      text: textValuesBubble,
      mode: 'markers',
      marker: {
        size: size,
        //set 'sizeref' to an 'ideal' size given by the formula sizeref = 2. * max(array_of_size_values) / (desired_maximum_marker_size ** 2)
        sizeref: 2.0 * Math.max(...size) / (desired_maximum_marker_size**2),
        sizemode: 'area',
        colorscale: 'Portland',
        color: xValuesBubble
      }
    };

    var dataBubble = [trace2];

    var layout = {
      title: 'Bacteria Species Frequency',
      xaxis: {title: "OTU ID"},
      showlegend: false,
      height: 500,
      width: 1200
    };

    Plotly.newPlot("bubble", dataBubble, layout);


    //Gauge Chart without needle
    var metadataGauge = data.metadata;
    var resultArrayGauge = metadataGauge.filter(sampleObj => sampleObj.id == sample);
    var resultGauge = resultArrayGauge[0];
    var washFreq = resultGauge.wfreq;

    // var dataGauge = [
    //   {
    //     domain: { x: [0, 1], y: [0, 1] },
    //     value: washFreq,
    //     title: { text: "Belly Button Washing Frequency <br> Scrubs per Week" },
    //     type: "indicator",
    //     mode: "gauge+number",
    //     gauge: { axis: { range: [null, 9] } }
    //   }
    // ];
    
    // var layout = { width: 600, height: 400 };
    // Plotly.newPlot('gauge', dataGauge, layout);


    // Gauge with needle
    // Enter a speed between 0 and 180
    var level = washFreq;

    // Trig to calc meter point
    var degrees = 180 - ((level/9)*180),
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);
    var path1 = (degrees < 45 || degrees > 135) ? 'M -0.0 -0.025 L 0.0 0.025 L ' : 'M -0.025 -0.0 L 0.025 0.0 L ';
    // Path: may have to change to create a better triangle
    var mainPath = path1,
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var dataGauge2 = [{ type: 'scatter',
      x: [0], y:[0],
        marker: {size: 14, color:'850000'},
        showlegend: false,
        name: 'wash frequency',
        text: level,
        hoverinfo: 'text+name'},
      { values: [1,1,1,1,1,1,1,1,1,9],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6','4-5','3-4','2-3','1-2','0-1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {
        colors:[
          'rgba(28, 106, 11, 1)',
          'rgba(51, 122, 33, 1)',
          'rgba(75, 138, 56, 1)',
          'rgba(99, 155, 78, 1)',
          'rgba(123, 171, 101, 1)',
          'rgba(146, 187, 124, 1)',
          'rgba(170, 204, 146, 1)',
          'rgba(194, 220, 169, 1)',
          'rgba(218, 237, 192, 1)',
          'rgba(0, 0, 0, 0)']
      },
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];

    var layoutGauge2 = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      height: 500,
      width: 500,
      title: { text: "Belly Button Washing Frequency <br> Scrubs per Week" },
      xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };

    Plotly.newPlot('gauge', dataGauge2, layoutGauge2);

  });
};