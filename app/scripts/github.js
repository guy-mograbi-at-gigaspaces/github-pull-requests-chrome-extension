'use strict';


angular.module('github',[]);


angular.module('github').factory('Github', ['$http',function GithubService( $http ){

    function Github(){}

    Github.prototype.rootApi = 'http://api.github.com';


    Github.prototype.getPullRequests = function( owner, repo, params ){
        return $http(
            {
                url:  this.rootApi + '/repos/' + owner + '/' + repo + '/pulls',
                method: 'GET',
                params: params
            }
        );
    };

    return Github;
}]);