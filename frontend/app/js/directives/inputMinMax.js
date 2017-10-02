function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

angular.module('app').directive('ngMin', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      function validate() {
        if (element &&
          element[0] &&
          element[0].localName === 'input' &&
          isNumber(attrs.ngMin) &&
          isNumber(element[0].value) &&
          parseFloat(element[0].value) < parseFloat(attrs.ngMin)) {
          if (isNumber(attrs.ngMax)) {
            element[0].value = parseFloat(attrs.ngMax);
            if (attrs.hasOwnProperty("ngModel")) {
              $parse(attrs.ngModel).assign(scope, parseFloat(attrs.ngMax));
            }
          } else {
            element[0].value = parseFloat(attrs.ngMin);
            if (attrs.hasOwnProperty("ngModel")) {
              $parse(attrs.ngModel).assign(scope, parseFloat(attrs.ngMin));
            }
          }
        }
      }
      scope.$watch(function() {
        return attrs.ngMin + "-" + element[0].value;
      }, function(newVal, oldVal) {
        if (newVal !== oldVal) {
          validate();
        }
      });
      validate();
    }
  };
});
angular.module('app').directive('ngMax', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      function validate() {
        if (element &&
          element[0] &&
          element[0].localName === 'input' &&
          isNumber(attrs.ngMax) &&
          isNumber(element[0].value) &&
          parseFloat(element[0].value) > parseFloat(attrs.ngMax)) {
          if (isNumber(attrs.ngMin)) {
            element[0].value = parseFloat(attrs.ngMin);
            if (attrs.hasOwnProperty("ngModel")) {
              $parse(attrs.ngModel).assign(scope, parseFloat(attrs.ngMin));
            }
          } else {
            element[0].value = parseFloat(attrs.ngMax);
            if (attrs.hasOwnProperty("ngModel")) {
              $parse(attrs.ngModel).assign(scope, parseFloat(attrs.ngMax));
            }
          }
        }
      }
      scope.$watch(function() {
        return attrs.ngMax + "-" + element[0].value;
      }, function(newVal, oldVal) {
        if (newVal !== oldVal) {
          validate();
        }
      });
      validate();
    }
  };
});
