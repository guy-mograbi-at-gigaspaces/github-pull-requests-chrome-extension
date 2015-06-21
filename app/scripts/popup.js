'use strict';

angular.module('myapp', ['chrome']);

angular.module('myapp').controller('PopupCtrl', ['$http', '$scope', '$timeout', '$log', 'chrome', function PopupCtrl($http, $scope, $timeout, $log, chrome) {


    $scope.page = 'hello world';
    function onUpdate(request, sender, sendResponse) {
        console.log('got message', request.type);
        if (request.type === 'pull-requests') {
            $scope.page = request.data;
        }
    }


    chrome.onMessage(onUpdate);


    chrome.sendMessage({type: 'update-please'});
    $http.get('/dev/mockPullRequest.json').then(function success(result){
        onUpdate(result.data);
    });


    chrome.sendMessage({type: 'update-please'});
}]);