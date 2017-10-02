angular.module('app').directive('zoomButtons', function zoomButtons() {
  return {
    // element only
    restrict: 'E',

    // isolate scope
    scope: {
      view: '=', // required: a MapView or SceneView instance
      viewUiPosition: '&' // optional: the position specification for the view ui
    },
    // templateUrl: 'templates/directives/raspi-container.html',
    template: [
      '<div class="zoom-btns">',
      '  <div class="button circle raised"',
      '    ng-class="{\'disable\': !zoomButtonsCtrl.zoomVM.canZoomIn}"',
      '    ng-click="zoomButtonsCtrl.zoomIn()">',
      '    <i class="material-icons">add</i>',
      '  </div>',
      '  <div class="button circle raised"',
      '    ng-class="{\'disable\': !zoomButtonsCtrl.zoomVM.canZoomOut}"',
      '    ng-click="zoomButtonsCtrl.zoomOut()">',
      '    <i class="material-icons">remove</i>',
      '  </div>',
      '</div>'
    ].join(''),

    controllerAs: 'zoomButtonsCtrl',

    bindToController: true,

    controller: function zoomButtonsController($element, $scope, esriLoader) {
      var self = this;

      // get reference to:
      //  - the directive's element
      //  - the optional view ui position
      var element = $element.children()[0];
      this.uiPosition = this.viewUiPosition();

      this.setView = function(view) {
        // the view binding has been changed
        // (see the directive's link method)
        if (!view) {
          return;
        }

        // load and establish the Esri ZoomViewModel
        esriLoader.require([
          'esri/widgets/Zoom/ZoomViewModel'
        ], function(ZoomVM) {
          self.zoomVM = new ZoomVM({
            view: view
          });

          if (self.uiPosition) {
            view.ui.add(element, self.uiPosition);
          }

          view.watch('zoom', self.onZoomChange);
        });
      };

      this.onZoomChange = function() {
        // this is outside of the angular digest cycle;
        // apply scope to update the bindings for ng-class in the template
        $scope.$apply();
      };

      // an ng-click in the template is bound to this method
      this.zoomIn = function() {
        if (this.zoomVM.canZoomIn) {
          this.zoomVM.zoomIn();
        }
      };

      // an ng-click in the template is bound to this method
      this.zoomOut = function() {
        if (this.zoomVM.canZoomOut) {
          this.zoomVM.zoomOut();
        }
      };
    },

    link: function zoomButtonsLink(scope, element, attrs, controller) {
      // the directive relies on a MapView or SceneView instance;
      // watch for the change to the view binding in the ExampleController
      scope.$watch('zoomButtonsCtrl.view', function(newVal) {
        controller.setView(newVal);
      });
    }
  };
});
