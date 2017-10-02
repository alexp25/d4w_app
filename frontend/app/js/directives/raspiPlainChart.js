angular.module('app').directive('raspiPlainChart', function($timeout) {
  return {
    restrict: 'E',
    templateUrl: 'templates/directives/raspi-plain-chart.html',
    scope: {
      caption: '@',
      data: '=',
      size: '=?',
      frame: '=?',
      options: '='
    },
    link: function(scope) {

      function init() {

        var i1;

        if (!scope.data) {
          scope.data = {
            array: [],
            timestamp: new Date()
          };
        }
        if (!scope.labels) {
          scope.labels = [];
        }
        if (!scope.size) {
          scope.size = {};
          scope.size.width = undefined;
          scope.size.height = undefined;
        }
        if (!scope.options) {
          scope.options = [];
          scope.options.xAxisType = 'numeric';
          scope.options.xAxisTickInterval = 10;
          scope.options.yAxisTickInterval = 10;
          scope.options.labels = ['chart 1', 'chart 2'];
          scope.options.minThreshold = 0;
          scope.options.maxThreshold = 0;
          scope.options.chartid = 1;

        } else {
          if (scope.options.range === undefined) {
            scope.options.range = [];
          }

          if (!scope.options.xAxisTickInterval) {
            scope.options.xAxisTickInterval = 10;
          }
          if (!scope.options.yAxisTickInterval) {
            scope.options.yAxisTickInterval = 10;
          }

          if (!scope.options.chartid) {
            scope.options.chartid = 1;
          }

        }

        var customPointShow = {
          events: {
            mouseOver: function() {
              var chart = this.series.chart;
              if (!chart.lbl) {
                chart.lbl = chart.renderer.label('')
                  .attr({
                    padding: 10,
                    r: 10,
                    fill: Highcharts.getOptions().colors[1]
                  })
                  .css({
                    fontSize: "16px",
                    color: '#FFFFFF'
                  })
                  .add();
              }
              chart.lbl
                .show()
                .attr({
                  text: '' + this.x + ': ' + this.y
                });
            }
          }
        };

        var newseries1 = {
          name: 'graph 1',
          data: [300, 350, 360, 320, 300, 350, 360, 320],
          color: '#005990',
          turboThreshold: 0,
          point: customPointShow,
          events: {
            mouseOut: function() {
              if (this.chart.lbl) {
                this.chart.lbl.hide();
              }
            }
          }
        };
        var newseries = {
          name: 'graph 2',
          data: [300, 350, 360, 320, 320, 350, 360, 300],
          color: 'red',
          turboThreshold: 0,
          point: customPointShow,
          events: {
            mouseOut: function() {
              if (this.chart.lbl) {
                this.chart.lbl.hide();
              }
            }
          }
        };

        scope.seriesDef = [];
        scope.seriesColors = ['#005990', 'red'];

        for (var i = 0; i < scope.data.array.length; i++) {
          newseries.name = scope.options.labels[i];
          if (i < scope.seriesColors.length) {
            newseries.color = scope.seriesColors[i];
          }
          scope.seriesDef.push(angular.copy(newseries));
        }

        var COLOR_DARK = '#263238';

        scope.containerid = "container-" + scope.options.chartid.toString();

        console.log(scope.containerid);

        $("#container").prop('id', scope.containerid);
        var height, width;
        if (scope.size.height === undefined) {
          height = $("#" + scope.containerid).height();
        } else {
          height = scope.size.height;
        }
        if (scope.size.width === undefined) {
          width = $("#" + scope.containerid).width();
        } else {
          width = scope.size.width;
        }
        scope.chartConfig = {
          chart: {
            type: 'line',
            // type: 'line',
            zoomType: 'x',
            animation: {
              duration: 0,
              easing: "swing"
            },
            // Edit chart spacing
            spacingBottom: 15,
            spacingTop: 10,
            spacingLeft: 10,
            spacingRight: 10,

            // Explicitly tell the width and height of a chart
            width: width,
            height: height
          },

          // xAxis: {
          //   categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          // },
          //
          // series: [{
          //   data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
          // }]


          plotOptions: {
            line: {
              marker: {
                enabled: false
              }
            },
            spline: {
              marker: {
                enabled: false
              }
              // ,
              // dataLabels: {
              //   enabled: true
              // }
            },
            area: {
              marker: {
                enabled: false
              }
            }
          },

          navigator: {
            enabled: false
          },
          rangeSelector: {
            selected: 1,
            enabled: false
          },

          title: {
            text: '',
            x: -20 //center
          },
          subtitle: {
            text: '',
            x: -20
          },
          xAxis: {
            // type: 'datetime',
            type: scope.options.xAxisType,
            labels: {
              style: {
                color: COLOR_DARK,
                fontWeight: 'normal',
                fontSize: '15px'
              }
            },
            gridLineColor: 'grey',
            gridLineWidth: 0.5,
            gridLineDashStyle: 'solid',
            tickPixelInterval: 100
          },
          yAxis: {
            title: {
              text: ''
            },
            labels: {
              style: {
                color: COLOR_DARK,
                fontWeight: 'normal',
                fontSize: '15px'
              }
            },

            min: scope.options.range[0],
            max: scope.options.range[1],
            tickPixelInterval: 100,
            gridLineColor: 'grey',
            gridLineWidth: 0.5,
            gridLineDashStyle: 'solid'
          },
          // tooltip: {
          //   valueSuffix: ''
          // },

          tooltip: {
            enabled: false,
            formatter: function() {
              return '<b>' + this.series.name + '</b><br/>' +
                Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                Highcharts.numberFormat(this.y, 2);
            }
          },

          // legend: {
          //   enabled: true,
          //   align: 'right',
          //   // backgroundColor: '#FCFFC5',
          //   // borderColor: 'black',
          //   // borderWidth: 2,
          //   layout: 'vertical',
          //   verticalAlign: 'top',
          //   // y: 100,
          //   // shadow: true
          // },
          legend: {
            enabled: true
          },

          series: scope.seriesDef,
          //useHighStocks: true, //NAVIGATION BAR
          // size(optional) if left out the chart will
          // default to size of the div or something sensible.
          // size: {
          //   width: scope.size.width,
          //   height: scope.size.height
          // },
          loading: false
        };

        scope.chart = Highcharts.chart(scope.containerid, scope.chartConfig);
      }


      function renderChart() {
        if (scope.chart === undefined) {
          console.log("First Draw");
          scope.chart = Highcharts.Chart(chartData);
        } else {
          console.log("Redraw");
          scope.chart.destroy();
          scope.chart = Highcharts.Chart(chartData);
          scope.chart.redraw();
        }
      }

      function updateChart(array) {
        if (array[0]) {
          if (!scope.chart) {
            init();
          }
          // console.log('directive: updating chart');
          // console.log(array[0]);
          for (var iseries = 0; iseries < array.length; iseries++) {
            var dataobj = [];
            var i;
            if (scope.options.xAxisType === 'numeric') {
              for (i = 0; i < array[iseries].length; i++) {
                dataobj[i] = {
                  x: i,
                  y: array[iseries][i].y
                };
              }
            } else if (scope.options.xAxisType === 'datetime') {
              // for (i = 0; i < array[iseries].length; i++) {
              //   dataobj[i] = {
              //     x: array[iseries][i].x,
              //     y: array[iseries][i].y
              //   };
              // }
              dataobj = array[iseries];
            } else {
              dataobj = array[iseries];
            }
            // console.log(dataobj);
            scope.chart.series[iseries].setData(dataobj, false);
          }

          if (scope.options.xAxisType === 'numeric') {} else {
            //scope.chart.xAxis[0].setExtremes(scope.options.pointStart, scope.options.pointStart + scope.options.pointInterval * scope.data.array[0].length, false);
          }
          scope.chart.yAxis[0].setExtremes(scope.options.range[0], scope.options.range[1], false);
          // scope.chart.xAxis[0].setExtremes(Date.UTC(2010, 0, 2), Date.UTC(2010, 0, 8), false);
          scope.chart.redraw();

        }
      }

      scope.$watch('data.timestamp', function() {
        //used for updating entire chart; including x axis
        // console.log('directive: update chart');
        // console.log(scope.data.array);
        if (scope.data !== undefined) {
          updateChart(scope.data.array);
        }
      });

    }
  };
});
