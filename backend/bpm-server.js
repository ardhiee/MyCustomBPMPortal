//bpm-server.js ExpressJS REST API

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var http = require("http");
querystring = require('querystring');

var port = 3000;
var username;
var password;
var bpmHostname = "sqlserver";
var bpmPort = 9080;

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.use(function (req, res, next) {

    // logging
    console.log('Something is happen');
    next();

});

router.get('/', function (req, res) {

    res.json({
        message: 'hooray! welcome to our api!'
    });
});

//****************************************************
// API For BPM
//****************************************************

// get Current User Active Task list
router.route('/getTasks')
    .get(function (req, res) {

        var auth = req.headers['authorization'];

        if (username && password || auth) {

            decode(auth);

            var url = '/rest/bpm/wle/v1/search/query?columns=taskStatus,bpdName,instanceDueDate,instanceName,taskDueDate,taskPriority,taskSubject&condition=taskStatus%7CReceived&condition=instanceStatus%7CActive&organization=byInstance&run=true&shared=false&filterByCurrentUser=true';

            var returnedtasks = [];

            res.header("Access-Control-Allow-Origin", "*"); //allow from any IP - as we won't know where coming from //"http://"+hostname+':'+webServerPort);
            res.header("Access-Control-Allow-Methods", "GET");

            performRequest(url, 'PUT', '', function (result) {
                var status = result.status;

                if (status == 200) {

                    if (result.data.data != null) {
                        listOfTasks = result.data.data;
                        for (var j = 0; j < listOfTasks.length; j++) {
                            returnedtasks.push({
                                taskId: listOfTasks[j].taskId,
                                taskPriority: listOfTasks[j].taskPriority,
                                taskStatus: listOfTasks[j].taskStatus,
                                taskSubject: listOfTasks[j].taskSubject,
                                taskDueDate: listOfTasks[j].taskDueDate,
                                bpdName: listOfTasks[j].bpdName,
                                instanceId: listOfTasks[j].instanceId,
                                instanceName: listOfTasks[j].instanceName
                            });
                        }
                    } else {
                        console.log("This user does not have any active Tasks assigned to them.");
                        //                        returnedtasks = {
                        //                            "status": "This user does not have any active Tasks assigned to them."
                        //                        };
                    }
                }
                res.json({
                    "tasks": returnedtasks
                });
            });

        } else {

            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');

            res.json({
                "status": res.statusCode,
                "message": "Unauthorized"
            });

        }

    });

// get Current Task Data
router.route('/getTasks/:taskID')
    .get(function (req, res) {

        var auth = req.headers['authorization'];

        if (username && password || auth) {

            decode(auth);

            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET");

            var taskID = req.params.taskID;

            var returnedtask = []; //an object used to store the values needed
            var url = '/rest/bpm/wle/v1/task/' + taskID;
            performRequest(url, 'GET', 'parts=all', function (result) {

                var status = result.status;
                //console.log("status="+status);
                if (status == 200) {
                    var data = result.data.data.variables; //copy the returned object to a javascript object
                }

                res.json({
                    "data": data

                });
            });

        } else {

            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');

            res.json({
                "status": res.statusCode,
                "message": "Unauthorized"
            });

        }

    });

// login API to BPM API
router.route('/authenticate')
    .post(function (req, res) {

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "POST");

        console.log(req.body);

        // assign the details settings
        username = req.body.settings.user;
        password = req.body.settings.password;
        bpmHostname = req.body.settings.hostName;
        bpmPort = req.body.settings.port;


        var returnedtask = [];
        var url = '/rest/bpm/wle/v1/user/' + username + '?includeInternalMemberships=false&refreshUser=false&parts=all';

        performRequest(url, 'GET', '', function (result) {

            var status = result.status;
            console.log("result=" + JSON.stringify(result, null, 4));
            //                                if (status == 200) {
            //                                    returnedtask = result.data; //copy the returned object to a javascript object
            //
            //                                } else {
            //                                    returnedtask = result;
            //                                }
            returnedtask = result;
            res.json({
                "data": returnedtask
            });
        });
        // Feature yang belum muncul
        // 1. membership masih belum muncul
        // 2. Token dari web + jsessionid
    });

