'use strict';


app.controller('loginCtrl', ['$scope', '$rootScope', '$state', '$location', 'AuthenticationService',

    function ($scope, $rootScope, $state, $location, AuthenticationService) {


        var vm = this;

        // reset login status
        AuthenticationService.ClearCredentials();

        vm.login = function () {
            vm.isLoading = true;
            AuthenticationService.Login(vm.formData.username, vm.formData.password, function (response) {
                if (response.success) {
                    AuthenticationService.SetCredentials(vm.formData.username, vm.formData.password);
                    $state.go('main.tasklist');
                    console.log("sukses" + $rootScope);
                    vm.isLoading = false;
                } else {
                    vm.error = response.message;
                    vm.isLoading = false;
                    return vm.error;
                }
            });
        };


    }]);
