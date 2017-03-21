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



    //$.ajax({
    //    type: "GET",
    //    url:  "/api/tasks/report/time/overall/",
    //    data: "",
    //    complete: function(data){
    //        if (data.status == 201) {
    //
    //            var time = [];
    //
    //            var data = JSON.parse(data.responseText).data;
    //
    //            data.forEach(function (item, i, tasks) {
    //                time.push(item.spent);
    //            });
    //
    //            var width = d3.scaleLinear()
    //                .domain([0, 5*8*60])
    //                .range([0, svgDimentions.height]);
    //
    //            var height = svgDimentions.width/time.length;
    //
    //            var bars = d3.select(".task-report__svg")
    //                .selectAll("g")
    //                .data(data)
    //                .enter()
    //                .append("g");
    //
    //            bars.append("rect")
    //                .attr("x", function(data, i){return i*height})
    //                .attr("y", function(data) {return svgDimentions.height - width(data.spent)})
    //                .attr("width", height)
    //                .attr("height", function(data) {return width(data.spent)});
    //
    //            bars.append("text")
    //                .attr("x", function(data, i){return i*height})
    //                .attr("y", svgDimentions.height + 20)
    //                .attr("dy", ".15em")
    //                .text(function(data) {
    //                        return (
    //                            Math.round(data.spent / 60) + " hours " + (data.spent % 60) + " minutes "
    //                        );
    //                });
    //
    //            bars.append("text")
    //                .attr("x", function(data, i){return i*height})
    //                .attr("y", svgDimentions.height + 40)
    //                .attr("dy", ".15em")
    //                .text(function(data) {
    //                    return (data.date);
    //                });
    //
    //
    //            var normal = d3.line()
    //                .x(function(d) { return d.x; })
    //                .y(function(d) { return d.y; });
    //
    //            d3.select(".task-report__svg")
    //                .append("g")
    //                .append("path")
    //                .attr("d", normal(
    //                    [{"x" : 0, "y" : svgDimentions.height-width(5*8*60)}, {"x" : svgDimentions.width, "y" : svgDimentions.height-width(5*8*60)}]
    //                ))
    //                .attr("stroke", "blue")
    //                .attr("fill", "none");
    //
    //            var worked = d3.line()
    //                .x(function(data, i) { return i*height + height/2 ; })
    //                .y(function(data) { return svgDimentions.height - width(data.spent); })
    //                .curve(d3.curveCatmullRom.alpha(0.05));
    //
    //            d3.select(".task-report__svg")
    //                .append("g")
    //                .append("path")
    //                .attr("d", worked (data))
    //                .attr("stroke", "blue")
    //                .attr("stroke-width", 0.25)
    //                .attr("fill", "none");
    //
    //        }
    //    },
    //    dataType: "JSON"
    //});
    //
    //$.ajax({
    //    type: "GET",
    //    url:  "/api/tasks/report/users/",
    //    data: "",
    //    complete: function(data){
    //        if (data.status == 201) {
    //            console.log(JSON.parse(data.responseText));
    //
    //            var userReportData = JSON.parse(data.responseText).data;
    //
    //            var userReport = d3.select(".task-widget._users")
    //                .selectAll(".task-report__users")
    //                .data(userReportData)
    //                .enter()
    //                .append("svg")
    //                .classed("task-report__svg", true)
    //                .attr("viewBox", "-200 -100 800 800");
    //
    //            var width = d3.scaleLinear()
    //                .domain([0, 12*60])
    //                .range([0, svgDimentions.width]);
    //
    //            var barHeight = 20;
    //
    //            var names = userReport
    //                .append("text")
    //                .text(function(data) { return data.user; })
    //                .attr("y", "-40");
    //
    //            var user = userReport
    //                .selectAll("g")
    //                .data(function(d) {/*console.log(d3.entries(d.datelist));*/ return d3.entries(d.datelist); })
    //                .enter()
    //                .append("g")
    //                .attr("transform", function(d, i) { return ("translate(0, " + i * 2 * barHeight + " )") } )
    //
    //            var day = user
    //                .selectAll("g")
    //                .data(function(day) {/*console.log(d3.values(day.value.tasks));*/ return(d3.values(day.value.tasks));})
    //                .enter()
    //                .append("g")
    //                .classed("task-report__group", true);;
    //
    //            var task = day
    //                .append("rect")
    //                .attr("width", function(d) { return width(d.spent) })
    //                .attr("height", function(d, i) {return barHeight;})
    //                .style("opacity", function(d, i) {return (i*0.1 + 0.1)})
    //                .classed("task-report__bar", true);
    //
    //
    //            var iterator = -1;
    //
    //            task.attr("transform", function(d, i) {
    //                var move = 0;
    //                iterator++;
    //                if (i > 0) {
    //                    for (var j = 0; j < i; j++) {
    //                        //console.log(iterator, i, j);
    //                        move += width((task.data()[iterator-i+j]).spent);
    //                        //console.log("Adding width from block #" + (iterator-i+j) + " " + width((task.data()[iterator-i+j]).spent) + " to block #" + iterator );
    //                    }
    //                    return( "translate(" + move + ", 0)");
    //                }
    //            });
    //
    //            var taskDescription = day
    //                .append("text")
    //                .text(function(d) { return ("Spent " + Math.round((d.spent) / 60) + "hr " + (d.spent) % 60 + "min on " + d.task + " — " + d.description); })
    //                .attr("x", "0")
    //                .attr("y", "-5")
    //                .classed("task-report__description", true);
    //
    //
    //            user.append("text")
    //                .text(function(date) {/*console.log(date);*/ return (date.key + " " + Math.round((date.value.spent) / 60) + "hr " + (date.value.spent) % 60 + "min" )})
    //                .attr("text-anchor", "end")
    //                .attr("x", "-10")
    //                .attr("y", "14");
    //
    //        }
    //
    //
    //    },
    //    dataType: "JSON"
    //});
    //
    $.ajax({
        type: "GET",
        url:  "/api/tasks/report/projects/days/",
        data: "",
        complete: function(data){
            if (data.status == 201) {
                console.log(JSON.parse(data.responseText));

                var userReportData = JSON.parse(data.responseText).data;

                var userReport = d3.select(".task-widget._projects")
                    .selectAll(".task-report__users")
                    .data(userReportData)
                    .enter()
                    .append("svg")
                    .classed("task-report__svg", true)
                    .attr("viewBox", "-200 -100 1000 800");

                var width = d3.scaleLinear()
                    .domain([0, 12*60])
                    .range([0, svgDimentions.width]);

                var barHeight = 20;

                var names = userReport
                    .append("text")
                    .text(function(data) { return data.task; })
                    .attr("y", "-40");

                var user = userReport
                    .selectAll("g")
                    .data(function(d) {/*console.log(d3.entries(d.datelist));*/ return d3.entries(d.datelist); })
                    .enter()
                    .append("g")
                    .attr("transform", function(d, i) { return ("translate(0, " + i * 2 * barHeight + " )") } )

                var day = user
                    .selectAll("g")
                    .data(function(day) {/*console.log(d3.values(day.value.tasks));*/ return(d3.values(day.value.tasks));})
                    .enter()
                    .append("g")
                    .classed("task-report__group", true);;

                var task = day
                    .append("rect")
                    .attr("width", function(d) { return width(d.spent) })
                    .attr("height", function(d, i) {return barHeight;})
                    .style("opacity", function(d, i) {return (i*0.1 + 0.1)})
                    .classed("task-report__bar", true);


                var iterator = -1;

                task.attr("transform", function(d, i) {
                    var move = 0;
                    iterator++;
                    if (i > 0) {
                        for (var j = 0; j < i; j++) {
                            //console.log(iterator, i, j);
                            move += width((task.data()[iterator-i+j]).spent);
                            //console.log("Adding width from block #" + (iterator-i+j) + " " + width((task.data()[iterator-i+j]).spent) + " to block #" + iterator );
                        }
                        return( "translate(" + move + ", 0)");
                    }
                });

                var taskDescription = day
                    .append("text")
                    .text(function(d) { return ("Spent " + Math.round((d.spent) / 60) + "hr " + (d.spent) % 60 + "min on " + d.task + " — " + d.description); })
                    .attr("x", "0")
                    .attr("y", "-5")
                    .classed("task-report__description", true);


                user.append("text")
                    .text(function(date) {/*console.log(date);*/ return (date.key + " " + Math.round((date.value.spent) / 60) + "hr " + (date.value.spent) % 60 + "min" )})
                    .attr("text-anchor", "end")
                    .attr("x", "-10")
                    .attr("y", "14");

            }


        },
        dataType: "JSON"
    });


    $.ajax({
        type: "GET",
        url:  "/api/tasks/report/projects/",
        data: "",
        complete: function(data){
            if (data.status == 201) {

                console.log(JSON.parse(data.responseText));
                var userReportData = JSON.parse(data.responseText).data;

                var spentData = [];
                userReportData.forEach (function(item) {
                    spentData.push(item.spentTotal);
                });

                //console.log(spentData);

                var projectReport = d3.select(".task-projectReport")
                    .append("svg")
                    .classed("task-projectReport__svg", true)
                    .attr("viewBox", "0 -100 800 600")
                    .append("g")
                    .attr("transform", "translate(0, "+ (svgDimentions.height) +")")
                    .append("g")
                    .attr("transform", "rotate(-45)");


                var margin = 50;
                var barThickness = 20;

                var barWidth = d3.scaleLinear()
                                .domain([0, d3.max(spentData)])
                                .range([0, svgDimentions.width-100]);

                var project = projectReport
                    .selectAll("g")
                    .data(userReportData.sort(function(a, b) {
                        if (a.spentTotal > b.spentTotal) {
                            return -1;
                        }
                        if (b.spentTotal > a.spentTotal) {
                            return 1;
                        }

                        return 0;
                    }))
                    .enter()
                    .append("g")
                    .classed("task-projectReport__project", true)
                    .attr("transform", function(data, i) {
                        return "translate(" + i*margin + ", " + i*margin + ")";
                    });

                project.append("rect")
                    .attr("height", barThickness)
                    .transition()
                    .duration(800)
                    .delay(function(d, i){
                        return 100*i;
                    })
                    .attr("fill", function(d, i) {
                        return svgColorScheme[i];
                    } )
                    .ease(d3.easeElasticOut)
                    .attr("width", function(d) {
                        return (100+barWidth(d.spentTotal));
                    });


                var smallBar = 10;

                project.append("text")
                    .text(function(d) {
                        return d.task + " — " + Math.round(d.spentTotal/60) + "hr " + d.spentTotal%60 + "min" ;
                    })
                    .attr("x", 20)
                    .attr("y", 12)
                    .style("font-size", "7px")
                    .style("opacity", 0)
                    .attr("fill", "white")
                    .transition()
                    .duration(600)
                    .delay(function(d, i){
                        return (100 + 100*i);
                    })
                    .style("opacity", 1);


                var day = project
                    .append("g")
                    .selectAll("g")
                    .data(function(project) {
                        return d3.entries(project.tasklist);
                    })
                    .enter()
                    .append("g")
                    .classed("task-projectReport__day", true);


                var dayBar = day
                    .append("rect")
                    .attr("width", function(d){ return (barWidth(d.value.spent) - 1); })
                    .attr("height", smallBar)
                    .attr("fill", "rgba(80, 80, 80, 1)")
                    .transition()
                    .duration(400)
                    .delay(function(d, i){
                        return (500 + 100*i);
                    })
                    .attr("y", -smallBar);

                var iterator = -1;

                day.attr("transform", function(d, i) {
                        var move = 0;
                        iterator++;
                        if (i > 0) {
                            for (var j = 0; j < i; j++) {
                                //console.log(day.data()[iterator-i+j]);
                                move += barWidth((day.data()[iterator-i+j]).value.spent);
                            }

                            return( "translate(" + (101 + move) + ", 0)");
                        } else {
                            return( "translate(" + (101) + ", 0)");
                        }
                    })
                    .style("opacity", 0)
                    .transition()
                    .duration(600)
                    .delay(function(d, i){
                        return (800 + 100*i);
                    })
                    .style("opacity", 1);

                day
                    .append("text")
                    .text(function(d) {
                            return (d.key);
                        })
                    .style("font-size", "7px")
                    .attr("y", function(d, i) {
                            return( -15 );
                        })
                    .classed("task-projectReport__date", true);

                var dayReport = d3.select(".task-projectReport")
                    .append("svg")
                    .classed("task-projectReport__daySvg", true)
                    .attr("viewBox", "0 0 400 400");

                day.on("click", function(tasks){
                    console.log(d3.values(tasks.value.tasks));

                    dayReport.selectAll("g").remove();

                    var dayReportTask = dayReport
                        .selectAll("g")
                        .data(d3.values(tasks.value.tasks))
                        .enter()
                        .append("g")
                        .attr("transform", function(d, i) {
                            return ("translate( 0 , " + (40 + 30*i) + " )");
                        });

                    var dayWidthArray = [];

                    d3.values(tasks.value.tasks).forEach(function(task) {
                        dayWidthArray.push(task.spent);
                    });


                    var dayWidth = d3.scaleLinear()
                        .domain([0, d3.max(dayWidthArray)])
                        .range([0, 200]);

                    dayReportTask
                        .append("rect")
                        .attr("height", 10)
                        .transition()
                        .duration(400)
                        .delay(function(d, i){
                            return (100*i);
                        })
                        .attr("width", function(d){
                            return dayWidth(d.spent);
                        });

                    dayReportTask
                        .append("text")
                        .attr("x", 0)
                        .attr("y", -5)
                        .text( function(d){
                            return (
								d.user + ' ' + Math.round(d.spent/60) + "hr " + d.spent%60 + "min — " + d.description
                            );
                        })
                        .style("font-size", "8px");

                });

                var tasksList = day
                    .append("g")
                    .classed("task-projectReport__daylist", true);



                //tasksList
                //    .selectAll("text")
                //    .data(function(d){
                //        console.log(d);
                //        return (d.value.tasks);
                //    })
                //    .enter()
                //    .append("text")
                //    .text(function(d) {
                //
                //        return (d.description);
                //    })
                //    .style("font-size", "7px")
                //    .attr("y", function(d, i) {
                //        return( -25 - i*10 );
                //    });


            }
        },
        dataType: "JSON"
    });


});