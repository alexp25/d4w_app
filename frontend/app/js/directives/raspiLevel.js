angular.module('app').directive('raspiLevel', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/directives/raspi-level.html',
    scope: {
      caption: '@',
      value: '=',
      range: '=?',
      size: '=?',
      color: '@'

    },
    link: function(scope) {
      scope.isLoaded = false;

      function init() {

        //console.log('init');
        if (!scope.range) {
          scope.range = [0, 100];
        }
        if (scope.value === undefined) {
          scope.value = 0;
        }
        if (!scope.size) {
          scope.size = {};
          scope.size.width = undefined;
          scope.size.height = 200;
        }
        if (!scope.caption) {
          scope.caption = 'graph1';
        }
        if (!scope.color) {
          // scope.color = 'blue';
          scope.color = '#90CAF9';
        }
        scope.chartConfig = {
          options: {
            //This is the Main Highcharts chart config. Any Highchart options are valid here.
            //will be overriden by values specified below.
            chart: {
              type: 'column',
              animation: {
                duration: 200,
                easing: "swing"
              },
              // style: {
              //   fontFamily: 'monospace',
              //   color: scope.color,
              //   fontColor: scope.color
              // }
              /*,  backgroundColor: {
                linearGradient: {
                  x1: 0,
                  x2: 0,
                  y1: 0,
                  y2: 1
                },
                stops: [
                  [0, '#003399'],
                  [1, '#3366AA']
                ]
              }*/

            },
            tooltip: {
              style: {
                padding: 10,
                fontWeight: 'bold'
              }
            }
          },
          //The below properties are watched separately for changes.
          series: [{
            name: scope.caption,
            data: [scope.value],
            animation: {
              duration: 100,
              easing: "easeOutBounce"
            },
            color: scope.color
          }],
          //Title configuration (optional)
          title: {
            text: ''
          },
          //Boolean to control showng loading status on chart (optional)
          //Could be a string if you want to show specific loading text.
          loading: false,
          //Configuration for the xAxis (optional). Currently only one x axis can be dynamically controlled.
          //properties currentMin and currentMax provied 2-way binding to the chart's maximimum and minimum
          xAxis: {
            title: {
              text: ''
            },
            labels: {
              style: {
                //fontFamily: 'monospace',
                color: 'black'
              }
            }
          },
          yAxis: {
            min: scope.range[0],
            max: scope.range[1],
            labels: {
              style: {
                //fontFamily: 'monospace',
                color: 'black'
              }
            },
            title: {
              text: '',
              // style: {
              //   fontFamily: 'monospace',
              //   color: scope.color
              // }
            }
          },
          //Whether to use HighStocks instead of HighCharts (optional). Defaults to false.
          useHighStocks: false,
          //size (optional) if left out the chart will default to size of the div or something sensible.
          size: {
            width: scope.size.width,
            height: scope.size.height
          }
        };
        //scope.chartConfig.title.text = scope.caption;
        scope.isLoaded = true;
      }

      function updateChart(val) {
        scope.chartConfig.series[0].data[0] = [val];
        //scope.chartConfig.title.text = scope.caption;
      }

      scope.$watch('value', function(newValue, oldValue) {
        if (newValue !== oldValue) {
          updateChart(newValue);
        }
      });
      init();
    }
  };
});
