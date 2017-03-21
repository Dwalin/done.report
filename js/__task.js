$(function() {

    $('.js-popup__open').magnificPopup({
        type:'inline',
        midClick: true // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
    });

    var tasks = {};

    var taskReportVM = function(data) {
        var self = this;

        //console.log(data.users);

        this.date          =   data.date;
        this.tasks         =   ko.observableArray();

        data.tasklist.forEach(function(task) {
            self.tasks.push(new taskVM(task));
        });

        this.timeSummary  = ko.computed(function(){
            var timeSummaryReturn = [];
            self.tasks().forEach(function(task) {
                //console.log('time__spent = ' + timeSummaryReturn[task.users().assignee]);
                timeSummaryReturn[task.users().assignee] = +((timeSummaryReturn[task.users().assignee] != undefined) ? timeSummaryReturn[task.users().assignee] : 0 ) + +task.time__spent();
            });

            var timeSummaryReturnHumanized = [];
            for (var time in timeSummaryReturn) {
                timeSummaryReturnHumanized[time] = ((timeSummaryReturn[time]/60 >= 1) ? (Math.floor(timeSummaryReturn[time]/60)) + ' ч ' +  timeSummaryReturn[time]%60 + ' мин' : '' +  timeSummaryReturn[time]%60 + ' мин' );
            }

            //console.log(timeSummaryReturn);
            var send = {'summary' : timeSummaryReturn, 'summaryHumanized' : timeSummaryReturnHumanized};
            return send;
        });

    };
    var taskVM = function(data) {
        var self = this;

        //console.log(data.users);

        this.id            =   data.id;
        this.task          =   ko.observable(data.task);
        this.loading       =   ko.observable(false);
        this.description   =   ko.observable(data.description);
        this.screenshots   =   ko.observable(data.screenshots);
        this.comments      =   ko.observable(data.comments);
        this.newScreenshot =   ko.observable("");
        this.newComment    =   ko.observable("");
        this.newTag        =   ko.observable("");
        this.deadline      =   ko.observable(data.deadline);
        this.ticket        =   ko.observable(data.ticket);
        this.marker        =   ko.observable(data.marker);
        this.state         =   ko.observable(data.state);
        this.time__spent   =   ko.observable(data.time__spent);
        this.created       =   ko.observable(data.created);
        this.modified      =   ko.observable(data.modified);
        this.access        =   ko.observable(data.access);
        this.users         =   ko.observable(data.users);
        this.tags          =   ko.observable(data.tags);
        this.time          =   ko.observable();
        this.addTime       =   ko.observable();
        this.assigneeId    =   ko.observable();
        this.hidden        =   ko.observable(false);
        this.spent_human   =   ko.computed(function() {
            //console.log(self.time__spent());
            var human = (self.time__spent()/60 >= 1) ? (Math.floor(self.time__spent()/60)) + ' ч ' +  self.time__spent()%60 + ' мин' : '' +  self.time__spent()%60 + ' мин';
            return human;
        });
        this.date          =   ko.computed(function(){
            var raw = new Date(self.modified() ? self.modified() : self.created());

            var date = {
                year : raw.getFullYear(),
                month : (raw.getMonth() > 9) ? (raw.getMonth()+1) : ('0' + (raw.getMonth()+1) ),
                day   : (raw.getDate() > 9) ? (raw.getDate()) : ('0' + raw.getDate() ),
                time  : raw.getHours() + ':' + ((raw.getMinutes() > 9) ? raw.getMinutes() : '0' + raw.getMinutes()),
            }

            date.fullDate = date.year + '.' + date.month + '.' + date.day;

            return date;
        });

        this.update        =   ko.observable({
            assignee: "",
            task: data.task,
            ticket: data.ticket,
            deadline: data.deadline,
            description: data.description,
            screenshot: "",
            comment: "",
            tag: "",
            time: ""
        });

        this.updateTask = function(action) {
            self.loading(true);

            var data = {};

            console.log(self.update());

            switch (action) {
                case 'assignee': data.assignee = self.update().assignee; break;
                case 'task': data.task = self.update().task; break;
                case 'ticket': data.ticket = self.update().ticket; break;
                case 'deadline': data.deadline = self.update().deadline; break;
                case 'description': data.description = self.update().description; break;
                case 'screenshot': data.screenshot = self.newScreenshot; break;
                case 'comment': data.comment = self.newComment; break;
                case 'tag': data.tag = self.newTag; break;
                case 'time': data.time = self.update().time; break;
            }

            console.log(data);

            self.updateRoutine(data);

        };
        this.deleteProperty = function(property, id) {
            self.loading(true);

            var data = {};

            switch (property) {
                case 'tag':
                    data.tagDel = id
                    break
                case 'comment':
                    data.commentDel = id
                    break
                case 'screenshot':
                    data.screenshotDel = id
                    break
            }

            self.updateRoutine(data);
            self.hidden(true);

        };

        this.updateRoutine = function(data) {

            $.ajax({
                dataType: "json",
                type: "PUT",
                data: data,
                url: "/api/tasks/" + self.id + "/modify",
                complete: function(data) {
                    self.loading(false);
                },
                success: function(data) {
                    self.task        (data.tasks.task);
                    self.description (data.tasks.description);
                    self.deadline    (data.tasks.deadline);
                    self.ticket      (data.tasks.ticket);
                    self.marker      (data.tasks.marker);
                    self.state       (data.tasks.state);
                    self.time__spent (data.tasks.time__spent);
                    self.created     (data.tasks.created);
                    self.modified    (data.tasks.modified);
                    self.access      (data.tasks.access);
                    self.users       (data.tasks.users);
                    self.tags        (data.tasks.tags);
                    self.screenshots (data.tasks.screenshots);
                    self.comments    (data.tasks.comments);

                },
                error: function(data) {

                }
            });
        }

    };
    var tasksVM = function(content) {
        var self = this;

        this.tasks = ko.observableArray();
        this.tasksReport = ko.observableArray();

        this.possibleDates = ko.observableArray();

        this.dates = ko.observable(
            {from: "", to: ""}
        );

        this.loading = ko.observable(true);
        this.states = ko.observableArray();
        this.loggedIn = ko.observable(true);
        this.counters = ko.observableArray();
        this.newTask = ko.observableArray([
            {task: "", description: "", ticket: "", deadline: "", assignee: ""}
        ]);
        this.newFastTask = ko.observableArray([
            {task: "",ticket: "", time: ""}
        ]);
        this.settingTaskAssignee = ko.observable();
        this.loginForm = ko.observableArray([
            {login: "", password: ""}
        ]);
        this.currentStateId = ko.observable(1);
        this.currentStateName = ko.observable();

        this.filter = ko.observable(
            {assignee: "", date: "", tag: ""}
        );
        this.users = ko.observableArray("");
        this.tags = ko.observableArray("");
        this.currentUser = ko.observable("");
        this.currentUserId = ko.observable("");
        this.userTiming = ko.pureComputed(function() {
            var userTimings = [];

            self.users().forEach (
                function(item, i, arr) {
                    self.tasks().forEach (
                        function(task, j, tasks) {
                            userTimings[task.users.assignee] = userTimings[task.users.assignee] + task.time__spent;
                        }
                    )
                }
            )

            return userTimings;
        });

        this.setState = function(task, state_id) {
            //self.loading(true);

            var data = {};
            data.state = state_id;

            self.tasks.remove(task);

            $.ajax({
                dataType: "json",
                type: "PUT",
                data: data,
                url: "/api/tasks/" + task.id + "/modify",
                complete: function(data) {

                },
                success: function(data) {

                },
                error: function(data) {

                }
            });

        };
        this.createNewFastTask = function() {
            //console.log("Creating task");

            var data = {
                task: self.newFastTask.task,
                ticket: self.newFastTask.ticket,
                time: self.newFastTask.time,
                state: 5,
                marker: 'Runtime'
            };

            //console.log(data);

            $.ajax({
                type: "POST",
                url: "/api/tasks/",
                data: data,
                complete: function(data){

                    if (data.status == 201) {
                        self.clearForms();
                        self.refresh();
                    }
                },
                dataType: "JSON"
            });
        };
        this.createNewTask = function() {
            //console.log("Creating task");

            var data = {
                task: self.newTask.task,
                description: self.newTask.description,
                ticket: self.newTask.ticket,
                deadline: self.newTask.deadline,
                assignee: self.newTask.assignee,
                marker: self.newTask.marker
            };

            $.ajax({
                type: "POST",
                url: "/api/tasks/",
                data: data,
                complete: function(data){
                    //console.log(data);
                    if (data.status == 201) {
                        self.clearForms();
                        self.refresh();
                    }
                },
                dataType: "JSON"
            });
        };
        this.clearForms = function() {
            var forms = document.getElementsByClassName("js-form");
            for (var i = 0; i < forms.length; i++) {
                forms[i].reset();
                console.log(forms[i]);
            }
        };
        this.refresh = function() {

            self.loading(true);

            $.ajax({
                dataType: "json",
                data: "",
                url: "http://done.mjolnir.com.ua/api/users/",
                success: function(data) {
                    self.users(data.data);
                },
                error: function(data) {
                    //console.log("Users Error");
                }
            });

            $.ajax({
                dataType: "json",
                data: "",
                url: "http://done.mjolnir.com.ua/api/tags/",
                success: function(data) {
                    //console.log(data.data);
                    self.tags(data.data);
                },
                error: function(data) {
                    //console.log("Tags Error");
                }
            });

            $.ajax({
                dataType: "json",
                data: "",
                url: "/api/users/current",
                success: function(data) {
                    self.currentUser(data.name);
                    self.currentUserId(data.id);
                },
                error: function(data) {
                    //console.log("Current User Error");
                }
            });

            var parameters = {};

            parameters.assignee = "&assignee=" + self.filter.assignee;
            parameters.user = "&user=" + self.filter.user;
            parameters.tag = self.filter.tag ? "&tag=" + self.filter.tag : '';
            if ((self.dates.from != undefined) && (self.dates.from != "")) {
                parameters.from = "&from=" + self.dates.from;
            } else {
                parameters.from = '';
            }

            if ((self.dates.to != undefined) && (self.dates.to != "")) {
                parameters.to = "&to=" + self.dates.to;
            } else {
                parameters.to = '';
            }

            console.log("/api/tasks/?state=" + self.currentStateId() + parameters.tag + (parameters.from ? parameters.from : ''));


            $.ajax({
                dataType: "json",
                type: "GET",
                url: "/api/tasks/?state=" + self.currentStateId() + parameters.tag + (parameters.from ? parameters.from : '') + (parameters.to ? parameters.to : ''),
                complete: function(response){
                    //console.log(response.responseText);
                    self.loading(false);
                },
                success: function(response) {

                    self.tasks([]);

                    if (response.tasks != null) {
                        response.tasks.forEach(function(task) {
                            self.tasks.push(new taskVM(task));
                        });
                    }

                    self.states(response.states);
                    self.counters(response.counters);
                    self.currentStateId(response.state.id);
                    self.currentStateName(response.state.name);
                    self.counters(response.counters);

                    var dateIsUsed = false;

                },
                error: function(data) {

                    self.tasks([]);

                    response = JSON.parse(data.responseText);

                    if (response.status == "Need to login") {
                        self.loggedIn(false);
                    }
                }
            });




        };
        this.changeState = function(data, event) {
            self.loading(true);
            self.currentStateId(event.toElement.id);
            self.refresh();
        };
        this.deleteTask = function(task) {

            self.tasks.remove(task);

            $.ajax({
                dataType: "json",
                type: "DELETE",
                data: '',
                url: "/api/tasks/" + task.id,
                complete: function(data) {
                    //self.refresh();
                },
                success: function(data) {

                },
                error: function(data) {

                }
            });
        };
        this.login = function() {
            var data = {
                login: self.loginForm.login,
                password: self.loginForm.password
            };

            $.ajax({
                type: "POST",
                url: "/api/users/login",
                data: data,
                dataType: "JSON",
                success: function(data) {
                    self.loggedIn(1);
                    self.refresh();
                },
                error: function(data) {
                    //console.log(data.responseText);
                }

            });
        };

        this.refresh();
    };

    ko.bindingHandlers.datepicker = {
        init: function(element, valueAccessor) {
            $(element).datepicker({
                dateFormat: "yy-mm-dd"
            });
            //console.log("datepicker");
        }
    };
    ko.bindingHandlers.datepickerToday = {
        init: function(element, valueAccessor) {
            $(element).datepicker({
                dateFormat: "yy-mm-dd",
                maxDate: 0
            });
            console.log("datepicker");
        }
    };
    ko.bindingHandlers.popup = {
        init: function(element, valueAccessor) {
            $(element).magnificPopup({
                type:'inline',
                midClick: true, // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
                closeBtnInside: true
            });
        }
    };
    ko.bindingHandlers.deadline = {
        init: function(element, valueAccessor) {
            var deadline = new Date;
            var today = new Date;
            var left;

            deadline.setTime(Date.parse($(element).html()));
            today.setTime(Date.now());

            left = Math.floor((deadline.getTime() - today.getTime())/(1000*60*60*24))+1;
            //console.log(left);

            text = "";

            rest = Math.abs((+left) % 10);
            //console.log(rest);

            switch (rest) {
                case 1 : text = (left + " день"); break;
                case 2 : text = (left + " дня"); break;
                case 3 : text = (left + " дня"); break;
                case 4 : text = (left + " дня"); break;
                case 5 : text = (left + " дней"); break;
                case 6 : text = (left + " дней"); break;
                case 7 : text = (left + " дней"); break;
                case 8 : text = (left + " дней"); break;
                case 9 : text = (left + " дней"); break;
                case 0 : text = ("Сегодня"); break;
            }

            $(element).html(text);
        }
    };

    ko.applyBindings(new tasksVM());
});
