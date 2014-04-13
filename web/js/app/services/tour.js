angular.module('fdvis.tour', [])
.factory('tourService', function ($q) {
  var loginTour, flowsTour;

  return {
    login: function () {
      if (loginTour) return loginTour;

      loginTour = new Tour({
        debug: true,
        name: 'loginTour',
        steps: [{
          //element: '#user-panel',
          orphan: true,
          title: 'Log into Flowdock',
          content: 'You are not logged in right now. Click the login button',
          onNext: function (tour) {
            tour.end();
          }
        }, {
          element: '#login-box',
          title: 'Logging In',
          content: 'You can either user your username and password or you can use an API token.',
          onNext: function (tour) {
            tour.ent();
          }
        //}, {
          //element: '#flows',
          //title: 'Go with the Flow',
          //content: 'All of the Flows that you are subscribed to show appear here shortly.'
        //}, {
          //element: '#refreshFlows',
          //placement: 'right',
          //title: 'Refreshing Flows',
          //content: 'If you subscribe to additional flows later you will need to refresh the list of Flows'
        //}, {
          //element: '#downloadMessages',
          //title: 'Download Messages',
          //content: 'Due to how Flowdock\'s API works, this webapp downloads and caches the Flow\'s messages. Clicking on the download button will grap all the messages. If you do it again, you will only download new messages'
        //}, {
          //element: '#sidebar',
          //title: 'Pick a Visualization',
          //content: 'You are now ready to visualize your Flow. Have fun!'
        }],
        onStart: function (tour) {
        },
        onShow: function (tour) {
          console.log('show');
        },
        onShown: function (tour) {
          console.log('shown', tour);
        }
      });

      return loginTour;
    },

    flows: function () {
      flowsTour = new Tour({
        name: 'flowsTour'
      });
    }
  };
});
