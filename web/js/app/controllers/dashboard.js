var app = angular.module('fdvis.dashboard', []);

app.controller('fdDashboard', function fdDashboard($scope, $q, dataFlows, tourService) {
  var messages = 0;
  var notification = null;

  var getAllFlows = function () {
    return dataFlows.getAllFlows().then(function (flows) {
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
        $scope.downloadFlows().then(function () {
          if (tourService.login())
            tourService.login().next();
        });
      } else {
        if (tourService.login())
          tourService.login().next();
      }
    });
    $scope.updateUsers();
  });

  $scope.$on('downloadedMessages', function (evt, msgs) {
    if (!notification) {
      notification = noty({ text: "Downloaded " + messages, layout: 'top' });
    }

    messages = messages + msgs.length;
    notification.setText("Downloaded " + messages);
  });

  $scope.$on('messagesDownloaded', function (evt) {
    messages = 0;
    notification.close();
    notification = null;
  });

  $scope.downloadFlows = function () {
    $scope.flows = {};
    $scope.loading = true;
    return dataFlows.downloadFlows().then(function (flows) {
      return getAllFlows();
    });
  };

  $scope.updateFlow = function (id) {
    if (!notification) {
      notification = noty({ text: "Downloaded " + messages, layout: 'top' });
    }

    $scope.loading = true;
    dataFlows.getFlow(id).then(function (flow) {
      dataFlows.downloadNewMessages(flow).then(function (messages) {
        $q.all({
          threads: flow.messages(),
          comments: flow.comments(),
          lastUpdated: flow.lastUpdated
        }).then(function (res) {
          messages = 0;
          if (notification) {
            notification.close();
          }
          notification = null;

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

  var t = tourService.login();
  if (!localStorage.getItem('loginTourDone')) {
    t.start();
  }
});

