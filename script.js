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
    .when("/add/:id", {
        templateUrl : "pages/new.htm",
        controller:"addItemController"
    })
    .when("/add", {
        templateUrl : "pages/new.htm",
        controller:"addItemController"
    })
    .when("/contacts", {
        templateUrl : "pages/contacts.htm",
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

function addItemController($scope,$http,$location,$routeParams)
{
    $scope.item_type = $routeParams.id || "quick";
    $scope.config = 'basic';
    $scope.hide = true;
    $scope.n_note = {};
    $scope.n_note.title = "";
    $scope.n_note.detail = "";
    $scope.n_note.subtask = [];
    $scope.n_note.contact = [];
    $scope.n_note.deadline = {};
    $scope.n_note.schedule = {};
    $scope.n_note.reminder = {};
    $scope.submitting = false;

    $scope.init = function()
    {
        setTimeout(function(){
            $('[id^=carousel-new-item]').slick('setPosition');
            // alert("yey");
        },0);
    }

    $scope.new_note = function()
    {
        $scope.submitting = true;
        let data = {id:cookie.get("sess_identifier"),sign:cookie.get("sign"),payload: $scope.n_note};
        data = JSON.stringify(data);
        if($scope.n_note.title)
            $http.post('/api/note/add',data).then(function(response){
                let payload = response.data;
                if(payload.success)
                {
                    $.notify({
                        icon: 'pe-7s-add',
                        message: "New note has been added."

                    },{
                        type: 'success',
                        timer: 1000
                    });
                    $location.path("/inlist");
                }
                else
                {
                    $.notify({
                        icon: 'pe-7s-info',
                        message: "Something went wrong."

                    },{
                        type: 'danger',
                        timer: 1000
                    });
                    $scope.submitting = false;
                }
            });
        else
        {
            $.notify({
                icon: 'pe-7s-info',
                message: "Please make sure the note has a name."},{
                type: 'danger',
                timer: 1000
            });
            $scope.submitting = false;
        }
    }

    setTimeout(function()
    {
    $('[id^=carousel-new-item]').slick({
        dots: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: false,
        nextArrow: "<button type=\"button\" class=\"btn btn-round\">Continue</button>",
        adaptiveHeight: true
    });
    $('.datepicker').datepicker({
        format: "M d, yyyy"
    });
    $('[id^=dp]').datepicker("setStartDate",(new Date()).toString());
    
    //date pickers
    $('[id^=dp-deadline]').datepicker("setStartDate",(new Date()).toString()).on("changeDate",function(e){
        $('[id^=dp-deadline]').datepicker('update',e.date);

        $scope.$apply(function(){
            $scope.n_note.deadline.date = e.date.toString("MMMM dd yyyy");
        });
    })
    $('[id^=dp-schedule]').datepicker("setStartDate",(new Date()).toString()).on("changeDate",function(e){
        $('[id^=dp-schedule]').datepicker('update',e.date);

        $scope.$apply(function(){
            $scope.n_note.schedule.date = e.date.toString("MMMM dd yyyy");
        });
    })
    $('[id^=dp-reminder]').datepicker("setStartDate",(new Date()).toString()).on("changeDate",function(e){
        $('[id^=dp-reminder]').datepicker('update',e.date);

        $scope.$apply(function(){
            $scope.n_note.reminder.date = e.date.toString("MMMM dd yyyy");
        });
    });

    //clockpickerss
    
    $('.clockpicker').clockpicker().find('#input-deadline').change(function(){
        let t = this.value;
        $scope.$apply(function(){
            $scope.n_note.deadline.time = t;
        });
        $('.clockpicker').clockpicker().find('#input-deadline').val(t);
    });
    $('.clockpicker').clockpicker().find('#input-schedule').change(function(){
        let t = this.value;
        $scope.$apply(function(){
            $scope.n_note.schedule.time = t;
        });
        $('.clockpicker').clockpicker().find('#input-schedule').val(t);
    });
    $('.clockpicker').clockpicker().find('#input-reminder').change(function(){
        let t = this.value;
        $scope.$apply(function(){
            $scope.n_note.reminder.time = t;
        });
        $('.clockpicker').clockpicker().find('#input-reminder').val(t);
    });
    }
    ,0);
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
                cookie.set("sign",data.sign,1);
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


function contactController($scope)
{

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





function nextActionController($scope,$http)
{
    $scope.notes = [];
    $http.get("/api/note/get/action").then(function(res){
        $scope.$apply(function(){
            $scope.notes = res.notes;
        });
    });
}

function inlistController($scope,$http)
{
    $scope.notes = [];
    $scope.loaded = 0;
    $scope.n = [];

    $scope.n_ = function()
    {
        let w = $scope.getlayer();
        let r =[];
        for(let i=0; i<w; i++)
            r.push(i);
        $scope.n =r;
    };
    $scope.getlayer = function()
    {
        console.log($scope.notes.length);
        return Math.floor($scope.notes.length/4) +( ($scope.notes.length%4==0)? 0 : 1);
    }
    $scope.loadnext = function()
    {
        $http.get("api/note/get/inlist/"+($scope.loaded+1)+"/"+cookie.get("sess_identifier")+"/"+cookie.get("sign")).then(function(res){
                if(res.data.success)
                {
                    $scope.notes = res.data.payload;
                    let notes = $scope.notes;
                    for(let i in notes)
                    {
                        notes[i].schedule = JSON.parse(notes[i].schedule);
                        notes[i].reminder = JSON.parse(notes[i].reminder);
                        notes[i].due      = JSON.parse(notes[i].due);
                        notes[i].duration = JSON.parse(notes[i].duration);
                       // notes[i].details = nl2br(notes[i].details);
                    }
                    $scope.n_();
                }
                else               
                $.notify({
                    icon: 'pe-7s-info',
                    message: "Something went wrong"

                },{
                    type: 'danger',
                    timer: 1000
                });

        });
    }
    $scope.loadnext();
}

function nl2br (str, is_xhtml) {
    if (typeof str === 'undefined' || str === null) {
        return '';
    }
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}