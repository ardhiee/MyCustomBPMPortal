app.controller('tasklistCtrl', function ($state, bpmFactory, $scope, $mdToast, $mdDialog) {


    var vm = this;

    vm.showConfirm = showConfirm;


    getTasks();

    function getTasks() {
        bpmFactory.getTasks()
            .then(function (response) {
                vm.allTasks = response.data.tasks;
            }, function (error) {
                showToast("Error get process");
            });
    }

    // received from main controller
    $scope.$on('newTask', function (event, item) {
        vm.allTasks.push(item);

        console.log(JSON.stringify(item, null, 4));

        bpmFactory.claimTask(item.taskId)
            .then(function (response) {
                    if (response.data.task[0].taskState == "STATE_CLAIMED") {
                        showToast("New proccess has been started and a task has been assign to you");
                        goToDataEntry(item.taskId);
                    } else {
                        showToast("Something wrong in assign task");
                        $state.go('tasklist');
                    }
                },
                function (error) {
                    showToast("Error cant claim task");
                });
    });

    // claim task
    function claimTask(input, taskName) {

        // get page and state data from item.json
        bpmFactory.getData()
            .then(function (response) {

                var task = taskName;
                console.log(task)

                for (i = 0; i < response.data.prosesKTP.length; i++) {
                    //console.log(response.data.prosesKTP[i].taskName);
                    if (response.data.prosesKTP[i].taskName == task) {
                        vm.states = response.data.prosesKTP[i].state;
                        // claim the task
                        bpmFactory.claimTask(input)
                            .then(function (response) {

                                    if (response.data.task[0].taskState == "STATE_CLAIMED") {
                                        $state.go(vm.states, {
                                            taskID: input
                                        });
                                        showToast("You claim a new task");

                                    } else {
                                        showToast("Something wrong in assign task");
                                        $state.go('tasklist');
                                    }
                                },
                                function (error) {
                                    showToast("Error cant claim task");
                                });
                        break;
                    } else {
                        vm.states = "404";
                    }
                }

                if (vm.states == "404") {
                    $state.go('main.404');
                }

            }, function (error) {
                console.log(error);
            });

    }

    function goToDataEntry(input) {
        $state.go('main.dataentry', {
            taskID: input
        });
    }

    // show toast
    function showToast(message) {
        $mdToast.show(
            $mdToast.simple()
            .content(message)
            .position('bottom right')
            .hideDelay(3000)
        );
    }

    // Dialog
    function showConfirm(ev, input, taskName) {

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
            .textContent('You will be claim a new task.')
            .targetEvent(ev)
            .ok('Sure!')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function () {
            claimTask(input, taskName);
        }, function () {

        });
    };



});
