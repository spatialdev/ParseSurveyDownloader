# ParseSurveyDownloader
A simple and easy to use survey download tool. Connects to a single instance of [Parse](https://parse.com/) and provides 
a csv download for each survey. All submissions to date are included for the given survey in a 
single download.

This application is build using AngularJS and Bootstrap for AngularJS. It is design to be a quick and
easy method of downloading survey information from Parse.com in a csv format, not an example of 
application development best practices. :)

## Install
- Install the required libraries:

```
 npm install
```

- Add your [Parse API keys](https://parse.com/docs/rest/guide#quick-reference-apps) to the app.js file in the ParseService:

```
    // the parse application keys
    var config = {
        headers: {
            'X-Parse-Application-Id': '',
            'X-Parse-REST-API-Key': ''
        }
    };
```

- Open index.html and test. Username and password are hard coded to test/test. You can easily update
for more secure authentication.

Log In Screen:
![Login](https://github.com/spatialdev/ParseSurveyDownloader/blob/master/Example1.PNG "Login")

Sample Survey List:
![List](https://github.com/spatialdev/ParseSurveyDownloader/blob/master/Example2.PNG "List")

