	app = angular.module('app', ['ngRoute', 'ngAnimate']);
	app.config(function($routeProvider, $locationProvider){
	  
    $routeProvider
    .when('/first',{
      template: "<div class='box'>First</div>",
      animation: 'first'
    })
    .when('/second',{
      template: "<div class='box'>Second</div>",
      animation: 'second'
    })
    .when('/third',{
      template: "<div class='box'>Third</div>",
      animation: 'third'
    })
    .otherwise({
      template: "<div class='box n'>Well... Hello There</div>",
      animation: 'welcome'
    });
	});


	app.controller('ctrl', function($scope, $rootScope){
	  $rootScope.$on('$routeChangeStart', function(event, currRoute, prevRoute){
		$rootScope.animation = currRoute.animation;
	  });
	});
