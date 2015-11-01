'use strict';

angular.module('myapp', ['chrome']);

angular.module('myapp').controller('PopupCtrl', ['$http', '$scope', '$timeout', '$log', 'chrome', function PopupCtrl($http, $scope, $timeout, $log, chrome) {


    $scope.page = 'hello world';
    function onUpdate(request/*, sender, sendResponse*/) {
        console.log('got message', request.type);
        if (request.type === 'pull-requests') {

            // aggregate by jira issue or branch name
            $scope.groupedPrs = _.groupBy(request.data, function( pr ){
                var branchName = pr.head.ref;
                var result = branchName;

                if ( branchName.indexOf('CFY') === 0){
                    var args = branchName.split('-');
                    return args[0] + '-' + args[1];
                }

                pr.groupId = result;

            });

            $scope.page = _.map( $scope.groupedPrs, function(value,key){
                return { groupId: key, prs: value };
            });
        }
    }


    chrome.onMessage(onUpdate);


    chrome.sendMessage({type: 'update-please'});
    $http.get('/dev/mockPullRequest.json').then(function success(result){
        onUpdate(result.data);
    });


    chrome.sendMessage({type: 'update-please'});
}]);