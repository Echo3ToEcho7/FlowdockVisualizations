var
  app;

app = angular.module('fdvis', ['ngRoute', 'data', 'base64', 'fdvis.dashboard', 'fdvis.authentication']);

app.constant('fdVisualizations', [{
  group: 'Users',
  name: 'Total by Users',
  route: '/totalByUsers',
  href: 'web/vis/totalByUsers.html'
}, {
  group: 'Users',
  name: 'Total by Users During Experiment',
  route: '/totalByUsersExp',
  href: 'web/vis/totalByUsersExp.html'
}, {
  group: 'Users',
  name: 'Total Started by Users During Experiment',
  route: '/totalStartedByUsersExp',
  href: 'web/vis/totalStartedByUsersExp.html'
}, {
  group: 'Users',
  name: 'Total Started by Users During Experiment (filter Tye)',
  route: '/totalByUsersExpFilterTye',
  href: 'web/vis/totalStartedByUsersExpFilterTye.html'
}, {
  group: 'Conversations',
  name: 'Responces',
  route: '/respondsTo',
  href: 'web/vis/respondsTo.html'
}, {
  group: 'Messages',
  name: 'By Day of Week and Time',
  route: '/dayOfWeekAndTime',
  href: 'web/vis/postsByDayHour.html'
}]);

app.directive('fdTree', function () {
  return function (scope, elt, attrs) {
    $(elt).tree();
  };
});

app.controller('fdNavBar', function fdNavBar($scope, fdVisualizations) {
  $scope.navs = _.groupBy(fdVisualizations, 'group');
});

app.config(function ($routeProvider, fdVisualizations) {
  _.each(fdVisualizations, function (vis) {
    $routeProvider.when(vis.route, {
      templateUrl: vis.href
    });
  });

  $routeProvider.when('/', {
    templateUrl: 'web/vis/dashboard.html'
  });

  $routeProvider.otherwise({redirectTo: '/'});
});

app.run(function ($http, dataFlows, Base64) {
    "use strict";

    $http.defaults.headers.common.Authorization = 'Basic ' + Base64.encode('4f9bb278d74c144799594c6558f2ac02' + ':' + '');


    if (localStorage.getItem('activeFlow')) {
      dataFlows.setActiveFlowID(localStorage.getItem('activeFlow'));
    }

    //dataFlows.downloadFlows().then(function (flows) {
      //dataFlows.getFlow(flows[0].id).then(function (flow) {
        //dataFlows.downloadMessages(flow).then(function (messages) {
        //});
      //});
    //});

    //Enable sidebar toggle
    $("[data-toggle='offcanvas']").click(function(e) {
        e.preventDefault();

        //If window is small enough, enable sidebar push menu
        if ($(window).width() <= 992) {
            $('.row-offcanvas').toggleClass('active');
            $('.left-side').removeClass("collapse-left");
            $(".right-side").removeClass("strech");
            $('.row-offcanvas').toggleClass("relative");
        } else {
            //Else, enable content streching
            $('.left-side').toggleClass("collapse-left");
            $(".right-side").toggleClass("strech");
        }
    });

    //Add hover support for touch devices
    $('.btn').bind('touchstart', function() {
        $(this).addClass('hover');
    }).bind('touchend', function() {
        $(this).removeClass('hover');
    });

    //Activate tooltips
    $("[data-toggle='tooltip']").tooltip();

    /*     
     * Add collapse and remove events to boxes
     */
    $("[data-widget='collapse']").click(function() {
        //Find the box parent        
        var box = $(this).parents(".box").first();
        //Find the body and the footer
        var bf = box.find(".box-body, .box-footer");
        if (!box.hasClass("collapsed-box")) {
            box.addClass("collapsed-box");
            bf.slideUp();
        } else {
            box.removeClass("collapsed-box");
            bf.slideDown();
        }
    });

    /*
     * ADD SLIMSCROLL TO THE TOP NAV DROPDOWNS
     * ---------------------------------------
     */
    $(".navbar .menu").slimscroll({
        height: "200px",
        alwaysVisible: false,
        size: "3px"
    }).css("width","100%");

    /*
     * INITIALIZE BUTTON TOGGLE
     * ------------------------
     */
    $('.btn-group[data-toggle="btn-toggle"]').each(function() {
        var group = $(this);
        $(this).find(".btn").click(function(e) {
            group.find(".btn.active").removeClass("active");
            $(this).addClass("active");
            e.preventDefault();
        });

    });

    $("[data-widget='remove']").click(function() {
        //Find the box parent        
        var box = $(this).parents(".box").first();
        box.slideUp();
    });

    /* 
     * Make sure that the sidebar is streched full height
     * ---------------------------------------------
     * We are gonna assign a min-height value every time the
     * wrapper gets resized and upon page load. We will use
     * Ben Alman's method for detecting the resize event.
     **/
    //alert($(window).height());
    function _fix() {
        //Get window height and the wrapper height
        var height = $(window).height() - $("body > .header").height();
        $(".wrapper").css("min-height", height + "px");
        var content = $(".wrapper").height();
        //If the wrapper height is greater than the window
        if (content > height)
            //then set sidebar height to the wrapper
            $(".left-side, html, body").css("min-height", content + "px");
        else {
            //Otherwise, set the sidebar to the height of the window
            $(".left-side, html, body").css("min-height", height + "px");
        }
    }
    //Fire upon load
    _fix();
    //Fire when wrapper is resized
    $(".wrapper").resize(function() {
        _fix();
    });

    /*
     * We are gonna initialize all checkbox and radio inputs to 
     * iCheck plugin in.
     * You can find the documentation at http://fronteed.com/iCheck/
     */
    $("input[type='checkbox'], input[type='radio']").iCheck({
        checkboxClass: 'icheckbox_minimal',
        radioClass: 'iradio_minimal'
    });
});
