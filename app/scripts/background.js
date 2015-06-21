'use strict';

angular.module('background', ['github', 'chrome']);

angular.module('background').controller('BackgroundCtrl', ['chrome', 'Github', '$scope', '$interval', '$http', function BackgroundController(chrome, Github, $scope, $interval, $http) {
    console.log('I am background');

    chrome.setDefaultConfig({'version': 1, 'repositories': [{'slug': 'cloudify-cosmo/cloudify-js' } ,{ 'slug':'cloudify-cosmo/cloudify-ui', access_token: chrome.getParameterByName('token')}]});


    $scope.pullRequests = {};
    $scope.config = {};

    chrome.readConfig().then(function (config) {
        if (config.version !== $scope.config.version) {
            $scope.config = config;
            $scope.pullRequests = {};
            $scope.getData();
        }
    });

    function sendData() {

        var pullRequestArr = _.sortBy(_.reduce(_.values($scope.pullRequests), function (flattened, other) {
            return flattened.concat(other);
        }, []), 'created_at');

        var comments = 0;
        _.each(pullRequestArr, function(pr){
            if ( pr.comments ) {
                // count only comments that are relevant. if developer fixed the comment, it is no longer relevant.
                var filtered = _.filter(pr.comments, function(comment){ return comment.position !== null });
                comments += filtered.length;
            }

            if ( pr.review_comments ) {
                comments += pr.review_comments.length;
            }
        });
        chrome.setBadgeText({text: pullRequestArr.length + '/' + comments });
        chrome.sendMessage({type: 'pull-requests', data: pullRequestArr});


    }

    $scope.$watch('pullRequests', sendData, true);


    chrome.onMessage(function( request ){
        if ( request.type === 'update-please'){
            sendData();
        }
    });

    $scope.getComments = function(){
        _.each($scope.config.repositories, function( repo ){ //  for each repo
            console.log('getting comments for repo', repo);
            var prs = $scope.pullRequests[repo.slug];
            if ( prs ){
                _.each(prs, function( pr ){
                    console.log('getting comments for pr', pr);
                    $http.get(pr._links.comments.href + '?access_token=' + repo.access_token).then(function( result ){
                        pr.comments = result.data;
                    });
                    $http.get(pr._links.review_comments.href + '?access_token=' + repo.access_token).then(function( result ){
                        pr.review_comments = result.data;
                    });
                })
            }

        });
    };

    $scope.getData = function () {
        _.each($scope.config.repositories, function (repo) {
            var github = new Github();
            github.getPullRequests(repo.slug.split('/')[0], repo.slug.split('/')[1], {
                'state': 'open',
                sort: 'updated',
                access_token: repo.access_token,
                direction: 'desc'
            }).then(function (result) {
                console.log('got pull requests', result.data);
                $scope.pullRequests[repo.slug] = result.data;
                $scope.getComments($scope.pullRequests[repo.slug]);
            });
        });
    };

    $interval($scope.getData, 1000*60)


}]);
