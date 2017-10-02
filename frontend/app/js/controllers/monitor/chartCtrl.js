angular.module('app').controller('monitorChartCtrl', ['SharedProperties', 'GlobalFcnService', '$scope', '$timeout',
  '$log', '$http', '$mdSidenav',
  function(SharedProperties, GlobalFcnService, $scope, $timeout, $log, $http, $mdSidenav) {
    $scope.nodes = {};
    $scope.startDate = new Date();
    $scope.endDate = new Date();
    var zoomLevel = 10;
    $scope.chupdate = false;
    $scope.channels = [1, 2];
    $scope.weatherRequests = [{
      'id': 0,
      'name': 'forecast',
      'url': 'http://api.openweathermap.org/api/2.5/forecast/daily'
    }, {
      'id': 1,
      'name': 'current',
      'url': 'http://api.openweathermap.org/api/2.5/weather'
    }];

    $scope.locations = [{
      'name': 'Bucharest'
    }];


    $scope.chartConfig = {
      options: {
        chart: {
          type: 'line'
        }
      },
      series: [{
        data: [10, 15, 12, 8, 7]
      }],
      title: {
        text: 'Hello'
      },

      loading: false
    };


    $scope.getWeatherData = function() {
      $scope.weatherRequest.url = $scope.selectedWeatherReqType.url;
      $scope.weatherRequest.params.q = $scope.selectedLocation.name;
      $scope.hasWeatherData = false;
      $http($scope.weatherRequest)
        .then(function(response) {
          $scope.weatherData = response.data;
          console.log($scope.weatherData);
          $scope.hasWeatherData = true;
        }).
      catch(function(response) {
        $scope.hasWeatherData = true;
        // alert('error');
      });
    };

    $scope.series = [{
      'name': '1',
      'value': 0
    }];

    R_UNTIL_SELECTED = 0;
    R_UNTIL_MOST_RECENT = 1;
    R_LATEST_TIME = 2;
    R_LATEST_SAMPLE = 3;

    $scope.settings = {};
    $scope.requestSettings = {
      options: [{
        label: 'latest data (time)',
        value: R_LATEST_TIME
      }, {
        label: 'latest data (samples)',
        value: R_LATEST_SAMPLE
      }]
    };

    N_TRACES_TOTAL = 1;
    $scope.chart = [{
      ntraces: 1,
      options: {
        xAxisType: 'datetime',
        pointStart: Date.UTC(2010, 0, 1),
        pointInterval: 60 * 1000, // 1 min1
        range: [0, 1000],
        //maxThreshold: 280,
        yAxisTickInterval: 5,
        labels: ['sensor data']
      }
    }];

    $scope.timer = [];

    var chartInit = function(n) {
      $scope.dataArray = [];
      for (var j = 0; j < 50; j++) {
        $scope.dataArray[j] = {
          x: 0,
          y: 0
        };
      }
    };

    var chartUpdate = function(jsonObj) {
      console.log('chart update');
      $scope.dataArray = [];
      $scope.valueArray = [];
      var j;
      for (j = 0; j < jsonObj.length; j++) {
        $scope.dataArray[j] = {
          // x: jsonObj[j].Timestamp.getTime(),
          x: new Date(jsonObj[j].ts),
          y: jsonObj[j].value
        };
        $scope.valueArray[j] = jsonObj[j].value;
      }
      chartRefresh();
    };

    var chartRefresh = function() {
      var min, max;
      console.log('chart refresh');
      if ($scope.valueArray) {
        max = Math.max.apply(null, $scope.valueArray);
        min = Math.min.apply(null, $scope.valueArray);
        // auto range
        $scope.chart[0].options.range = [min - zoomLevel, max + zoomLevel];
      }
      $scope.chupdate = !$scope.chupdate;
    };

    $scope.autoUpdate = function() {
      if ($scope.settings.updateRate !== undefined) {
        $scope.timer[0] = $timeout(function() {
          $scope.userRequestData();
          $scope.autoUpdate();
        }, $scope.settings.updateRate * 1000);
      }
    };

    $scope.autoUpdateWeather = function() {
      $scope.timer[1] = $timeout(function() {
        $scope.getWeatherData();
        $scope.autoUpdateWeather();
      }, 3600 * 1000);
    };

    $scope.noAutoUpdate = function() {
      $scope.settings.autoUpdate = false;
      $timeout.cancel($scope.timer[0]);
      $timeout.cancel($scope.timer[1]);
    };

    $scope.resetAutoUpdate = function() {
      $timeout.cancel($scope.timer[0]);
      $timeout.cancel($scope.timer[1]);
      $scope.autoUpdate();
    };

    $scope.userRequestData = function() {
      var param;
      switch ($scope.settings.requestType) {
        case R_UNTIL_SELECTED:
          param = {
            'startDate': $scope.startDate,
            'endDate': $scope.endDate,
            'interval': {
              'h': $scope.settings.reqtime_h,
              'm': $scope.settings.reqtime_m,
              's': 0
            },
            'sensorId': $scope.settings.sensorId,
            'channelId': $scope.settings.channelId
          };
          getData('date1', param);
          break;
        case R_UNTIL_MOST_RECENT:
          param = {
            'startDate': $scope.startDate,
            'sensorId': $scope.settings.sensorId,
            'channelId': $scope.settings.channelId
          };
          getData('date2', param);
          break;
        case R_LATEST_SAMPLE:
          param = {
            'n': $scope.settings.lastNData,
            'sensorId': $scope.settings.sensorId,
            'channelId': $scope.settings.channelId
          };
          getData('nlast', param);
          break;
        case R_LATEST_TIME:
          param = {
            'h': $scope.settings.lastHData,
            'sensorId': $scope.settings.sensorId,
            'channelId': $scope.settings.channelId
          };
          getData('last', param);
          break;
        default:
          break;
      }
      if ($scope.settings.autoUpdate) {
        $scope.startDate = new Date();
        $scope.endDate = new Date();
      }
    };

    $scope.yzoom = function(zoomin) {
      if (zoomin === 0) {
        zoomLevel += 10;
      } else {
        if (zoomLevel >= 20) {
          zoomLevel -= 10;
        }
      }
      chartRefresh();
    };

    var getData = function(reqType, param1) {
      if (reqType === undefined || param1 === undefined) {
        return;
      }
      $scope.hasData = false;

      console.log('getData: ', reqType, param1);
      $http.get($scope.serverURL + '/api/database/sensors/' + reqType, {
        params: {
          param: param1
        }
      }).
      then(function(data) {
        var jsonObj = angular.fromJson(data.data);
        console.log(jsonObj);
        // console.log(jsonObj[0].ts);
        $scope.jsonObj = jsonObj;
        $scope.info = data.info;
        var i;

        if ($scope.jsonObj !== false) {
          $scope.hasData = true;

          $scope.displayData = false;
          // for (i = 0; i < jsonObj.length; i++) {
          //   $scope.jsonObj[i].ts = new Date(jsonObj[i].ts);
          // }

          var dt = new Date(jsonObj[0].ts);
          var startDate = Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds());

          dt = new Date(jsonObj[jsonObj.length - 1].ts);
          var endDate = Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds());

          var dataInterval = (endDate - startDate) / jsonObj.length;

          if (dataInterval < 0) {
            var aux = startDate;
            startDate = endDate;
            endDate = aux;
            dataInterval = -dataInterval;
          }

          for (i = 0; i < $scope.chart.length; i++) {
            $scope.chart[i].options.pointStart = startDate;
            $scope.chart[i].options.pointInterval = dataInterval;
          }

          chartUpdate(jsonObj);
          updateInfo();

          $timeout(function() {
            $scope.displayData = true;
          });

          console.log('dataset updated');
        }
      }).
      catch(function(data) {
        $scope.jsondata = 'error';
        $scope.hasData = true;
        //alert('error');
      });
    };



    var updateInfo = function() {
      console.log('update info');
      if ($scope.valueArray) {

        var series = $scope.valueArray;
        var avg = Math.floor(average(series));
        $scope.localData = {
          'last': series[series.length - 1],
          'max': Math.max.apply(null, series),
          'min': Math.min.apply(null, series),
          'avg': avg
        };
        $scope.chart[0].options.maxThreshold = avg;
      }
    };

    function average(v) {
      var avg = 0;
      for (var i = 0; i < v.length; i++) {
        avg += v[i];
      }
      return avg / v.length;
    }

    $scope.postSettings = function() {
      updateUserOptions();
      GlobalFcnService.postSettings($scope.settings);
    };


    $scope.init = function() {
      var props = SharedProperties.getProperty();
      $scope.selectedWeatherReqType = $scope.weatherRequests[1];
      $scope.selectedLocation = $scope.locations[0];
      $scope.serverURL = props.url;
      $scope.weatherRequest = {
        method: 'GET',
        url: $scope.selectedWeatherReqType.url,
        params: {
          q: $scope.selectedLocation.name,
          mode: 'json',
          units: 'metric',
          cnt: '7',
          appid: '13d3396479dc92a69c579d67bd4835cc'
        }
      };

      $scope.getNodes();
      GlobalFcnService.getSettings().then(function(response) {
        $scope.settings = response.data.userSettings.monitor;
        console.log("settings");
        console.log($scope.settings);
        $scope.weatherRequest.params.appid = $scope.settings.appid;
        $scope.chart[0].options.maxThreshold = $scope.settings.maxThreshold;
        $scope.chart[0].options.minThreshold = $scope.settings.minThreshold;
        $scope.timer[4] = $timeout(function() {
          $scope.userRequestData();
          if ($scope.settings.weatherData === true) {
            $scope.getWeatherData();
          }
          if ($scope.settings.autoUpdate) {
            $scope.autoUpdate();
            if ($scope.settings.weatherData === true) {
              $scope.autoUpdateWeather();
            }
          }
          $scope.initialized = true;
        }, 100);
      });
    };


    $scope.getNodes = function() {
      $scope.error = false;
      //  $scope.hasData = false;
      $http.get($scope.serverURL + '/api/database/nodes').
      then(function(data) {
        var jsonObj = angular.fromJson(data.data);
        $scope.nodes = jsonObj;
        $scope.selectedNode = $scope.nodes[0];
      }).
      catch(function(data) {
        $scope.jsondata = 'error';
        $scope.hasData = true;
        alert('error');
      });
    };

    var clearTimers = function() {
      for (var i = 0; i < $scope.timer.length; i++) {
        if ($scope.timer[i] !== undefined) {
          console.log("clear timer " + i.toString());
          $timeout.cancel($scope.timer[i]);
        }
      }
    };

    $scope.$on('$destroy', function(event) {
      console.log('clear timers');
      clearTimers();
    });


  }
]);
