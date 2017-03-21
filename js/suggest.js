$(function() {

    var svgDimentions = {
        width: 500,
        height: 500
    };


    var radarData = [
        86.5,
        100,
        22.75,
        17.33,
        16,
        26.5
    ];


    var radarGraph = d3.selectAll(".th-radar__graph")
        .selectAll("svg")
        .append("g");

    var radarGraphCircle__gray = radarGraph
        .append("circle")
        .attr("cx", 100)
        .attr("cy", 100)
        .attr("r", 70)
        .attr("stroke-width", "60")
        .classed("th-radar__circle", true)
        .classed("_gray", true);

    var circleLength = 140 * Math.PI;

    var radarGraphCircle = radarGraph
        .append("circle")
        .attr("cx", 100)
        .attr("cy", 100)
        .attr("r", 70)
        .attr("stroke-width", "60")
        .attr("stroke-dasharray", circleLength/4*3.5)
        .classed("th-radar__circle", true);

    var radarGraphCircleGrad = radarGraph
        .append("circle")
        .attr("cx", 100)
        .attr("cy", 100)
        .attr("r", 70)
        .attr("stroke-width", "60")
        .attr("stroke-dasharray", circleLength/4*3.5)
        .classed("th-radar__grad", true);

    console.log(radarGraphCircle.node());


    radarGraph.on("click", function(radarData) {
        console.log("Updating…");
        updateRadar(Math.random()*100);
    });


    var moving = d3.selectAll(".movable")
        .attr("transform", "translate(0, 0)")
        .transition()
        .duration(200)
        .attr("transform", "translate(0, 5)")
        .transition()
        .duration(500)
        .attr("transform", "translate(0, 0)");



});