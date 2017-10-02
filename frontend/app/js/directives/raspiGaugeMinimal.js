angular.module('app').directive('raspiGaugeMinimal', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/directives/raspi-gauge-minimal.html',
    scope: {
      caption: '@',
      value: '=',
      range: '=?',
      size: '=?',
      datalabels: '=?',
      color: '@'
    },
    link: function(scope) {

      function init() {
        scope.isLoaded = false;
        if (!scope.range) {
          scope.range = [0, 100];
        }
        if (scope.value === undefined) {
          scope.value = 0;
        }
        if (!scope.size) {
          scope.size = {};
          //scope.size.width = undefined;
          scope.size.height = 200;
        }
        if (!scope.caption) {
          scope.caption = '';
        }

        if (!scope.color) {
          scope.color = '#5C6BC0';
        }

        scope.labelX = 40;
        scope.labelY = 0;
        scope.center = ['50%', '85%'];
        scope.paneSize = '150%';
        scope.reversed = false;


        scope.chartConfig = {
          options: {
            chart: {
              type: 'gauge',
              animation: {
                duration: 100,
                easing: "swing"
              }
            },
            pane: {
              center: ['50%', '85%'],
              size: '150%',
              startAngle: -90,
              endAngle: 90,
              background: {
                backgroundColor: scope.color,
                innerRadius: '60%',
                outerRadius: '100%',
                shape: 'arc'
              }
            }
          },
          //   pane: {
          //     center: scope.center,
          //     size: scope.paneSize,
          //     startAngle: scope.angle.start,
          //     endAngle: scope.angle.end,
          //     background: {
          //       backgroundColor: '#263238',
          //       innerRadius: '60%',
          //       outerRadius: '100%',
          //       shape: 'arc'
          //     }
          //   }
          // },
          series: [{
            name: scope.caption,
            data: [scope.value],
            dial: {
              radius: '70%',
              backgroundColor: 'navy',
              borderColor: 'silver',
              borderWidth: 0,
              baseWidth: 5,
              topWidth: 1,
              baseLength: '95%', // of radius
              rearLength: '20%'
            },


            dataLabels: {
              enabled: scope.datalabels,
              formatter: function() {
                var kmh = this.y;
                return '<span>' + kmh + '</span><br/>';
              },
              style: {
                // color: 'navy',
                fontStyle: 'italic',
                fontWeight: 'normal',
                fontSize: '24px',
                lineHeight: '10px'
              },
              y: scope.labelX,
              x: scope.labelY,
              backgroundColor: {
                linearGradient: {
                  x1: 0,
                  y1: 0,
                  x2: 0,
                  y2: 1
                },
                stops: [
                  [0, '#DDD'],
                  [1, '#FFF']
                ]
              }
            },
            animation: {
              duration: 100,
              easing: "easeOutBounce"
            }
          }],
          title: {
            text: '',
            y: 100
          },

          xAxis: {

          },

          yAxis: {
            currentMin: scope.range[0],
            currentMax: scope.range[1],
            reversed: scope.reversed,

            plotBands: [
              //   {
              //   from: scope.range[0],
              //   to: 0,
              //   color: '#FFF3E0'
              // }, {
              //   from: 0,
              //   to: scope.range[1],
              //   color: '#FF9800'
              // }
              {
                from: scope.range[0],
                to: scope.range[1],
                color: scope.color
              }
            ],
            labels: {
              style: {
                //fontFamily: 'monospace',
                fontStyle: 'italic',
                fontWeight: 'normal',
                fontSize: '18px',
                lineHeight: '10px',
                color: 'navy'
              },
              y: 0,
              x: 0
            },

            lineWidth: 5,
            //tickInterval: 50,
            tickInterval: Math.floor((scope.range[1] - scope.range[0]) / 2),
            // tickPixelInterval: 400,
            tickWidth: 5,

            loading: false,
            useHighStocks: false
          },
          size: {
            width: scope.size.width,
            height: scope.size.height
          }

        };

        scope.isLoaded = true;
      }

      function updateChart(val) {
        scope.chartConfig.series[0].data = [val];
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
