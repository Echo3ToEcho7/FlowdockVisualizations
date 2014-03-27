var
  app;


app = angular.module('fdvis', ['ngRoute']);

app.constant('fdVisualizations', [{
  group: 'Users',
  name: 'Total by Users',
  route: '/totalByUsers',
  href: '/vis/totalByUsers.html'
}, {
  group: 'Users',
  name: 'Total by Users During Experiment',
  route: '/totalByUsersExp',
  href: '/vis/totalByUsersExp.html'
}, {
  group: 'Users',
  name: 'Total Started by Users During Experiment',
  route: '/totalByUsersExp',
  href: '/vis/totalStartedByUsersExp.html'
}, {
  group: 'Conversations',
  name: 'Starts Threads',
  route: '/startsThreads',
  href: '/vis/startsThreads.html'
}]);

app.service('fdVisualizationData', function ($http, $q) {
  var
    messages,
    messagesPromise,
    users,
    usersPromise,
    promise,
    service;

  messagesPromise = $http.get('/data/messages.json').success(function (data) { messages = data; return data; });
  usersPromise = $http.get('/data/users.json').success(function (data) { users = data; return data; });
  promise = $q.all({ messages: messagesPromise, users: usersPromise});
  service = {};

  Object.defineProperties(service, {
    promise : {
      value: promise,
      writable: false
    },
    messages: {
      get: function () { return messages; }
    },
    users: {
      get: function () { return users; }
    }
  });

  return service;
});

app.controller('fdNavBar', function fdNavBar($scope, fdVisualizations) {
  $scope.navs = _.groupBy(fdVisualizations, 'group');
});

app.config(function ($routeProvider, fdVisualizations) {
  _.each(fdVisualizations, function (vis) {
    $routeProvider.when(vis.route, {
      resolve: {
        VisData: function (fdVisualizationData) { return fdVisualizationData.promise; }
      },
      templateUrl: vis.href
    });
  });

  $routeProvider.otherwise({redirectTo: '/'});
});
