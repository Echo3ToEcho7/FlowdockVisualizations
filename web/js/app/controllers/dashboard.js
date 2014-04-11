var app = angular.module('fdvis.dashboard', []);

app.controller('fdDashboard', function fdDashboard($scope, $q, dataFlows) {
  var getAllFlows = function () {
    dataFlows.getAllFlows().then(function (flows) {
      $scope.flows = _(flows).map(function (f) { 
        return {
          id: f.doc._id,
          name: f.doc.name,
          flow: f
        };
      }).indexBy('id').value();

      _.each($scope.flows, function (f) {
        $q.all({
          lastUpdated: f.flow.lastUpdated,
          threads: f.flow.countMessages(),
          comments: f.flow.countComments()
        }).then(function (res) {
          f.lastUpdated = res.lastUpdated;
          f.threads = res.threads;
          f.comments = res.comments;
        }, function (err) { console.error(err); });
      });

      $scope.loading = false;
    });
  };

  $scope.updateUsers = function () {
    $scope.user_loading = true;
    dataFlows.downloadUsers().then(function (users) {
      $scope.users = _(users).sortBy('name').first(20).value();
      $scope.user_loading = false;
    }, function (err) { console.error(err); throw err; });
  };
  //$scope.updateUsers();
  getAllFlows();

  $scope.$on('authenticated', function (evt, user) {
    dataFlows.getAllFlows().then(function (flows) {
      if (flows.length === 0) {
        $scope.downloadFlows();
      }
    });
  });

  $scope.downloadFlows = function () {
    $scope.flows = {};
    $scope.loading = true;
    dataFlows.downloadFlows().then(function (flows) {
      getAllFlows();
    });
  };

  $scope.updateFlow = function (id) {
    $scope.loading = true;
    dataFlows.getFlow(id).then(function (flow) {
      dataFlows.downloadNewMessages(flow).then(function (messages) {
        $q.all({
          threads: flow.messages(),
          comments: flow.comments(),
          lastUpdated: flow.lastUpdated
        }).then(function (res) {
          $scope.flows[id].threads = res.threads.length;
          $scope.flows[id].comments = res.comments.length;
          $scope.flows[id].lastUpdated = new Date();
          $scope.loading = false;
        });
      });
    });
  };

  $scope.activeFID = dataFlows.getActiveFlowID();
  $scope.makeActive = function (id) {
    $scope.activeFID = id;
    localStorage.setItem('activeFlow', id);
    dataFlows.setActiveFlowID(id);
  };
});