// list exposed process
router.route('/processes')
    .get(function (req, res) {

        var auth = req.headers['authorization'];


        if (username && password || auth) {

            decode(auth);

            res.header("Access-Control-Allow-Origin", "*"); //allow from any IP - as we won't know where coming from //"http://"+hostname+':'+webServerPort);
            res.header("Access-Control-Allow-Methods", "GET");

            var returnedprocesses = [];

            var url = '/rest/bpm/wle/v1/exposed/process';
            performRequest(url, 'GET', '', function (result) {

                var listOfExposedProcesses = [];
                var status = result.status;
                if (status == 200) {
                    listOfExposedProcesses = result.data.exposedItemsList; //copy the returned object to a javascript object
                    //  [room for improvement - extract the list of displayNames and let the user pick which one rather than manual passing]
                    //console.log('There are ['+listOfExposedProcesses.length+"] exposed processes");
                    console.log(listOfExposedProcesses.length);
                    for (var j = 0; j < listOfExposedProcesses.length; j++) {
                        returnedprocesses.push({
                            processId: listOfExposedProcesses[j].ID,
                            display: listOfExposedProcesses[j].display,
                            itemId: listOfExposedProcesses[j].itemID,
                            snapshotId: listOfExposedProcesses[j].snapshotID,
                            appId: listOfExposedProcesses[j].processAppID,
                            startURL: listOfExposedProcesses[j].startURL
                        });


                    }
                } else {
                    returnedprocesses = {
                        status: result.status,
                        message: result.message

                    }
                }

                res.json({
                    "processes": returnedprocesses
                });

            });

        } else {

            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');

            res.json({
                "status": res.statusCode,
                "message": "Unauthorized"
            });

        }
    });

// Start Process
router.route('/startProcess/:processID')
    .get(function (req, res) {

        console.log("Masuk")

        var auth = req.headers['authorization'];

        if (username && password || auth) {

            decode(auth);

            res.header("Access-Control-Allow-Origin", "*"); //allow from any IP - as we won't know where coming from //"http://"+hostname+':'+webServerPort);
            res.header("Access-Control-Allow-Methods", "GET");

            var processID = req.params.processID;
            var returnedTaskId = {};
            var startURL = "";

            var returnedprocesses = [];

            var url = '/rest/bpm/wle/v1/exposed/process';

            performRequest(url, 'GET', '', function (result) {

                var listOfExposedProcesses = [];
                var status = result.status;
                //console.log("status="+status);
                if (status == 200) {
                    listOfExposedProcesses = result.data.exposedItemsList; //copy the returned object to a javascript object
                    for (var j = 0; j < listOfExposedProcesses.length; j++) {
                        if (listOfExposedProcesses[j].ID == processID) {
                            startURL = listOfExposedProcesses[j].startURL
                            console.log("startURL=" + startURL);
                            //if we found a match then stop looping
                            break;
                        }
                    }

                    var startProcessUrl = startURL;
                    performRequest(startProcessUrl, 'POST', '', function (result) {

                        var instanceId = result.data.piid;
                        //console.log("\ninstanceId="+instanceId);
                        var Task = result.data.tasks[0];
                        //console.log("\nTaskId="+Task.tkiid);

                        returnedTaskId = {
                            taskId: Task.tkiid,
                            taskPriority: Task.priorityName,
                            taskStatus: Task.status,
                            taskSubject: Task.displayName,
                            taskDueDate: Task.dueTime,
                            bpdName: Task.processInstanceName,
                            instanceId: instanceId,
                            instanceName: Task.processInstanceName
                        }

                        res.json({
                            "tasks": returnedTaskId
                        });
                    });

                }

            });

        } else {

            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');

            res.json({
                "status": res.statusCode,
                "message": "Unauthorized"
            });

        }

    });

// Claim Task
router.route('/claimTask/:taskID')
    .get(function (req, res) {

        var auth = req.headers['authorization'];

        if (username && password || auth) {

            decode(auth);

            res.header("Access-Control-Allow-Origin", "*"); //allow from any IP - as we won't know where coming from
            res.header("Access-Control-Allow-Methods", "GET");

            var taskID = req.params.taskID;

            var returnedtask = []; //an object used to store the values needed
            var url = '/rest/bpm/wle/v1/task/' + taskID + '?action=assign&toMe=true';

            performRequest(url, 'PUT', '', function (result) {
                var status = result.status;
                //console.log("status="+status);
                if (status == 200) {
                    var Task = result.data; //copy the returned object to a javascript object
                    //"state":"STATE_CLAIMED"
                    returnedtask.push({
                        taskState: Task.state
                    });
                }
                res.json({
                    "task": returnedtask
                });
            });

        } else {

            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');

            res.json({
                "status": res.statusCode,
                "message": "Unauthorized"
            });

        }

    });

router.route('/submitTask')
    .post(function (req, res) {

        var auth = req.headers['authorization'];

        if (username && password || auth) {

            decode(auth);

            res.header("Access-Control-Allow-Origin", "*"); //allow from any IP - as we won't know where coming from //"http://"+hostname+':'+webServerPort);
            res.header("Access-Control-Allow-Methods", "POST");

            var taskID = req.body.TaskID;

            var Aplikasi = {
                Aplikasi: req.body.Aplikasi
            }

            console.log(encodeURI(JSON.stringify(Aplikasi)));

            var params = encodeURI(JSON.stringify(Aplikasi));


            var statusOfSubmit = "error";
            var taskSubmitUrl = "/rest/bpm/wle/v1/task/" + taskID + "?action=finish";

            performRequest(taskSubmitUrl, 'PUT', params, function (result) {
                console.log(JSON.stringify(result, null, 4));

                var status = result.status;
                if (status == 200) {
                    statusOfSubmit = "success";
                    console.log("Yay, the Task submitted okay and we got a positive result back from BPM.\nThe Task should now be gone from the Task list or status=Closed.");
                } else if (status == "error") {
                    console.log(JSON.stringify(result));
                    statusOfSubmit = "error";
                }
                res.json({
                    status: statusOfSubmit,
                    reason: result.message,
                    cause: result.cause
                });
            });

        } else {

            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');

            res.json({
                "status": res.statusCode,
                "message": "Unauthorized"
            });

        }

    });

