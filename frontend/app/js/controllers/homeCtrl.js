angular.module('app').controller('homeCtrl', ['$scope', '$log', '$timeout', function($scope, $log, $timeout) {

  var N_SLIDES = 2;
  $scope.timer = [];
  $scope.active = 0;
  $scope.slides = [{
    id: 0,
    image: 'img/1.jpg',
    text: ''
  }, {
    id: 1,
    image: 'img/2.jpg',
    text: ''
  }, {
    id: 2,
    image: 'img/3.jpg',
    text: ''
  }];

  $scope.myInterval = 5000;


  $scope.currentIndex = 0;

  $scope.setCurrentSlideIndex = function(index) {
    $scope.currentIndex = index;
  };

  $scope.isCurrentSlideIndex = function(index) {
    return $scope.currentIndex === index;
  };

  $scope.prevSlide = function() {
    $scope.currentIndex = ($scope.currentIndex < $scope.slides.length - 1) ? ++$scope.currentIndex : 0;
  };

  $scope.nextSlide = function() {
    $scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.slides.length - 1;
  };

  $scope.init = function() {

  };

  var slideShow = function() {
    $scope.timer[0] = $timeout(function() {
      $scope.nextSlide();
      slideShow();
    }, 3000);
  };

  var clearTimers = function() {
    for (var i = 0; i < $scope.timer.length; i++) {
      if ($scope.timer[i] !== undefined) {
        console.log("clear timer " + i.toString());
        $timeout.cancel($scope.timer[i]);
      }
    }
  };

  $scope.$on("$destroy", function() {
    clearTimers();
  });


}]);
