var $           = require('jquery');
var ui          = require('jquery-ui-browserify');
var ko          = require('knockout');

$(function() {

	// -- Load function --

	$(".js-load").removeClass("js-load");

    var tasks = {};

    var taskVM = function(data) {
        var self = this;

        self.id             =   data.id;
        self.task           =   ko.observable(data.task);

        self.loading        =   ko.observable(false);

        self.description    =   ko.observable(data.description);

        self.newScreenshot  =   ko.observable("");
        self.screenshots    =   ko.observable(data.screenshots);

        self.newTag         =   ko.observable("");
        self.tags           =   ko.observable(data.tags);

        self.deadline       =   ko.observable(data.deadline);
        self.ticket         =   ko.observable(data.ticket);

        self.marker         =   ko.observable(data.marker);
        self.state          =   ko.observable(data.state);

        self.time           =   ko.observable();
        self.time__spent    =   ko.observable(data.time__spent);

        self.created        =   ko.observable(data.created);
        self.modified       =   ko.observable(data.modified);

        self.access         =   ko.observable(data.access);
        self.users          =   ko.observable(data.users);

        self.priority       =   ko.observable(data.priority);
        self.hidden         =   ko.observable(false);

        self.newComment     =   ko.observable("");
        self.rawComments    =   ko.observable(data.comments);

        self.comments       =   ko.computed( function () {

            var comments = self.rawComments();

            if (comments != undefined) {
                comments.forEach(function(comment) {
                    var raw = new Date(comment.modified ? comment.modified : comment.created);
                    var rawToday = new Date;

                    comment.highlight = false;

                    raw.setTime(Date.parse(raw));
                    rawToday.setTime(Date.now());

                    var left = {
                        hours:   Math.floor( -(raw.getTime() - rawToday.getTime()) / (1000*60*60)  ),
                        minutes: Math.floor( -(raw.getTime() - rawToday.getTime()) / (1000*60)  ),
                        seconds: Math.floor( -(raw.getTime() - rawToday.getTime()) / (1000)  )
                    };

                    comment.created =  (left.hours > 0) ? left.hours + " hr " : "";
                    comment.created += (left.minutes - left.hours*60 > 0) ? left.minutes - left.hours*60 + " min " : "";
                    comment.created += (comment.created != "") ? "ago" : "just posted";

                    if (left.hours < 24) { comment.highlight = true; }

                });

                return comments;
            }


        });

        self.spent_human    =   ko.computed(function() {
            var human = (self.time__spent()/60 >= 1) ? (Math.floor(self.time__spent()/60)) + ' hr ' +  self.time__spent()%60 + ' min' : '' +  self.time__spent()%60 + ' min';
            return human;
        });
        self.date           =   ko.computed(function(){
            var raw = new Date(self.modified() ? self.modified() : self.created());

            var date = {
                year : raw.getFullYear(),
                month : (raw.getMonth() > 9) ? (raw.getMonth()+1) : ('0' + (raw.getMonth()+1) ),
                day   : (raw.getDate() > 9) ? (raw.getDate()) : ('0' + raw.getDate() ),
                time  : raw.getHours() + ':' + ((raw.getMinutes() > 9) ? raw.getMinutes() : '0' + raw.getMinutes()),
            };

            date.fullDate = date.year + '.' + date.month + '.' + date.day;

            return date;
        });

        self.update        =   ko.observable({
            assignee: "",
            task: data.task,
            ticket: data.ticket,
            deadline: data.deadline,
            priority: data.priority,
            description: data.description,
            screenshot: "",
            comment: "",
            tag: "",
            time: "",
            timeComment: ""
        });

        self.updateTask     = function(action) {
            self.loading(true);

            var data = {};

            console.log(self.update());

            switch (action) {
                case 'assignee': data.assignee = self.update().assignee.id; break;
                case 'task': data.task = self.update().task; break;
                case 'ticket': data.ticket = self.update().ticket; break;
                case 'deadline': data.deadline = self.update().deadline; break;
                case 'priority': data.priority = self.update().priority; break;
                case 'description': data.description = self.update().description; break;
                case 'screenshot': data.screenshot = self.newScreenshot; break;
                case 'comment': data.comment = self.newComment; break;
                case 'tag': data.tag = self.newTag; break;
                case 'time': data.time = self.update().time; data.timeComment = self.update().timeComment; break;
            }

            for (var field in self.update()) {
                self.update()[field] = '';
            }

            self.update(self.update());

            setTimeout(function() {
                self.updateRoutine(data);
            }, 1000);


        };
        self.deleteProperty = function(property, id) {
            self.loading(true);

            var data = {};

            switch (property) {
                case 'tag':
                    data.tagDel = id;
                    break;
                case 'comment':
                    data.commentDel = id;
                    break;
                case 'screenshot':
                    data.screenshotDel = id;
                    break;
            }

            self.updateRoutine(data);
            self.hidden(true);

        };
        self.updateRoutine  = function(data) {
            console.log("Updating task…");
            console.log(data);

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
                    self.priority    (data.tasks.priority);
                    self.state       (data.tasks.state);
                    self.time__spent (data.tasks.time__spent);
                    self.created     (data.tasks.created);
                    self.modified    (data.tasks.modified);
                    self.access      (data.tasks.access);
                    self.users       (data.tasks.users);
                    self.tags        (data.tasks.tags);
                    self.screenshots (data.tasks.screenshots);
                    self.rawComments (data.tasks.comments);

                },
                error: function(data) {

                }
            });
        };

        self.clearForms = function() {
            var forms = document.getElementsByClassName("js-form");
            for (var i = 0; i < forms.length; i++) {
                forms[i].reset();
                console.log(forms[i]);
            }
        };


    };

    var tasksVM = function() {
        var self = this;

        self.state = 'tasks';

        // !-----------------------------------------------------------
        // Login part
        self.loggedIn = ko.observable(true);
        self.currentUser = ko.observable("");
        self.currentUserId = ko.observable("");

        self.loginForm = ko.observableArray([
            {login: "", password: ""}
        ]);

        self.login = function() {
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
        self.logOut = function() {
            $.ajax({
                type: "GET",
                url: "/api/users/logout",
                dataType: "JSON",
                success: function(data) {
                    console.log("succes");
                    self.loggedIn(false);
                },
                error: function(data) {
                    console.log("ERROR");
                }

            });
        };
        // !-----------------------------------------------------------
        // !-----------------------------------------------------------

        // !-----------------------------------------------------------
        // Main data
        self.tasks = ko.observableArray();
        self.counters = ko.observableArray();
        self.loading = ko.observable(false);

        self.states = ko.observableArray();
        self.currentStateName = ko.observable();

        self.users = ko.observableArray("");
        self.currentStateId = ko.observable(1);
        self.tags = ko.observableArray("");

        self.updateUrl = "/api/tasks/?state=" + self.currentStateId();

        self.filter = {
            assignee: ko.observable(""),
            date: ko.observable(""),
            tag: ko.observable("")
        };

        // !-----------------------------------------------------------
        // !-----------------------------------------------------------


        // !-----------------------------------------------------------
        // Changing state
        this.changeState = function(data, event) {

            self.loading(true);
            self.currentStateId(event.target.id);

            setTimeout(function() {
                self.refresh('full');
            }, 1000);

        };
        // !-----------------------------------------------------------
        // !-----------------------------------------------------------


        // !-----------------------------------------------------------
        // Deleting task
        this.deleteTask = function(task) {
            //self.loading(true);

            $.ajax({
                dataType: "json",
                type: "DELETE",
                data: '',
                url: "/api/tasks/" + task.id,
                complete: function(data) {

                    self.loading(true);
                    self.tasks.remove(task);

                    setTimeout(function() {
                        self.refresh();
                    }, 1000);


                },
                success: function(data) {

                },
                error: function(data) {

                }
            });
        };
        // !-----------------------------------------------------------
        // !-----------------------------------------------------------


        // !-----------------------------------------------------------
        // Adding new task
        self.newTask = ko.observableArray([
            {task: "", description: "", ticket: "", deadline: "", assignee: ""}
        ]);
        this.createNewTask = function() {
            console.log("Creating task");

            var data = {
                task: self.newTask.task,
                description: self.newTask.description,
                ticket: self.newTask.ticket,
                deadline: self.newTask.deadline,
                assignee: self.newTask.assignee,
                marker: 'Runtime'
            };

            $.ajax({
                type: "POST",
                url: "/api/tasks/",
                data: data,
                complete: function(data){
                    //console.log(data);
                    if (data.status == 201) {

                        self.loading(true);
                        self.clearForms();
                        self.tasks.unshift(new taskVM(JSON.parse(data.responseText).task));
                        console.log(JSON.parse(data.responseText).task);

                        setTimeout(function() {
                            self.refresh();
                        }, 1000);

                    }
                },
                dataType: "JSON"
            });
        };
        // !-----------------------------------------------------------
        // !-----------------------------------------------------------

        // !-----------------------------------------------------------
        // Adding new fast task
        self.newFastTask = ko.observableArray([
            {task: "", ticket: "", time: ""}
        ]);
        self.createNewFastTask = function() {
            var data = {
                task: self.newFastTask.task,
                ticket: self.newFastTask.ticket,
                time: self.newFastTask.time,
                state: 5,
                marker: 'Runtime'
            };

            $.ajax({
                type: "POST",
                url: "/api/tasks/",
                data: data,
                complete: function(data){

                    if (data.status == 201) {

                        self.loading(true);
                        self.clearForms();

                        setTimeout(function() {
                            self.refresh();
                        }, 1000);

                    }
                },
                dataType: "JSON"
            });
        };
        // !-----------------------------------------------------------
        // !-----------------------------------------------------------

        // !-----------------------------------------------------------
        // Setting task state
        self.setState = function(task, state_id) {

            var data = {};
            data.state = state_id;

            $.ajax({
                dataType: "json",
                type: "PUT",
                data: data,
                url: "/api/tasks/" + task.id + "/modify",
                complete: function(data) {
                    //TODO: Test if something breaks here (moved refresh to success part)
                },
                success: function(data) {
                    self.tasks.remove(task);
                },
                error: function(data) {

                }
            });

        };
        // !-----------------------------------------------------------
        // !-----------------------------------------------------------


        // !-----------------------------------------------------------
        // Refresh procedure
        this.refresh = function(type) {
            if (type == "full") {
                console.log("Full refresh");
                self.tasks([]);
                self.loading(true);

                // !-----------------------------------------------------------
                // Getting tags
                $.ajax({
                    dataType: "json",
                    data: "",
                    url: "http://done.mjolnir.com.ua/api/tags/",
                    success: function(data) {
                        self.tags(data.data);
                    },
                    error: function(data) {
                        console.log("Tags Error");
                    }
                });
                // !-----------------------------------------------------------
                // !-----------------------------------------------------------


                // !-----------------------------------------------------------
                // Getting users
                $.ajax({
                    dataType: "json",
                    data: "",
                    url: "http://done.mjolnir.com.ua/api/users/",
                    success: function(data) {
                        self.users(data.data);
                    },
                    error: function(data) {
                        console.log("Users Error");
                    }
                });
                // !-----------------------------------------------------------
                // !-----------------------------------------------------------

            } else {
                console.log("Adding new tasks");
                self.tasks().forEach(function(selfTask) {
                    selfTask.loading(true);
                });
            }


            // !-----------------------------------------------------------
            // Task updating
            self.updateUrl = "/api/tasks/?state=" + self.currentStateId();
            $.ajax({

                dataType: "json",
                type: "GET",
                url: self.updateUrl,
                complete: function(data){

                },
                success: function(response) {
                    self.loading(false);

                    self.states(response.states);
                    self.counters(response.counters);
                    self.currentStateId(response.state.id);
                    self.currentStateName(response.state.name);
                    self.counters(response.counters);

                    if (response.tasks != null) {

                        if (self.tasks() != '') {

                            console.log('Tasks exist. Updating tasks…');

                            var existCheck = false;

                            response.tasks.forEach(function(task) {
                                existCheck = false;

                                self.tasks().forEach(function(selfTask) {
                                    if (task.id == selfTask.id) {
                                        existCheck = true;
                                    }
                                });

                                if (!existCheck) {
                                    self.tasks.push(new taskVM(task));
                                }
                            });

                            self.tasks().forEach(function(selfTask) {
                                existCheck = false;

                                response.tasks.forEach(function(task) {
                                    if (task.id == selfTask.id) {
                                        existCheck = true;
                                    }
                                });

                                if (!existCheck) {
                                    self.tasks.remove(selfTask);
                                } else {
                                    //console.log(selfTask);
                                }
                            });

                        } else {
                            console.log('No tasks exist. Loading tasks…');

                            response.tasks.forEach(function(task){
                                self.tasks.push(new taskVM(task));
                            });
                        }

                        self.tasks().forEach(function(selfTask) {
                            selfTask.loading(false);
                        });

                    } else {
                        self.tasks([]);
                    }

                },
                error: function(data) {
                    self.tasks([]);

					//console.log(self.currentStateId(), self.updateUrl, data.responseText);

					//console.log(self.currentStateId());
					//console.log("Url is " + self.updateUrl);
					//console.log(data.responseText);



                    response = JSON.parse(data.responseText);

                    if (response.status == "Need to login") {
                        self.loggedIn(false);
                    }
                }
            });
            // !-----------------------------------------------------------
            // !-----------------------------------------------------------


        };
        // !-----------------------------------------------------------
        // !-----------------------------------------------------------

        this.refresh('full');

        this.clearForms = function() {
            var forms = document.getElementsByClassName("js-form");
            for (var i = 0; i < forms.length; i++) {
                forms[i].reset();
                console.log(forms[i]);
            }

            for (var field in self.newTask()) {
                self.newTask()[field] = '';
            }

            self.newTask(self.newTask());

            for (var field in self.newFastTask()) {
                self.newFastTask()[field] = '';
            }

            self.newFastTask(self.newFastTask());

        };

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
                case 1 : text = (left + " day"); break;
                case 2 : text = (left + " days"); break;
                case 3 : text = (left + " days"); break;
                case 4 : text = (left + " days"); break;
                case 5 : text = (left + " days"); break;
                case 6 : text = (left + " days"); break;
                case 7 : text = (left + " days"); break;
                case 8 : text = (left + " days"); break;
                case 9 : text = (left + " days"); break;
                case 0 : text = ((left > 1) ? left + " days" : "Today"); break;
            }

            $(element).html("In " + text);
        }
    };

    ko.applyBindings(new tasksVM());

});
