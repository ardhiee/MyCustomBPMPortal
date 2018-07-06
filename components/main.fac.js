(function () {

    "use strict";
    app.factory('bpmFactory', function ($http) {


        var urlProcess = 'http://localhost:3000/api/processes';
        var urlTasks = 'http://localhost:3000/api/getTasks';
        var urlStartProcess = 'http://localhost:3000/api/startProcess';
        var urlClaimTask = 'http://localhost:3000/api/claimTask';
        var urlSubmitTask = 'http://localhost:3000/api/submitTask';


        var headers = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        var bpmFactory = {};

        bpmFactory.getExposedProcess = function () {
            return $http.get(urlProcess);
        };

        bpmFactory.getTasks = function () {
            return $http.get(urlTasks);
        }

        bpmFactory.startProcess = function (processID) {
            return $http.get(urlStartProcess + '/' + processID);
        }

        bpmFactory.claimTask = function (taskID) {
            return $http.get(urlClaimTask + '/' + taskID);
        }

        bpmFactory.getTaskData = function (taskID) {
            return $http.get(urlTasks + '/' + taskID);
        }

        bpmFactory.submitTask = function (data) {
            console.log("Data : " + data)
            return $http.post(urlSubmitTask, data, headers);
        }

        bpmFactory.getData = function () {
            return $http.get('data/item.json');
        }

        return bpmFactory;
    });

})();
