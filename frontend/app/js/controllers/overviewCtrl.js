angular.module('app').controller('overviewCtrl', ['$scope', 'esriLoader', 'socket', '$timeout', '$http',
  function($scope, esriLoader, socket, $timeout, $http) {
    var numericDisplay;
    $scope.timer = [];
    $scope.viewMode = 'map';
    $scope.selected = {
      reqtype: 'sensors',
      type: 0,
      id: 0,
      n: 100
    };



    // MAP
    console.log("ctrl");
    $scope.mapViewOptions = {
      zoom: 15,
      center: [26.036, 44.492]
    };

    var startPollingWs_socketio = function() {
      $scope.timer[1] = $timeout(function() {
        // socket.emit('get_data', {
        //   message: ''
        // }, function(data) {
        //   startPollingWs_socketio();
        // });

        socket.emit('get_data', $scope.selected, function(data) {
          startPollingWs_socketio();
        });
      }, 0);
    };

    var initSocket = function() {
      socket.connect();
      socket.on('get_data', function(data) {
        $scope.jsondata = angular.fromJson(data);

        if ($scope.jsondata.value2 !== undefined) {
          // (Number($scope.jsondata.value).toFixed(2)
          numericDisplay.setValue($scope.jsondata.value2.toString());
        }
      });
      startPollingWs_socketio();
    };

    $scope.init = function() {

      esriLoader.require([
          'esri/Map',
          "esri/views/MapView",
          'esri/layers/FeatureLayer',
          'esri/PopupTemplate',
          'esri/widgets/Search',
          "esri/widgets/Legend",
          "esri/widgets/LayerList",
          "esri/widgets/ScaleBar",

          "esri/symbols/SimpleMarkerSymbol",
          "esri/symbols/SimpleLineSymbol",
          "esri/Graphic",
          "esri/geometry/Point",

          // "esri/toolbars/draw"
        ], function(
          Map,
          MapView,
          FeatureLayer,
          PopupTemplate,
          Search,
          Legend,
          LayerList,
          ScaleBar,

          SimpleMarkerSymbol,
          SimpleLineSymbol,
          Graphic,
          Point) {
          $scope.map = new Map({
            basemap: 'gray'
          });

          $scope.onViewCreated = function(view) {

            $scope.mapView = view;


            /********************
             * Add feature layers
             ********************/

            var featureLayer = new FeatureLayer({
              url: "https://upb1.maps.arcgis.com/home/item.html?id=479fdc9aa2b34bc78ec67ef15fa1e2f2",
              outFields: ['*'],
            });
            var featureLayer_Nodes = new FeatureLayer({
              // url: "https://services7.arcgis.com/Fb5UQU5M9iS1MBEr/arcgis/rest/services/wn_test2/FeatureServer",
              //  url: "https://services7.arcgis.com/Fb5UQU5M9iS1MBEr/arcgis/rest/services/wn_test2/FeatureServer/1?token=8QCb0Jfvz2fnc1tDUika-2BKHyAIFF_CVYixOv_eyVIxyCJsTxbv3HfTJ3GhpzMj55QKkFJAwq_w6O74wtEx31kV5iJLjEiW2gWSVJueMpV7FU_gfUhq4GFgF7zpS4Rbb_LQ838PCSzDwBcmneclQPxj3_5kM5iTbFt8bBuwLstsbnSE6p6T4C3ZixYofbaRKpZ5l4_gVufvzthjgrh6r5vW8rEL2rl-Pf9QuO2ISVg.",
              url: "http://cyberwater.hpc.pub.ro:6080/arcgis/rest/services/alex.predescu/retea_test_laborator_v2/MapServer/3",
              outFields: ['*'],
              // popupTemplate: new PopupTemplate({
              //   title: 'Node {Node_ID}',
              //   content: 'Network node of type {Type}',
              //   actions: [{
              //     id: "click-node",
              //     class: "esri-icon-dashboard",
              //     title: "Select node"
              //   }]
              // })
            });
            var featureLayer_Valves = new FeatureLayer({
              // url: "https://services7.arcgis.com/Fb5UQU5M9iS1MBEr/arcgis/rest/services/wn_test2/FeatureServer",
              //  url: "https://services7.arcgis.com/Fb5UQU5M9iS1MBEr/arcgis/rest/services/wn_test2/FeatureServer/1?token=8QCb0Jfvz2fnc1tDUika-2BKHyAIFF_CVYixOv_eyVIxyCJsTxbv3HfTJ3GhpzMj55QKkFJAwq_w6O74wtEx31kV5iJLjEiW2gWSVJueMpV7FU_gfUhq4GFgF7zpS4Rbb_LQ838PCSzDwBcmneclQPxj3_5kM5iTbFt8bBuwLstsbnSE6p6T4C3ZixYofbaRKpZ5l4_gVufvzthjgrh6r5vW8rEL2rl-Pf9QuO2ISVg.",
              url: "http://cyberwater.hpc.pub.ro:6080/arcgis/rest/services/alex.predescu/retea_test_laborator_v2/MapServer/0",
              outFields: ['*'],
              // popupTemplate: new PopupTemplate({
              //   title: 'Node {Node_ID}',
              //   content: 'Network node of type {Type}',
              //   actions: [{
              //     id: "click-node",
              //     class: "esri-icon-dashboard",
              //     title: "Select node"
              //   }]
              // })
            });

            var featureLayer_DrainPipes = new FeatureLayer({
              // url: "https://services7.arcgis.com/Fb5UQU5M9iS1MBEr/arcgis/rest/services/wn_test2/FeatureServer",
              //  url: "https://services7.arcgis.com/Fb5UQU5M9iS1MBEr/arcgis/rest/services/wn_test2/FeatureServer/1?token=8QCb0Jfvz2fnc1tDUika-2BKHyAIFF_CVYixOv_eyVIxyCJsTxbv3HfTJ3GhpzMj55QKkFJAwq_w6O74wtEx31kV5iJLjEiW2gWSVJueMpV7FU_gfUhq4GFgF7zpS4Rbb_LQ838PCSzDwBcmneclQPxj3_5kM5iTbFt8bBuwLstsbnSE6p6T4C3ZixYofbaRKpZ5l4_gVufvzthjgrh6r5vW8rEL2rl-Pf9QuO2ISVg.",
              url: "http://cyberwater.hpc.pub.ro:6080/arcgis/rest/services/alex.predescu/retea_test_laborator_v2/MapServer/4",
              outFields: ['*'],
              // popupTemplate: new PopupTemplate({
              //   title: 'Node {Node_ID}',
              //   content: 'Network node of type {Type}',
              //   actions: [{
              //     id: "click-node",
              //     class: "esri-icon-dashboard",
              //     title: "Select node"
              //   }]
              // })
            });

            var featureLayer_Pipes = new FeatureLayer({
              // url: "https://services7.arcgis.com/Fb5UQU5M9iS1MBEr/arcgis/rest/services/wn_test2/FeatureServer/4?token=KSiMW7IaBHu7RjEPWpkObKUS6vN4_9-rs2tWcIaxUUpntG2ZaJ15JVaO-y1Wx8VN_wG9JJZGsuGoBgmzUfM1AVOiyi9TRkFztyNbqwiCUWtZLBT8Ynb8vheh3UbUYiwiYwtZ0CpCMXqlfDtP3Iwenyysl5CyUccZp0RLCXDcGpgmwsECUIMM9RtbYL19JfiPZycBnupdrag3mSepZTtjHBxAsp2B0-QZp-VcfHyBRDs.",
              url: "http://cyberwater.hpc.pub.ro:6080/arcgis/rest/services/alex.predescu/retea_test_laborator_v2/MapServer/5",
              outFields: ['*'],
              // popupTemplate: new PopupTemplate({
              //   title: 'Pipe {Pipe_ID}',
              //   content: [{
              //     type: "fields",
              //     fieldInfos: [{
              //       fieldName: "Pipe_ID",
              //       visible: true,
              //       label: "Pipe ID",
              //       format: {
              //         places: 0,
              //         digitSeparator: true
              //       }
              //     }]
              //   }, {
              //     type: "text",
              //     text: "Pipe from node {A_Node_ID} to node {B_Node_ID} with a diameter of {Diameter_mm} mm and the length of {Shape__Length} m"
              //   }],
              //   actions: [{
              //     id: "click-pipe",
              //     class: "esri-icon-dashboard",
              //     title: "Select pipe"
              //   }]
              // })
            });

            // and add a feature layer
            var featureLayer_Pressure_Sensors = new FeatureLayer({
              // url: "https://services7.arcgis.com/Fb5UQU5M9iS1MBEr/arcgis/rest/services/wn_test2/FeatureServer/2?token=KSiMW7IaBHu7RjEPWpkObKUS6vN4_9-rs2tWcIaxUUpntG2ZaJ15JVaO-y1Wx8VN_wG9JJZGsuGoBgmzUfM1AVOiyi9TRkFztyNbqwiCUWtZLBT8Ynb8vheh3UbUYiwiYwtZ0CpCMXqlfDtP3Iwenyysl5CyUccZp0RLCXDcGpgmwsECUIMM9RtbYL19JfiPZycBnupdrag3mSepZTtjHBxAsp2B0-QZp-VcfHyBRDs.",
              url: "http://cyberwater.hpc.pub.ro:6080/arcgis/rest/services/alex.predescu/retea_test_laborator_v2/MapServer/2",
              outFields: ['*'],
              // popupTemplate: new PopupTemplate({
              //   title: 'Pressure sensor {OBJECTID}',
              //   content: 'Pressure sensor from node {Node_ID} of type {Type}',
              //   actions: [{
              //     id: "click-pressure-sensor",
              //     class: "esri-icon-dashboard",
              //     title: "Select pressure sensor"
              //   }]
              // })
            });

            // console.log(featureLayer_Pressure_Sensors);

            var featureLayer_Flow_Sensors = new FeatureLayer({
              // url: "https://services7.arcgis.com/Fb5UQU5M9iS1MBEr/arcgis/rest/services/wn_test2/FeatureServer/3?token=5tqOFtg0zvg6HBBs7uSqdlcJYmxX2HJ4dhRffZhOXvpvoLcvY2l4j55EcKe2cM8Taj8gANRE8CuCsvoWPVSP--k2RnQ8Rd0BsKnU2JWJOI-_wXedwM2B8iXJk1c2IJhmbxsQTFcuYovwk4jZkx8KKf2k8W518uAMckTuFrWQJSSDZ_B0O2AsqD8mx5Rc9D6vws4YbkZSKlbAVUG-4ivI1mdksI9WHSqvIr6dESxb5Zw.",
              url: "http://cyberwater.hpc.pub.ro:6080/arcgis/rest/services/alex.predescu/retea_test_laborator_v2/MapServer/1",
              outFields: ['*'],
              // popupTemplate: new PopupTemplate({
              //   title: 'Flow sensor {OBJECTID}',
              //   content: 'Flow sensor from pipe {Pipe_ID} of type {Type}',
              //   actions: [{
              //     id: "click-flow-sensor",
              //     class: "esri-icon-dashboard",
              //     title: "Select flow sensor"
              //   }]
              // })
            });

            $scope.map.add(featureLayer_Pipes);
            $scope.map.add(featureLayer_Nodes);
            $scope.map.add(featureLayer_Valves);
            $scope.map.add(featureLayer_DrainPipes);
            $scope.map.add(featureLayer_Flow_Sensors);
            $scope.map.add(featureLayer_Pressure_Sensors);


            /********************
             * Add widgets
             ********************/
            var searchWidget = new Search({
              view: view
            });
            console.log("onViewCreated");
            // searchWidget.startup();

            // add the search widget to the top left corner of the view
            view.ui.add(searchWidget, {
              position: 'top-left',
              index: 0
            });

            var legend = new Legend({
              view: view,
              layerInfos: [{
                layer: featureLayer_Pipes,
                title: "Pipes"
              }, {
                layer: featureLayer_Nodes,
                title: "Nodes"
              }, {
                layer: featureLayer_Flow_Sensors,
                title: "Flow sensors"
              }, {
                layer: featureLayer_Pressure_Sensors,
                title: "Pressure sensors"
              }]
            });


            // Add widget to the bottom right corner of the view
            view.ui.add(legend, "bottom-right");


            // LAYER LIST

            // var layerList = new LayerList({
            //   view: view
            // });
            //
            // // Add widget to the top right corner of the view
            // view.ui.add(layerList, "top-right");



            // SCALE BAR

            // var scaleBar = new ScaleBar({
            //   view: view,
            //   unit: "km"
            // });
            //
            // // Add the widget to the bottom left corner of the view
            // view.ui.add(scaleBar, {
            //   position: "top-left"
            // });

            var chartRefresh = function() {
              var min, max;
              console.log('chart refresh');
              if ($scope.valueArray) {
                max = Math.max.apply(null, $scope.valueArray);
                min = Math.min.apply(null, $scope.valueArray);
                // auto range
                $scope.chart[0].options.range = [min - 10, max + 10];
              }
              $scope.chartData = {
                array: [$scope.dataArray],
                timestamp: new Date()
              };
            };

            var chartUpdate = function(jsonObj) {
              console.log('chart update');
              $scope.dataArray = [];
              $scope.valueArray = [];
              var j;
              for (j = 0; j < jsonObj.length; j++) {
                $scope.dataArray[j] = {
                  // x: jsonObj[j].Timestamp.getTime(),
                  x: new Date(jsonObj[j].Timestamp),
                  // x: jsonObj[j].Timestamp,
                  y: jsonObj[j].Value
                };
                $scope.valueArray[j] = jsonObj[j].Value;
              }
              chartRefresh();
            };

            var getData = function(params1) {
              $scope.hasData = false;
              console.log('getData: ', params1);
              $http.get('/api/database/sensors', {
                params: {
                  param: params1
                }
              }).
              then(function(data) {
                var i;
                var jsonObj = angular.fromJson(data.data);
                $scope.jsonObj = jsonObj;

                if ($scope.jsonObj === false) {
                  return;
                }
                if ($scope.jsonObj.result === 1) {
                  return;
                }

                $scope.hasData = true;
                console.log($scope.jsonObj[0]);
                $scope.displayData = false;
                if (jsonObj[0] !== undefined) {
                  var startDate = jsonObj[0].Timestamp;
                  var endDate = jsonObj[jsonObj.length - 1].Timestamp;
                  var dataInterval = (endDate - startDate) / jsonObj.length;

                  for (i = 0; i < $scope.chart.length; i++) {
                    $scope.chart[i].options.pointStart = startDate;
                    $scope.chart[i].options.pointInterval = dataInterval;
                  }
                  chartUpdate(jsonObj);
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
            /********************
             * Add watch
             ********************/
            view.watch('center,scale,zoom,rotation', function() {
              // console.log($scope.mapView.center);
              // console.log("mapView changed");
              $scope.$applyAsync('mapView');
            });

            // destroy the search widget when angular scope is also being destroyed
            $scope.$on('$destroy', function() {
              searchWidget.destroy();
            });

            var popup = view.popup;

            // The popup will automatically be dockEnabled when made visible
            popup.dockEnabled = true;




            popup.viewModel.on("trigger-action", function(event) {
              var attr;
              $scope.$apply(function() {
                if (event.action.id === "click-pipe") {
                  // console.log("action", event);
                  // console.log(event.detail.widget.selectedFeature);
                  // console.log(event.detail.widget.selectedFeature.popupTemplate.title);
                  console.log(event.detail.widget.selectedFeature.attributes);

                }
                if (event.action.id === "click-node") {
                  console.log(event.detail.widget.selectedFeature.attributes);
                }
                if (event.action.id === "click-pressure-sensor") {
                  attr = event.detail.widget.selectedFeature.attributes;
                  console.log(attr);
                  $scope.selected.type = "pressure";
                  $scope.selected.id = attr.OBJECTID;
                  getData($scope.selected);
                }
                if (event.action.id === "click-flow-sensor") {
                  attr = event.detail.widget.selectedFeature.attributes;
                  console.log(attr);
                  $scope.selected.type = "flow";
                  $scope.selected.id = attr.OBJECTID;
                  getData($scope.selected);
                }
              });
            });

            var chartInit = function(n) {
              $scope.dataArray = [];
              for (var j = 0; j < 50; j++) {
                $scope.dataArray[j] = {
                  x: 0,
                  y: 0
                };
              }
            };

            var pollData = function() {
              $scope.timer[2] = $timeout(function() {
                getData($scope.selected);
                pollData();
              }, 5000);
            };

            function getGraphics(response) {
              // the topmost graphic from the click location
              // and display select attribute values from the
              // graphic to the user
              var graphic = response.results[0].graphic;
              var attr = graphic.attributes;
              console.log(graphic);

              $scope.$apply(function() {
                if (attr.Type === 2) {
                  $scope.selected.type = "flow";
                }

                if (attr.Type === 1) {
                  $scope.selected.type = "pressure";
                }

                $scope.selected.id = attr.OBJECTID;
                getData($scope.selected);
              });
            }

            // view.on("click", function(evt) {
            //   var screenPoint = {
            //     x: evt.x,
            //     y: evt.y
            //   };
            //   // the hitTest() checks to see if any graphics in the view
            //   // intersect the given screen x, y coordinates
            //   view.hitTest(screenPoint)
            //     .then(getGraphics);
            // });



            // markerSymbol is used for point and multipoint, see http://raphaeljs.com/icons/#talkq for more examples

            // Create a symbol for drawing the point
            var markerSymbol = new SimpleMarkerSymbol({
              color: [226, 119, 40],
              outline: { // autocasts as new SimpleLineSymbol()
                color: [255, 255, 255],
                width: 2
              }
            });

            var pointGraphic_1;

            view.on("click", function(event) {
              view.hitTest(event.screenPoint).then(function(response) {
                var graphics = response.results;
                graphics.forEach(function(graphic) {
                  console.log(graphic);
                });

                var graphic = graphics[0].graphic;
                var attr = graphic.attributes;
                console.log('selected: ', graphic);

                // highlight selection
                // figure out which symbol to use
                var symbol;
                if (graphic.geometry.type === "point" || graphic.geometry.type === "multipoint") {
                  symbol = markerSymbol;
                } else if (graphic.geometry.type === "line" || graphic.geometry.type === "polyline") {
                  // symbol = lineSymbol;
                } else {
                  //symbol = fillSymbol;
                  // symbol = markerSymbol;
                }

                console.log('new symbol: ', symbol);

                // Create a graphic and add the geometry and symbol to it
                var pointGraphic = new Graphic({
                  geometry: graphic.geometry,
                  symbol: markerSymbol
                });

                console.log('new point: ', pointGraphic);
                if (pointGraphic_1 !== undefined) {
                  view.graphics.remove(pointGraphic_1);
                }
                if (symbol !== undefined) {
                  console.log("highlight");
                  view.graphics.add(pointGraphic);
                  pointGraphic_1 = pointGraphic;

                }


                $scope.$apply(function() {
                  if (attr.Type === 2) {
                    $scope.selected.type = 2;
                  }

                  if (attr.Type === 1) {
                    $scope.selected.type = 1;
                  }

                  $scope.selected.id = attr.OBJECTID;
                  $scope.selected.sensorId = attr.Sensor_ID;
                  getData($scope.selected);
                });

              });
            });




            // featureLayer_Pipes.on("click", function(event) {
            //   console.log(event.mapPoint);
            // });
            $scope.mapLoaded = true;
            pollData();
          };
        }

      );
      //end esri loader setup

      chartInit();


      $scope.timer[0] = $timeout(function() {
        initSocket();
      }, 1000);


      // http://www.3quarks.com/en/SegmentDisplay/
      numericDisplay = new SegmentDisplay("numericDisplay");
      numericDisplay.pattern = "###";
      numericDisplay.displayAngle = 6;
      numericDisplay.digitHeight = 20;
      numericDisplay.digitWidth = 14;
      numericDisplay.digitDistance = 2.5;
      numericDisplay.segmentWidth = 2;
      numericDisplay.segmentDistance = 0.3;
      numericDisplay.segmentCount = 7;
      numericDisplay.cornerType = 1;
      numericDisplay.colorOn = "#090909";
      numericDisplay.colorOff = "#ffffff";
      numericDisplay.draw();

      numericDisplay.setValue("0");

    };

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

    var clearTimers = function() {
      for (var i = 0; i < $scope.timer.length; i++) {
        $timeout.cancel($scope.timer[i]);
      }
    };

    $scope.$on("$destroy", function() {
      clearTimers();
      console.log('disconnect');
      socket.emit('disconnect_request', '');
    });
  }
]);
