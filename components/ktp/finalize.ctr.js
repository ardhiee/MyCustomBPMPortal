app.controller('finalizeCtrl', function ($state, bpmFactory, $scope, $stateParams, $mdToast, $mdDialog) {


    var vm = this;

    vm.taskID = $stateParams.taskID;
    vm.Identitas;
    vm.approve = approve;

    onLoad(vm.taskID)


    function onLoad(taskID) {

        bpmFactory.getTaskData(taskID)
            .then(function (response) {
                vm.Identitas = response.data.data.Aplikasi.Identitas;

                console.log(JSON.stringify(response.data.data, null, 4));

            }, function (error) {
                console.log("Error : " + error);
            })

    }

    function approve(ev, input) {


        // Combine
        var Aplikasi = {
            TaskID: vm.taskID,
            Aplikasi: {
                Identitas: input
            }
        };

        var data = Aplikasi;

        // Dialog
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
            .textContent('You will submit new data.')
            .targetEvent(ev)
            .ok('Sure!')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function () {
            // If Sure pressed
            bpmFactory.submitTask(data)
                .then(function (response) {
                    showToast("Data has been submitted!");
                    $state.go('main.tasklist');
                }, function (error) {
                    showToast("Error : " + error);
                });

        }, function () {

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




});
