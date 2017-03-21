$(function() {

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
                timeSummaryReturnHumanized[time] = ((timeSummaryReturn[time]/60 >= 1) ? (Math.floor(timeSummaryReturn[time]/60)) + ' hr ' +  timeSummaryReturn[time]%60 + ' min' : '' +  timeSummaryReturn[time]%60 + ' min' );
            }

            //console.log(timeSummaryReturn);
            var send = {'summary' : timeSummaryReturn, 'summaryHumanized' : timeSummaryReturnHumanized};
            return send;
        });

    };

    var taskVM = function(data) {
        var self = this;

        this.id             =   data.id;
        this.task           =   ko.observable(data.task);
        this.loading        =   ko.observable(false);
        this.description    =   ko.observable(data.description);
        this.screenshots    =   ko.observable(data.screenshots);
        this.newScreenshot  =   ko.observable("");
        this.newComment     =   ko.observable("");
        this.newTag         =   ko.observable("");
        this.deadline       =   ko.observable(data.deadline);
        this.ticket         =   ko.observable(data.ticket);
        this.marker         =   ko.observable(data.marker);
        this.state          =   ko.observable(data.state);
        this.time__spent    =   ko.observable(data.time__spent);
        this.created        =   ko.observable(data.created);
        this.modified       =   ko.observable(data.modified);
        this.access         =   ko.observable(data.access);
        this.users          =   ko.observable(data.users);
        this.tags           =   ko.observable(data.tags);
        this.priority       =   ko.observable(data.priority);
        this.time           =   ko.observable();
        //this.addTime        =   ko.observable();
        //this.assigneeId     =   ko.observable();
        this.hidden         =   ko.observable(false);

        this.rawComments    = ko.observable(data.comments);

        this.comments       =   ko.computed( function () {

            var comments = self.rawComments();

            if (comments != undefined) {
                comments.forEach(function(comment) {
                    var raw = new Date(comment.modified ? comment.modified : comment.created);
                    var rawToday = new Date;

                    comment.highlight = false;

                    raw.setTime(Date.parse(raw));
                    rawToday.setTime(Date.now());

                    //var left = Math.floor( (raw.getTime() - rawToday.getTime()) / (1000*60*60*24) ) + 1;
                    var left = {
                        hours:   Math.floor( -(raw.getTime() - rawToday.getTime()) / (1000*60*60)  ),
                        minutes: Math.floor( -(raw.getTime() - rawToday.getTime()) / (1000*60)  ),
                        seconds: Math.floor( -(raw.getTime() - rawToday.getTime()) / (1000)  )
                    }


                    comment.created =  (left.hours > 0) ? left.hours + " hr " : "";
                    comment.created += (left.minutes - left.hours*60 > 0) ? left.minutes - left.hours*60 + " min " : "";
                    comment.created += (comment.created != "") ? "ago" : "just posted";

                    console.log(left);

                    if (left.hours < 24) {
                        comment.highlight = true;
                    }

                    //console.log(comment.created);

                });

                return comments;
            }


        });

        this.spent_human    =   ko.computed(function() {
            //console.log(self.time__spent());
            var human = (self.time__spent()/60 >= 1) ? (Math.floor(self.time__spent()/60)) + ' hr ' +  self.time__spent()%60 + ' min' : '' +  self.time__spent()%60 + ' min';
            return human;
        });
        this.date           =   ko.computed(function(){
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
            priority: data.priority,
            description: data.description,
            screenshot: "",
            comment: "",
            tag: "",
            time: "",
            timeComment: ""
        });

        this.updateTask     = function(action) {
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

            //self.update(self.update());

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
        this.updateRoutine  = function(data) {
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
        }


    };

    var tasksVM = function(content) {
        var self = this;

        this.state = "tasks";

        this.tasks = ko.observableArray();
        this.tasksReport = ko.observableArray();

        this.possibleDates = ko.observableArray();

        this.dates = ko.observable(
            {from: "", to: ""}
        );

        this.loading = ko.observable(false);
        this.states = ko.observableArray();
        this.loggedIn = ko.observable(true);
        this.counters = ko.observableArray();
        this.newTask = ko.observableArray([
            {task: "", description: "", ticket: "", deadline: "", assignee: ""}
        ]);
        this.newFastTask = ko.observableArray([
            {task: "", ticket: "", time: ""}
        ]);
        this.settingTaskAssignee = ko.observable();
        this.loginForm = ko.observableArray([
            {login: "", password: ""}
        ]);


        var action = window.location.pathname.toString();

        if (action == '/report/') {
            this.currentStateId = ko.observable(5);
        } else {
            this.currentStateId = ko.observable(1);
        }

        this.currentStateName = ko.observable();
        this.users = ko.observableArray("");
        this.tags = ko.observableArray("");
        this.currentUser = ko.observable("");
        this.currentUserId = ko.observable("");

        this.setState = function(task, state_id) {
            //self.loading(true);

            var data = {};
            data.state = state_id;

            $.ajax({
                dataType: "json",
                type: "PUT",
                data: data,
                url: "/api/tasks/" + task.id + "/modify",
                complete: function(data) {

                    self.tasks.remove(task);
                    //self.refresh();
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
                        console.log(JSON.parse(data.responseText).task);
                        self.tasks.unshift(new taskVM(JSON.parse(data.responseText).task));
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

        this.filter = {assignee: ko.observable(""), date: ko.observable(""), tag: ko.observable("")};

        if (window.location.pathname.toString().split('/')[1] == 'task') {
            var taskId = window.location.pathname.toString().split('/')[2];
        }

        if (window.location.pathname.toString().split('/')[1] == 'state') {
            self.currentStateId(window.location.pathname.toString().split('/')[2]);
        }

        if (window.location.pathname.toString().split('/')[3] == 'tag') {
            console.log("Tag url");
            self.filter.tag(window.location.pathname.toString().split('/')[4]);
        }

        //console.log(taskId);
        //console.log(self.currentUser());

	    //logOut
	    this.logOut = function() {

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

        this.refresh = function(action) {

            if (action == "full") {
                self.tasks([]);
                console.log("Full refresh");

                self.loading(true);

                //$.ajax({
                //    dataType: "json",
                //    data: "",
                //    url: "/api/users/current",
                //    success: function(data) {
                //        self.currentUser(data.name);
                //        self.currentUserId(data.id);
                //
                //        //console.log(data.permissions);
                //
                //        if ((self.filter.assignee() == "") && (data.permissions > 40)) {
                //            console.log("Applying user filter = " + data.name );
                //            self.filter.assignee(data.name);
                //        }
                //    },
                //    error: function(data) {
                //        console.log("Current User Error");
                //    }
                //});

            } else {
                self.tasks().forEach(function(selfTask) {
                    selfTask.loading(true);
                });
            }

            //console.log("BOOM");

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
                    self.tags(data.data);
                },
                error: function(data) {
                    console.log("Tags Error");
                }
            });

            var parameters = {};

            //parameters.assignee = "&assignee=" + self.filter.assignee;
            //parameters.user = "&user=" + self.filter.user;

            parameters.tag = self.filter.tag() ? "&tag=" + self.filter.tag() : '';

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

            if (taskId == undefined) {
                var url = "/api/tasks/?state=" + self.currentStateId();
            } else {
                var url = "/api/tasks/?id=" + taskId;
                self.filter.assignee(undefined);
            }

            if (self.currentStateId() == 5) {
                url = "/api/tasks/report/?state=" + self.currentStateId() + parameters.tag + (parameters.from ? parameters.from : '') + (parameters.to ? parameters.to : '');
                $.ajax({
                    dataType: "json",
                    type: "GET",
                    url: "/api/tasks/report/?state=" + self.currentStateId() + parameters.tag + (parameters.from ? parameters.from : '') + (parameters.to ? parameters.to : ''),
                    complete: function(response){
                        self.loading(false);
                    },
                    success: function(response) {

                        self.tasksReport([]);

                        if (response.tasksReport != null) {
                            response.tasksReport.forEach(function(taskReport) {
                                self.tasksReport.push(new taskReportVM(taskReport))
                            });
                        }

                        self.states(response.states);
                        self.counters(response.counters);
                        self.currentStateId(response.state.id);
                        self.currentStateName(response.state.name);
                        self.counters(response.counters);

                    },
                    error: function(data) {

                        self.tasks([]);

                        response = JSON.parse(data.responseText);

                        if (response.status == "Need to login") {
                            self.loggedIn(false);
                        }
                    }
                });
            } else {
                url = url + parameters.tag + (parameters.from ? parameters.from : '') + (parameters.to ? parameters.to : '');
                $.ajax({
                    dataType: "json",
                    type: "GET",
                    url: url,
                    complete: function(response){
                        //console.log(response.responseText);
                        //self.loading(false);
                    },
                    success: function(response) {

                        //self.tasks([]);

                        self.loading(false);

                        if (response.tasks != null) {
                            if (self.tasks() != []) {
                                console.log('Tasks exist. Updating tasks…');

                                var exist = false;

                                response.tasks.forEach(function(task) {
                                    exist = false;

                                    self.tasks().forEach(function(selfTask) {
                                        if (task.id == selfTask.id) {
                                            exist = true;
                                        }
                                    });

                                    if (!exist) {
                                        self.tasks.push(new taskVM(task));
                                    }
                                });

                                self.tasks().forEach(function(selfTask) {
                                    exist = false;

                                    response.tasks.forEach(function(task) {
                                        if (task.id == selfTask.id) {
                                            exist = true;
                                        }
                                    });

                                    if (!exist) {
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

                        self.states(response.states);
                        self.counters(response.counters);
                        //console.log(self.counters()[0])
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
            }
            //console.log(url);

        };

        this.changeState = function(data, event) {
            // self.loading(true);
            self.currentStateId(event.target.id);

            self.refresh('full');
        };
        this.deleteTask = function(task) {
            //self.loading(true);

            $.ajax({
                dataType: "json",
                type: "DELETE",
                data: '',
                url: "/api/tasks/" + task.id,
                complete: function(data) {
                    self.refresh();
                    self.tasks.remove(task);
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

        this.refresh('full');

    };

    var tagVM = function(content) {
        var self = this;

        this.id          = ko.observable(content.id         );
        this.name        = ko.observable(content.name       );
        this.description = ko.observable(content.description);
        this.completion  = ko.observable(content.completion );

        this.update        =   ko.observable({
            name: content.name,
            description: content.description
        });


        this.updateTag     = function(action) {
            //self.loading(true);

            var data = {};

            console.log(self.update());

            switch (action) {
                case 'name': data.name = self.update().name; break;
                case 'description': data.description = self.update().description; break;
            }

            self.updateRoutine(data);

        };

        this.updateRoutine  = function(data) {
            console.log("Updating tag…");

            $.ajax({
                dataType: "json",
                type: "PUT",
                data: data,
                url: "/api/tags/" + self.id(),
                complete: function(data) {
                    //self.loading(false);
                },
                success: function(data) {
                    console.log(data);
                    self.name        (data.data.name);
                    self.description (data.data.description);

                },
                error: function(data) {

                }
            });
        }

    };
    var tagsVM = function(content) {
        var self = this;

        this.tags = ko.observableArray();
        this.loading = ko.observable();
        this.loggedIn = ko.observable(true);
        this.currentUser = ko.observable("");
        this.newTag = ko.observableArray([
            {name: "", description: ""}
        ]);

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
        this.refresh = function() {
            self.loading(true);
            $.ajax({
                dataType: "json",
                data: "",
                url: "http://done.mjolnir.com.ua/api/tags/",
                success: function(data) {
                    //self.tags(data.data);

                    data.data.forEach(function(tag){
                        self.tags.push(new tagVM(tag));
                    });

                },
                error: function(data) {
                    console.log("Tags Error");
                }
            });
        };

        this.createNewTag = function () {
            var data = {
                name: self.newTag().name,
                description: self.newTag().description
            };

            $.ajax({
                type: "POST",
                url: "/api/tags/",
                data: data,
                complete: function(data){
                    console.log(data);
                    if (data.status == 201) {
                        self.tags.unshift(new tagVM(JSON.parse(data.responseText).tag));
                    }
                },
                dataType: "JSON"
            });
        };

        this.deleteTag = function(tag) {
            //self.loading(true);

            $.ajax({
                dataType: "json",
                type: "DELETE",
                data: '',
                url: "/api/tags/" + tag.id(),
                complete: function(data) {
                    //self.refresh();
                    self.tags.remove(tag);
                },
                success: function(data) {

                },
                error: function(data) {

                }
            });
        }

        this.refresh();

    };

    var userVM = function(content) {
        var self = this;

        this.state = "user";

        this.id = ko.observable();
        this.user = ko.observable();
        this.name = ko.observable();
        this.password = ko.observable();
        this.email = ko.observable();
        this.color = ko.observable();


        this.loading = ko.observable();
	    this.logOut = ko.observable(true);
        this.currentUser = ko.observable("");

        this.newTag = ko.observableArray([
            {name: "", description: ""}
        ]);



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

        this.refresh = function() {
            self.loading(true);
            $.ajax({
                dataType: "json",
                data: "",
                url: "http://done.mjolnir.com.ua/api/users/current",
                success: function(data) {
                    //self.tags(data.data);

                    self.id(data.id);
                    self.user(data.login);
                    self.name(data.name);
                    self.email(data.email);
                    self.color(data.color);

                },
                error: function(data) {
                    console.log("Error");
                }
            });
        };

        this.update = function () {
            var data = {
                id: self.id(),
                user: self.user(),
                name: self.name(),
                //password: self.password(),
                email: self.email(),
                color: self.color()
            };

            $.ajax({
                type: "PUT",
                url: "/api/users/",
                data: data,
                complete: function(data){
                    console.log(data);
                    if (data.status == 201) {
                        self.refresh();
                    }
                },
                dataType: "JSON"
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
    }
    ko.bindingHandlers.datepickerToday = {
        init: function(element, valueAccessor) {
            $(element).datepicker({
                dateFormat: "yy-mm-dd",
                maxDate: 0
            });
            console.log("datepicker");
        }
    }
    ko.bindingHandlers.popup = {
        init: function(element, valueAccessor) {
            $(element).magnificPopup({
                type:'inline',
                midClick: true, // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
                closeBtnInside: true
            });
        }
    }
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
    }

    var action = window.location.pathname.toString();
    //console.log(action);

    switch (action) {
        case '/project/':
            ko.applyBindings(new tagsVM());
            break;

        case '/task/':
            ko.applyBindings(new tasksVM());
            break;

        case '/user/':
            ko.applyBindings(new userVM());
            break;

        default:
            ko.applyBindings(new tasksVM());
            break;
    }


});

