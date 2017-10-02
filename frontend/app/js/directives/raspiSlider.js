angular.module('app')
  .directive('raspiSlider', function() {
    return {
      restrict: 'E',
      //templateUrl: 'static/templates/directives/raspi-slider.html',
      scope: {
        value: '=',
        caption: '@',
        config: '='
      },
      controller: function($scope, $element, $attrs) {
        $scope.onSlide = function(e, ui) {
          $scope.$apply(function() {
            $scope.value = ui.value;
          });
          // add to angular digest cycle
          $scope.$digest();
        };
      },
      link: function(scope, el, attrs) {
        var canUpdate = false;
        var init = function() {
          if (scope.config === undefined) {
            scope.config = {
              min: 0,
              max: 100
            };
          }

        };
        init();
        var options = {
          orientation: "vertical",
          range: "min",
          min: scope.config.min,
          max: scope.config.max,
          value: scope.value,
          slide: scope.onSlide
        };
        scope.$watch('value', function() {
          if (canUpdate) {
            $(el).slider('value', scope.value);
          }
        });

        // set up slider on load
        angular.element(document).ready(function() {
          //console.log(scope.value);
          scope.$slider = $(el).slider(options);
          canUpdate = true;

        });
      }
    };
  });
