


// DATA



function randomData(samples) {
    var data = [],
        random = d3.randomNormal();

    for (let i = 0; i < samples; i++) {
        data.push({
            x: random(),
            y: random(),
            id: i,
        });
    }
    return data;
}

var data = randomData(8);

const radius = 8;



var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var zoom = d3.zoom()
    .scaleExtent([0.8, 10])
    .translateExtent([[-500, -500], [width + 500, height + 500]])
    .on("zoom", zoomed);

let xExtent = d3.extent(data, function (d) { return d.x; });
let yExtent = d3.extent(data, function (d) { return d.y; });
const stretch = 0.5

xExtent[0] -= stretch
xExtent[1] += stretch
yExtent[0] -= stretch
yExtent[1] += stretch


var x = d3.scaleLinear()
    .domain(xExtent).nice()
    .range([0, width]);

var y = d3.scaleLinear()
    .domain(yExtent).nice()
    .range([0, height]);

var xAxis = d3.axisBottom(x)
    .ticks((width + 2) / (height + 2) * 10)
    .tickSize(height)
    .tickPadding(8 - height);

var yAxis = d3.axisRight(y)
    .ticks(10)
    .tickSize(width)
    .tickPadding(8 - width);



var gX = svg.append("g")
    .attr("class", "axis axis--x")
    .call(xAxis);

var gY = svg.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis);

d3.select(".resetbutton")
    .on("click", resetted);


function zoomed() {
    scatter.attr("transform", d3.event.transform);
    gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
    gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
}

function resetted() {
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
}


var drag = d3.drag()
    .subject(function() {
        var t = d3.select(this);
        return {x: t.attr("cx"), y: t.attr("cy")};
    })
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
}

function dragged(d) {
    event = d3.event
    d3.select(this).attr("cx", event.x ).attr("cy", event.y);
    // d.x = x.invert(event.x)
    // d.y = y.invert(event.y)
    // updatePoints(0);
}

function dragended(d) {
    d.x = x.invert(d3.event.x)
    d.y = y.invert(d3.event.y)
    updatePoints(0);
    d3.select(this).classed("dragging", false);
    sendData(d)
}


svg.call(zoom);







var scatter = svg.append("g")
    .attr("id", "scatterplot");

scatter.selectAll(".dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot notSelected")
    .attr("opacity", 0.5)
    .attr("r", radius)
    .attr("cx", function (d) { return x(d.x); })
    .attr("cy", function (d) { return y(d.y); })
// .attr("pointer-events", "all")
    .call(drag);

// var t = scatter.transition().duration(100);


function updatePoints(transitionTime = 100){
    circles = scatter.selectAll("circle")
        .data(data)
        .transition(transitionTime)
        .attr("class",  "dot notSelected")
        .attr("r", radius)
        .attr("cx", function (d) { return x(d.x); })
        .attr("cy", function (d) { return y(d.y); })
        .attr("opacity", 0.5);
        // .attr("pointer-events", "all")
    // circles.call(drag)

    circles.filter(function(d) {
        return d.id == activNum;
    })
        .attr('class', 'dot Selected')
        .attr('r', radius+2);
}

// On Click, we want to add data to the array and chart
svg.on("click", function() {
    console.log("click");
    var coords = d3.mouse(this);

    // Normally we go from data to pixels, but here we're doing pixels to data
    data[activNum] = {
        x: xAxis.scale().invert(coords[0]),  // Takes the pixel number to convert to number
        y: yAxis.scale().invert(coords[1]),
        id: activNum,
    };
    sendData(data[activNum])
    updatePoints();
});


function buttonHTML(n){
    text = "<button class=\"button" +
        n +
        "\" type=\"button\" onclick=\"buttonClicked(" +
        n + ")\">" + n +"</button>\n";

    return text
}

var activNum = 1;
var node = document.getElementById('choicebuttons');
var nb_buttons = data.length;
var buttons = "";
for (i=0; i < nb_buttons; i++){
    buttons+=buttonHTML(i)
}

node.innerHTML = buttons;

function buttonClicked(b) {
    activNum = b;
    console.log(activNum)
    console.log(data[activNum])
    var t = d3.zoomIdentity.scale(2).translate(-x(data[activNum].x) + width/4, -y(data[activNum].y) + height/4);
    svg.transition()
        .duration(750)
        .call(zoom.transform, t);

    updatePoints(0)
}

function sendData(data){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:5000/receiver');
    xhr.setRequestHeader("Content-Type", "application/json");
    obj = JSON.stringify(data);
    console.log(obj)
    xhr.send(obj);
}

function updateWav(id){

}




