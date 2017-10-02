angular.module('app')
  .directive('mjpeg', ['$window', '$timeout', function($window, $timeout) {
    return {
      restrict: 'E',
      replace: true,
      template: '<span></span>',
      scope: {
        'url': '=',
        'maxheight': '=',
        'maxwidth': '='
      },
      link: function(scope, element, attrs) {

        scope.getWindowDimensions = function() {
          return {
            'h': $window.outerHeight,
            'w': $window.innerWidth
          };
        };
        scope.$watch(scope.getWindowDimensions, function(newValue, oldValue) {
          scope.windowHeight = newValue.h;
          scope.windowWidth = newValue.w;

          //console.log('resize mjpeg ', scope.windowWidth, scope.windowHeight);
          scope.style = function() {
            return {
              'height': (newValue.h - 100) + 'px',
              'width': (newValue.w - 100) + 'px'
            };
          };

        }, true);

        /*w.bind('resize', function () {
            scope.$apply();
        });*/

        scope.$watch('url', function(newVal, oldVal) {
          if (newVal) {
            console.log('new img url');
            //  console.log(element);
            //console.log(scope.maxheight);
            createNewIframe(newVal);
          } else {
            element.html('<span></span>');
          }
        }, true);

        var createNewIframe = function(newVal) {
          var iframe = document.createElement('iframe');
          iframe.setAttribute('width', '100%');
          iframe.setAttribute('frameborder', '0');
          iframe.setAttribute('scrolling', 'no');
          iframe.setAttribute('id', 'iframe1');


          iframe.setAttribute('allowFullScreen', 'true'); //
          element.replaceWith(iframe);

          if (scope.maxwidth===undefined || scope.maxwidth===0) {
            scope.maxwidth = '100%';
            //scope.maxwidth = scope.style().width + "px";
            //console.log('new width: ', scope.maxwidth);
          } else {
            scope.maxwidth = scope.maxwidth + "px";
          }

          /*  var iframeHtml =
            '<html><head><base target="_parent" /><style type="text/css">html, body { margin: 0; padding: 0; height: 100%; width: 100%; }</style><script> function resizeParent() { var ifs = window.top.document.getElementsByTagName("iframe"); for (var i = 0, len = ifs.length; i < len; i++) { var f = ifs[i]; var fDoc = f.contentDocument || f.contentWindow.document; if (fDoc === document) { f.height = 0; f.height = document.body.scrollHeight; } } }</script></head><body onresize="resizeParent()"><img src="' +
            newVal +
            '" style="width: 100%; height: auto" onload="resizeParent()" /></body></html>';
*/
          /*jshint multistr: true */
          var iframeHtml =
            '<html><head><base target="_parent" />\
            <style type="text/css">html, body { margin: 0; padding: 0; height: 100%; width: 100%; }</style>\
            <script>\
                function resizeParent() { var ifs = window.top.document.getElementsByTagName("iframe"); for (var i = 0, len = ifs.length; i < len; i++) { var f = ifs[i]; var fDoc = f.contentDocument || f.contentWindow.document; if (fDoc === document) { f.width = document.body.clientWidth; f.height = 0; f.height = ' +
            (scope.maxheight === undefined) + '?document.body.scrollHeight:' + scope.maxheight +
            ';console.log("doc size: ",f.width,f.height); } } }\
            </script></head>\
            <body "><img src="' +
            newVal +
            '" style="width: ' +
            scope.maxwidth +
            '; height: auto' +
            //scope.maxheight + 'px' +
            '; " onload="resizeParent();" /></body></html>';


          var doc = iframe.document;
          if (iframe.contentDocument) {
            doc = iframe.contentDocument;
          } else if (iframe.contentWindow) {
            doc = iframe.contentWindow.document;
          }

          doc.open();
          doc.writeln(iframeHtml);
          doc.close();
        };


      }
    };
  }]);
