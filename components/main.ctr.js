app.controller('mainCtrl', function ($rootScope, $scope, $state, $mdSidenav, $mdToast, $mdDialog, bpmFactory, $mdMenu) {

    var vm = this;

    vm.openClaimDE = openClaimDE;
    vm.openTaskList = openTaskList;
    vm.logout = logout;
    vm.openMenu = openMenu;
    vm.openSidenav = openSidenav;
    vm.startProcess = startProcess;
    vm.showConfirm = showConfirm;
    vm.toTaskList = toTaskList;

    vm.drugs;
    vm.tasks;
    vm.hasil;



    vm.username = $rootScope.globals.currentUser.username;

    // Get process list
    // 1. Harus dapetin global variable hostname, port


    vm.allProcess;
    vm.newProcessInstance;

    getProcess();


    // All BPM function
    function getProcess() {
        bpmFactory.getExposedProcess()
            .then(function (response) {
                vm.allProcess = response.data.processes;
            }, function (error) {
                showToast("Error get process");
            });
    }

    function startProcess(processID) {

        bpmFactory.startProcess(processID)
            .then(function (response) {
                    vm.newProcessInstance = response.data.tasks;
                    $scope.$broadcast('newTask', vm.newProcessInstance);
                },
                function (error) {
                    showToast("Error get process");
                });

    }

    function openMenu($mdMenu, ev) {
        $mdMenu.open(ev);
    }

    function openSidenav() {
        $mdSidenav('left').toggle();
    }

    // Go to Task List
    function toTaskList() {
        $state.go('main.tasklist');
    }

    // show toast
    function showToast(message) {
        $mdToast.show(
            $mdToast.simple()
            .content(message)
            .position('top, right')
            .hideDelay(3000)
        );
    }

    //sidebar open
    function openClaimDE() {
        $state.go('claims.new');
    }

    //sidebar open
    function openTaskList() {
        $state.go('tasklist');
    }

    function logout() {
        $state.go('login');
    }

    // Dialog
    function showConfirm(ev, input) {

        var confirm = $mdDialog.confirm({
                onComplete: function afterShowAnimation() {
                    var $dialog = angular.element(document.querySelector('md-dialog'));
                    var $actionsSection = $dialog.find('md-dialog-actions');
                    var $cancelButton = $actionsSection.children()[0];
                    var $confirmButton = $actionsSection.children()[1];
                    angular.element($confirmButton).addClass('md-raised');
                    angular.element($cancelButton).addClass('md-raised md-warn');
                }
            })
            .title('Are you sure?')
            .textContent('You start a new process instance.')
            .targetEvent(ev)
            .ok('Sure!')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function () {
            startProcess(input)
        }, function () {

        });
    };




});
