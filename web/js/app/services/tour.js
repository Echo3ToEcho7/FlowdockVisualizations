angular.module('fdvis.tour', [])
.factory('tourService', function ($q) {
  var loginTour, flowsTour;

  return {
    login: function () {
      if (loginTour) return loginTour;
      console.log('loginTourDone', localStorage.getItem('loginTourDone'));
      if (!!localStorage.getItem('loginTourDone')) return;

      loginTour = new Shepherd.Tour({
        defaults: {
          classes: 'shepherd-theme-arrows',
          scrollTo: false
        }
      });

      loginTour.addStep({
        id: '1',
        attachTo: '#user-panel',
        title: 'Logging in',
        text: 'You are not logged in right now. Click the login button',
        buttons: []
      });
      loginTour.addStep({
        attachTo: '#flows top',
        title: 'Go with the Flow',
        text: 'All of the Flows that you are subscribed to show appear here shortly.',
        buttons: [{
          text: 'Next',
          action: loginTour.next
        }]
      });
      loginTour.addStep({
        attachTo: '#refreshFlows right',
        title: 'Refreshing Flows',
        text: 'If you subscribe to additional flows later you will need to refresh the list of Flows',
        buttons: [{
          text: 'Back',
          action: loginTour.back
        }, {
          text: 'Next',
          action: loginTour.next
        }]
      });
      loginTour.addStep({
        attachTo: '.downloadMessages right',
        title: 'Download Messages',
        text: 'Due to how Flowdock\'s API works, this webapp downloads and caches the Flow\'s messages. <br />Clicking on the download button will grap all the messages. If you do it again, you will only download new messages',
        buttons: [{
          text: 'Back',
          action: loginTour.back
        }, {
          text: 'Next',
          action: loginTour.next
        }]
      });
      loginTour.addStep({
        attachTo: '.flow top',
        title: 'Activate a Flow',
        text: 'You can only do visualizations on one flow at a time. Clicking on a row will "activate" <br /> that Flow. The row will turn green when active',
        buttons: [{
          text: 'Back',
          action: loginTour.back
        }, {
          text: 'Next',
          action: loginTour.next
        }]
      });
      loginTour.addStep({
        attachTo: '#sidebar',
        title: 'Pick a Visualization',
        text: 'You are now ready to visualize your Flow. Have fun!',
        buttons: [{
          text: 'Back',
          action: loginTour.back
        }, {
          text: 'Finish',
          action: function () {
            localStorage.setItem('loginTourDone', true);
            loginTour.getCurrentStep().complete();
          }
        }]
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
