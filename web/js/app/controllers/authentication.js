angular.module('fdvis.authentication.controller', ['fdvis.authentication.service'])
.controller('fdAuthLoginController', function ($scope, $location, authenticationService) {
  $scope.username = localStorage.getItem('authUsername') || '';
  $scope.password = sessionStorage.getItem('authPassword') || '';
  $scope.flair = null;

  $scope.authenticate = function () {
    authenticationService.authenticate($scope.username, $scope.password).then(function () {
      localStorage.setItem('authUsername', $scope.username);
      sessionStorage.setItem('authPassword', $scope.password);
      $location.path('/');
    }, function () {
      $scope.flair = 'Invalid username/password';
    });
  };
})
.controller('fdAuthStatusController', function ($scope, authenticationService) {
  $scope.auth = false;
  $scope.name = "";

  if (authenticationService.isAuthenticated()) {
    $scope.auth = true;
    $scope.name = authenticatedService.getUser().nickname;
  }

  $scope.$on('authenticated', function (evt, user) {
    $scope.auth = true;
    $scope.name = user.nick;
    $scope.avatar = user.avatar;
  });

  $scope.tryLogin = function () {
    //authenticationService.authenticate('4f9bb278d74c144799594c6558f2ac02');
    $('#myModal').modal('show');
    Shepherd.activeTour.hide();
  };
})
.controller('loginController', function ($scope, authenticationService) {
  $scope.username = localStorage.getItem('token');
  $scope.password = sessionStorage.getItem('password');

  $scope.login = function () {
    authenticationService.authenticate($scope.username, $scope.password).then(function (user) {
      localStorage.setItem('token', $scope.username);
      sessionStorage.setItem('token', $scope.username);
      sessionStorage.setItem('password', $scope.password);
      $('#myModal').modal('hide');
    });
  };
});
