$(function() {

    var svgDimentions = {
        width: 500,
        height: 500
    };


    var svgColorScheme = [
        "rgba(90, 210, 80, 1)",
        "rgba(50, 110, 170, 1)",
        "rgba(240, 170, 55, 1)",
        "rgba(120, 70, 190, 1)",
        "rgba(200, 60, 20, 1)",
        "rgba(90, 210, 80, 1)",
        "rgba(50, 110, 170, 1)",
        "rgba(240, 170, 55, 1)",
        "rgba(120, 70, 190, 1)",
        "rgba(200, 60, 20, 1)"
    ];

    $.ajax({
        type: "GET",
        url:  "/api/tasks/report/projects/days/",
        data: "",
        complete: function(data){
            if (data.status == 201) {
                console.log(JSON.parse(data.responseText));

                var userReportData = JSON.parse(data.responseText).data;


				var projectReport = d3.select(".task-widget._text")
					.selectAll(".task-report__users")
					.data(userReportData)
					.enter()
					.append("section")
					.classed("task-report__project", true);

				var width = d3.scaleLinear()
					.domain([0, 12*60])
					.range([0, svgDimentions.width]);

				var names = projectReport
					.append("div")
					.text(function(data) { return data.task; })
					.classed("task-report__projectName", true);

				var project = projectReport
					.selectAll("article")
					.data(function(d) {return d3.entries(d.datelist); })
					.enter()
					.append("article")
					.classed("task-report__day", true);

				project.append("h2")
					.text(function(date) {return date.key})
					.classed("task-report__date", true);

				var day = project
					.selectAll("div")
					.data(function(day) {return(d3.values(day.value.tasks));})
					.enter()
					.append("div")
					.classed("task-report__task", true);

                var taskDescription = day
                    .append("div")
                    .text(function(d) { return (d.user + ' ' + d.spent); })
                    .classed("task-report__time", true);

				var taskDescription = day
					.append("div")
					.text(function(d) { return (d.description); })
					.classed("task-report__description", true);

				//d.task + " — " +


            }


        },
        dataType: "JSON"
    });


});