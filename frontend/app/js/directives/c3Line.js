angular.module('app').directive('c3Line', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/directives/c3-line.html',
    scope: {
      data: '=',
      options: '=?',
      cid: '=?'
    },
    link: function(scope) {
      if (scope.options === undefined) {
        scope.options = {
          cid: 1,
          height: 300,
          xtype: 'default',
          type: "spline",
          ymin: undefined,
          ymax: undefined,
          fullDate: false,
          showPoint: false,
          yminspan: undefined
        };
      } else {
        if (scope.options.showPoint === undefined) {
          scope.options.showPoint = false;
        }
      }



      if (scope.cid !== undefined) {
        scope.options.cid = scope.cid;
      }

      var containerid = "container-" + scope.options.cid.toString();
      $("#container").prop('id', containerid);
      var chartid = "chart-" + scope.options.cid.toString();
      $("#chart").prop('id', chartid);
      var height = $("#" + containerid).height();
      var width = $("#" + containerid).width();

      var chartdata = {
        bindto: '#' + chartid,
        size: {
          height: scope.options.height,
          width: scope.options.width
        },
        transition: {
          duration: 0
        },
        data: {
          labels: false,

          // line
          // spline
          // step
          // area
          // area-spline
          // area-step
          // bar
          // scatter
          // pie
          // donut
          // gauge

          type: scope.options.type,
          x: 'x',
          //        xFormat: '%Y%m%d', // 'xFormat' can be used as custom format of 'x'
          columns: [
            ['x', '2013-01-01', '2013-01-02', '2013-01-03', '2013-01-04', '2013-01-05', '2013-01-06'],
            //            ['x', '20130101', '20130102', '20130103', '20130104', '20130105', '20130106'],
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 130, 340, 200, 500, 250, 350]
          ],
          rows: []
        },
        axis: {
          x: {
            tick: {
              // count: 5,
              // format: function(x) {
              //   return Math.floor(x);
              // }
              // culling: true,
              culling: {
                max: 4 // the number of tick texts will be adjusted to less than this value
              }
            }
          },
          y: {
            max: scope.options.ymax,
            min: scope.options.ymin,

            // tick: {
            //   count: 5,
            //   format: function(x) {
            //     return Math.floor(x);
            //   }
            // }
          }
        },
        point: {
          show: scope.options.showPoint
        },
        grid: {
          x: {
            show: false
          },
          y: {
            show: false
          }
        },
        legend: {
          show: true
        },
        tooltip: {
          show: true
        },
        zoom: {
          enabled: true
        },
        onresize: function() {
          console.log("resized");
          // chart.resize();

          // var size = {
          //   height: $('#parentContainer')[0].offsetHeight - 10
          // }
          // chart.resize(size);
          // var width = $('#' + containerid).width();
          // console.log(width);
          //
          // chart.resize({
          //   width: width
          // });
        }
      };


      if (scope.options.xtype === 'timeseries') {
        chartdata.axis.x.type = "timeseries";
        chartdata.axis.x.tick.format = '%H:%M:%S';
      }
      if (scope.options.format) {
        chartdata.axis.x.tick.format = scope.options.format;
        // chartdata.axis.x.tick.format = '%Y-%m-%d %H:%M:%S';
      } else {
        chartdata.axis.x.tick.format = '%H:%M:%S';
      }





      var chart = c3.generate(chartdata);

      function updateChart(data) {
        if (data.cutn) {
          chartdata.data.rows = data.rows.slice(0, data.cutn);
        } else {
          chartdata.data.rows = data.rows;
        }

        if (scope.options.yminspan !== undefined) {
          var datay = data.rows.map(function(obj) {
            return obj[1];
          });

          var min = Math.min.apply(null, datay),
            max = Math.max.apply(null, datay);

          console.log('min: ' + min + ', max: ' + max);
          scope.options.ymin = min - scope.options.yminspan;
          scope.options.ymax = max + scope.options.yminspan;
          // chartdata.axis.y.min = scope.options.ymin;
          // chartdata.axis.y.max = scope.options.ymax;

          chart.axis.min({
            y: scope.options.ymin
          });
          chart.axis.max({
            y: scope.options.ymax
          });

        }

        chartdata.data.rows.unshift(data.columns);
        // if (data.refresh) {
        //   chart.unload();
        // }
        chart.load({
          rows: chartdata.data.rows
        });
      }

      scope.$watch('data.timestamp', function() {
        if (chartdata !== undefined) {
          updateChart(scope.data);
        }
      });

    }
  };
});
