// declare modules

var app = angular.module('claimApp', [
    'ngMaterial',
    'ui.router',
    'ngCookies',
    'ngMdIcons']);


app.config(function ($mdThemingProvider, $stateProvider, $urlRouterProvider) {
    //    $mdThemingProvider.theme('default')
    //        .primaryPalette('teal')
    //        .accentPalette('orange');

    //hilangin %2F
    $urlRouterProvider.otherwise('/');

    $stateProvider

        .state('login', {
        url: '/login',
        templateUrl: 'components/authentication/login.tpl.html',
        controller: 'loginCtrl as vm'
    })

    .state('main', {
        url: '/',
        templateUrl: 'components/main.tpl.html',
        controller: 'mainCtrl as vm',
        css: 'css/main.css'
    })

    .state('main.tasklist', {
        url: 'tasklist',
        templateUrl: 'components/tasklist/tasklist.tpl.html',
        controller: 'tasklistCtrl as vm',
        css: 'css/main.css'
    })

    .state('main.dataentry', {
        url: 'dataentry/:taskID',
        templateUrl: 'components/ktp/dataentry.tpl.html',
        controller: 'dataentryCtrl as vm',
        css: 'css/main.css'
    })

    .state('main.finalize', {
        url: 'finalize/:taskID',
        templateUrl: 'components/ktp/finalize.tpl.html',
        controller: 'finalizeCtrl as vm',
        css: 'css/main.css'
    })

    .state('main.404', {
        url: '404',
        templateUrl: 'components/misc/404.html',
        css: 'css/main.css'
    })

});

app.run(['$rootScope', '$location', '$cookies', '$http',
    function ($rootScope, $location, $cookies, $http) {


        // keep user logged in after page refresh
        $rootScope.globals = $cookies.getObject('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
                $location.path('/login');
            }
        });
}]);
