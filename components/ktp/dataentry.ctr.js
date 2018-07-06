app.controller('dataentryCtrl', function ($state, bpmFactory, $scope, $stateParams, $mdToast, $mdDialog) {


    var vm = this;



    var taskID = $stateParams.taskID;

    vm.submitDataEntry = submitDataEntry;


    onLoad();


    function submitDataEntry(ev) {


        // Combine
        var Aplikasi = {
            TaskID: taskID,
            Aplikasi: {
                Identitas: vm.Identitas
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




        //        //invoked when user presses the SUBMIT button to complete the Task
        //        $scope.codeStatus = "";
        //        var method = 'POST';
        //        var insertCompletedTaskUrl = "http://localhost:3000/v1/task";
        //        var address = {
        //           houseNumber          : $scope.houseNumber,
        //           street               : $scope.street,
        //           town                 : $scope.town,
        //           county               : $scope.county,
        //           postcode             : $scope.postcode
        //        };
        //        var completedTask = {
        //           taskId               : taskId,
        //           nameOfApplicant      : $scope.nameOfApplicant,
        //           address              : address,
        //           applicationAmount    : $scope.applicationAmount
        //        };
        //        //now perform a HTTP POST that sends this JSON data to the REST API
        //        //it can then be passed back to BPM via the BPM REST API
        //        var jdata = 'newApplication='+JSON.stringify(completedTask);
        //console.log("jdata="+jdata);
        //        $http({
        //            method: method,
        //            url: insertCompletedTaskUrl,
        //            data:  jdata,
        //            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        //        }).
        //        success(function(data, status, headers, config) {
        //            $scope.codeStatus += status;
        //console.log("success status="+$scope.codeStatus);
        //
        //            $window.alert('Application submitted successfully.');
        //            $location.path('/viewMyTasks');
        //        }).
        //        error(function(data, status, headers, config) {
        //            $scope.codeStatus += status || "Failure";
        //console.log("fail status="+$scope.codeStatus);
        //            $window.alert("Oh dear, something went terribly wrong.  You better phone IT support quoting ERR-1DI0T-1");
        //        });


    }

    function onLoad() {

        // get data from item.json
        bpmFactory.getData()
            .then(function (response) {

                vm.agama = response.data.agama;
                vm.status = response.data.status;

            }, function (error) {
                console.log(JSON.stringify(error, null, 4));
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
