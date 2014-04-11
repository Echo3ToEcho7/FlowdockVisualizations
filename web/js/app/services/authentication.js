angular.module('fdvis.authentication.service', [])
.factory('authenticationService', function ($rootScope, $q, $http, Base64) {
  var isAuthenticated = false;
  var user = null;
  var doLogin = function (username, password) {
    var d = $q.defer();

    $http.defaults.headers.common.Authorization = 'Basic ' + Base64.encode(username + ':' + (password || 'hiya!'));
    $http.get('https://api.flowdock.com/users/0').error(function (r, s, headers) {
      $http.get('https://api.flowdock.com/users/' + headers('Flowdock-User')).success(function (data) {
        user = data;
        d.resolve(user);
      });
    });

    return d.promise;
  };

  if (localStorage.getItem('token')) {
    doLogin(localStorage.getItem('token'));
  }

  return {
    authenticate: function (username, password) {
      return doLogin(username, password).then(function (user) {
        if (user) {
          $rootScope.$broadcast('authenticated', user);
        }

        return user;
      });
    },

    getUser: function () {
      return user;
    },

    isAuthenticated: function () {
      return isAuthenticated;
    }
  };
});
