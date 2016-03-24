
// application
angular.module('ParseExplorer', [
    'ui.bootstrap',
    'ParseExplorer.controllers',
    'ParseExplorer.services'
]);

// contollers
angular.module('ParseExplorer.controllers', []).controller('AppCtrl', function ($scope, ParseService) {
    $scope.loggedIn = false;
    $scope.title = "TechTracker Explorer";
    $scope.user = {username: null, password: null};

    // call the parse service to get the survey data
    ParseService.getData().then(function (data) {
        $scope.surveyCollections = orderSurveys(data);
    });
    
    // called when user clicks the login button
    $scope.login = function (user) {
        $(".login div.error").remove();
        if (user.username == 'test' && user.password == 'test') {
            $scope.loggedIn = true;
        }
        else {
            $("#password").after("<div class='error'>The username or password is incorrect</div>"); 
        }
    };
    
    // called when user clicks the login button
    $scope.logout = function () {
        $(".login div.error").remove();
        $scope.loggedIn = false;
        $scope.user = { username: null, password: null };
    };    

    // called when user clicks on a download button for a single survey
    $scope.download = function (surveyCollection) {
        downloadCSV(surveyCollection);
    };
    
    // order the surveys into array of objects by survey name
    // survey { name: <survey name>, colllection: <array of surveys> }
    function orderSurveys(data) {
        var surveyCollections = [];
        var surveys = getSurveys(data);
        _.each(surveys, function (surveyName) {
            var survey = {
                name: surveyName,
                collection: []
            };
            survey.collection = _.filter(data, function (d) { return d.surveyName == surveyName; });
            surveyCollections.push(survey);
        });
        return surveyCollections;
    }
    
    // returns an array of unique survey names
    function getSurveys(data) {
        var allSurveys = _.pluck(data, 'surveyName');
        allSurveys = _.uniq(allSurveys);
        return _.sortBy(allSurveys, function (s) { return s; });;
    }
    
    // accepts a survey collection object, creates a csv and 
    // automatically launches the download
    function downloadCSV(surveyCollection) {        
        // csv file
        var CSV = '';
        
        // the columns to collect
        // only these elements will be collected and shown in the order as they appear in array
        var columns = ["contentSequence", "contentType", "label", "shortLabel", "answerType", "answer"];
        
        // get the download date
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();

        // set first line as the survey title   
        CSV += surveyCollection.name + '\r\n';
        CSV += 'Downloaded Date: ' + mm + '/' + dd + '/' + yyyy + '\r\n\n';

        var firstRow = true;
        // loop through each survey and compile into a single csv file for download
        _.each(surveyCollection.collection, function (survey) {
            var headerRow = [];
            var dataRow = [];

            // collection of survey information
            headerRow.push('"Submission ID"');
            dataRow.push('"' + survey.objectId + '"');
            headerRow.push('"Survey Created"');
            dataRow.push('"' + survey.createdAt + '"');
            headerRow.push('"Latitude for Survey"');
            dataRow.push('"' + survey.lat + '"');
            headerRow.push('"Longitude for Survey"');
            dataRow.push('"' + survey.lng + '"');

            // parse the json
            var surveyResponses = typeof survey.surveyResponses.responses != 'object' ? 
            JSON.parse(survey.surveyResponses.responses) : 
            survey.surveyResponses.responses;
                        
            // iterate over each survey response
            _.each(surveyResponses, function (surveyResponse) {
                var response = [];
                response.push(surveyResponse);             
                // must have an answer element or we ignore it
                if (_.has(surveyResponse, 'answerType')) {
                    var label = _.pluck(response, 'label');
                    var value = _.pluck(response, 'answer');
                    value = value[0] == null ? '' : value[0];                        
                    headerRow.push('"' + label + '"');
                    dataRow.push('"' + value + '"');
                }
            });
            if (firstRow) {
                CSV += headerRow + '\r\n';
                firstRow = false;
            }            
            CSV += dataRow + '\r\n';         
        });
        
        // use the survey name as the file name
        var fileName = surveyCollection.name.replace(/\s/g, '');;
        
        // set the file type
        var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
        
        // auto download the document
        var link = document.createElement("a");
        link.href = uri;
        link.style = "visibility:hidden";
        link.download = fileName + ".csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);     
    }
});

// service collects all data from the parse application service
angular.module('ParseExplorer.services', []).service('ParseService', function ($q, $http) {
    
    // the parse application keys
    var config = {
        headers: {
            'X-Parse-Application-Id': '',
            'X-Parse-REST-API-Key': ''
        }
    };
    
    var service = {};
    
    service.getData = function () {        
        var deferred = $q.defer();      
        $http.get("https://api.parse.com/1/classes/surveySubmissions", config).success(function (data, status, headers, config) {
            var parseData = [];            
            for (var i = 0, il = data.results.length; i < il; i++) {
                var currentItem = data.results[i];
                parseData.push(currentItem);
            }            
            deferred.resolve(parseData);
        })
        .error(function (data, status, headers, config) {            
            deferred.reject("error" + data);
        });        
        return deferred.promise;
    };
    
    return service;
});