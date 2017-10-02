angular.module('app').directive('slider', function() {
    return {
        restrict:'E',
        scope: {
          ngModel: '=',
          onChanged: '&'
        },
        replace: true,
        template:'<div></div>',
        require: 'ngModel',
        link:function(scope,element,attrs){
           //watch the ngModel to set slider when val in ngModel var changes
           scope.$watch('ngModel', function(newVal, oldVal){
             //check when ngModel is not initialized
              if (newVal !== undefined){
               element.slider("value", parseInt(newVal,10));
             }
           });
           //create jQuery UI Slider
           element.slider({
              min: parseInt(attrs.min,10),
              max: parseInt(attrs.max, 10),
              value: scope.ngModel,
              step: parseInt(attrs.step, 10)
            });

            //bind the slide function to update the ngModel
            element.bind( "slide",function( event, ui ) {
              scope.ngModel = ui.value;
              scope.$apply();
            });

            //execute onChanged function when slider value is changed
            //(not executed during dragging the slider)
            if ('onChanged' in attrs){
              element.bind( "slidechange", function(event, ui){
                  scope.onChanged()(ui.value);
              });
            }
        }
    };
});