router.route('/jajalRedirect')
    .get(function (req, res) {

        var username = 'ardi',
            password = 'password',
            auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

        res.header('Authorization', auth);


        res.writeHead(200, {
            Location: 'https://sqlserver:9443/rest/bpm/wle/v1/search/query?columns=taskStatus%2CbpdName%2CinstanceDueDate%2CinstanceName%2CtaskDueDate%2CtaskPriority%2CtaskSubject&condition=taskStatus%7CReceived&organization=byInstance&run=true&shared=false&filterByCurrentUser=true'
        });



        res.writeHead(200, {
            Location: 'https://sqlserver:9443/ProcessCenter/login.jsp'
        });

        res.end();


    });

//****************************************************



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// Common Function
function convertUserDetails(str) {
    var valueToEncode = [];
    //t = 116
    //o = 111
    //n = 110
    //y = 121
    //: = 58
    //p = 112
    //i = 105
    //g = 103
    //r = 114
    //a = 97
    //m = 109
    //to be able to convert the user:password to be base64 encoded
    //we have to convert the values into UniCode
    //we do that using the .charCodeAt() function in javascript
    //console.log("str length="+str.length);
    for (var j = 0; j < str.length; j++) {
        valueToEncode.push(str.charCodeAt(j));
    }
    //console.log("valueToEncode="+valueToEncode);
    //valueToEncode = ['116','111','110','121','58','112','105','103','114','97','109'];
    return valueToEncode;
}

function performRequest(endpoint, method, data, success) {
    var dataString = JSON.stringify(data);
    var headers = {};

    var unicodeUserPwd = convertUserDetails(username + ":" + password);
    var based64EncodedUserPwd = "Basic ";
    based64EncodedUserPwd += new Buffer(unicodeUserPwd).toString('base64');
    //console.log("based64EncodedUserPwd="+based64EncodedUserPwd);
    //Authorization: "Basic dG9ueTpwaWdyYW0=" //base64 encode of tony:pigram

    if (method == 'GET') {
        endpoint += '?' + querystring.stringify(data);
        headers = {
            'Cache': false, //possibly do not need these two?
            'Timeout': 5000, //possibly do not need these two?
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': based64EncodedUserPwd
        };
    } else {
        if (method == 'PUT' && dataString.length > 0) {
            //basically only do this for a Finish Task POST
            endpoint += "&params=" + data;
            endpoint += "&parts=all";
            //console.log("endpoint="+endpoint);
        }
        headers = {
            //use the following header setting if the URI passed is very long
            //'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': based64EncodedUserPwd,
            'Content-Length': dataString.length
        };
    }
    var options = {
        host: bpmHostname,
        port: bpmPort,
        path: endpoint,
        method: method,
        headers: headers
    };


    var req = http.request(options, function (res) {
            res.setEncoding('utf-8');
            var responseString = '';

            console.log("statusCode: ", res.statusCode);


            if (res.statusCode != 200) {
                //                console.log("statusCode: ", res.statusMessage);
                var code = res.statusCode;
                var msg = res.statusMessage;
                var cause = "";

                res.on('data', function (data) {

                    var data = JSON.parse(data);
                    var string = '{"status":"' + code + '","message":"' + msg + '","cause":"' + data.Data.errorMessage + '"}';
                    success(JSON.parse(string));
                });



            } else {
                res.on('data', function (data) {
                    //                    console.log("res.on=" + data);
                    responseString += data;
                });
                res.on('end', function () {
                    //console.log("Masuk ke END " + responseString);

                    //console.log("\nresponseString="+responseString.text());
                    var responseObject = JSON.parse(responseString);
                    //console.log("\nresponseObject="+responseObject);
                    success(responseObject);
                });
            }

        })
        .on('error', function (e) {
            console.log("Error : " + e.message);
            var string = '{"status":503,"message":"' + e.message + '"}';
            success(JSON.parse(string));
        })
        .on('timeout', function (t) {
            console.log("Timeout : " + t.message);
            var string = '{"status":504,"message":"' + e.message + '"}';
            success(JSON.parse(string));
        });

    req.write(dataString);

    req.end();

}

function decode(auth) {

    var tmp = auth.split(' '); // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part

    var buf = new Buffer(tmp[1], 'base64'); // create a buffer and tell it the data coming in is base64
    var plain_auth = buf.toString(); // read it back out as a string

    var creds = plain_auth.split(':'); // split on a ':'
    username = creds[0];
    password = creds[1];


}

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
