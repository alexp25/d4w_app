angular.module('app').config(function() {


  // Load the fonts
  /*  Highcharts.createElement('link', {
      href: '//fonts.googleapis.com/css?family=Unica+One',
      rel: 'stylesheet',
      type: 'text/css'
    }, null, document.getElementsByTagName('head')[0]);
  */
  Highcharts.theme = {
    colors: ["#f45b5b", "#8085e9", "#8d4654", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
      "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"
    ],
    global: {
      useUTC: false
    },
    chart: {
      backgroundColor: null,
      style: {
        fontFamily: "'Unica One', sans-serif"
      }
    },
    title: {
      style: {
        color: 'black',
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    subtitle: {
      style: {
        color: 'black'
      }
    },
    tooltip: {
      enabled: false,
      borderWidth: 0
    },
    legend: {
      itemStyle: {
        fontWeight: 'bold',
        fontSize: '13px',
        color: 'black'
      }
    },
    xAxis: {
      labels: {
        style: {
          color: 'white',
          fontWeight: 'normal',
          fontSize: '15px'
        }
      }
    },
    yAxis: {
      labels: {
        style: {
          color: 'white',
          fontWeight: 'bold',
          fontSize: '15px'
        },
        y: 2,
        gridLineColor: 'white'
      }
    },
    plotOptions: {
      series: {
        shadow: true
      },
      candlestick: {
        lineColor: '#404048'
      },
      map: {
        shadow: false
      }
    },

    // General
    background2: '#E0E0E8'
    //background2: 'white'

  };
  // Apply the theme
  Highcharts.setOptions(Highcharts.theme);

});
