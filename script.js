var planzenApp = angular.module('planzen',['ngRoute']);

planzenApp.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "welcome.htm"
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
    .when("/add", {
        templateUrl : "pages/new.htm"
    })
});

function mainController($scope,$location)
{
    $scope.checkCookie = function(){
        return cookie.get("sess_identifier")!="";
    };
    $scope.logout = function()
    {
        cookie.set("sess_identifier","",-1);
    };
    $scope.modal = 'modals/addTask.htm';
    $scope.$on('$routeChangeStart', function($event, next, current) { 
        if(cookie.get("sess_identifier")=="")
            $location.path("/login");
     });
}

function authController($scope,$http,$location)
{
    $scope.submit = function()
    {
        let data = JSON.stringify($scope.auth);
        $scope.auth={};
        $http.post("/api/auth/",data).then(function(response){
            let data = response.data;
            if(data.success)
            {
                cookie.set("sess_identifier",data.id,1);
                $location.path('/');
            }
            else
            {

                $.notify({
                    icon: 'pe-7s-info',
                    message: "Wrong username and password combination"

                },{
                    type: 'danger',
                    timer: 1000
                });
            }
        });
    }
    if(cookie.get("sess_identifier")!="")
        $location.path("/");
}

var cookie =
{
    set: function(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },

    get: function(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    },

}