var planzenApp = angular.module('planzen',['ngRoute']);

planzenApp.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "pages/welcome.htm"
    })
    .when("/inlist", {
        templateUrl : "pages/inlist.htm"
    })
    .when("/next-action", {
        templateUrl : "pages/next-action.htm"
    })
    .when("/schedule", {
        templateUrl : "pages/schedule.htm"
    })
    .when("/project", {
        templateUrl : "pages/project.htm"
    })
    .when("/waiting", {
        templateUrl : "pages/waiting.htm"
    })
    .when("/login", {
        templateUrl : "login.htm"
    })
});

function mainController($scope)
{
    console.log(document.cookie);
    $scope.logged = false;
}

function authController($scope,$http)
{
    $scope.submit = function()
    {
        let data = JSON.stringify($scope.auth);
        $scope.auth={};
        $http.post("/api/auth/",data).then(function(response){
        

        ;
    }
}