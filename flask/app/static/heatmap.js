var heat;
var heatPoints;

/*function createHeatMap(minPriceNormal, maxPriceNormal, minPrice, maxPrice) {
    heatmap = L.map("heatmap", {
        layers: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
        center: [-37.840935, 144.9631],
        zoom: 10,
        minZoom: 7,
        maxZoom: 20,
        zoomControl: false
    });
    heatmap.addControl(new L.Control.ZoomMin());

    heatPoints = [];
    for (var i = 0; i < listings.length; i++) {
        heatPoints.push([listings[i].lat, listings[i].long,
            getIntensity(listings[i].normalPrice, minPriceNormal, maxPriceNormal)]);
    }
    heat = L.heatLayer(heatPoints, {
        radius: 25,
        gradient: {0: 'blue', 0.25: 'lime', 0.5: 'yellow', 0.75: 'orange', 1: 'red'}
    });
    heat.addTo(heatmap);
    drawLegend(minPrice, maxPrice);
}*/

function updateHeatmap() {
    points = [];
    for (i = 0; i < listigIndice.length; i++) {
        points.push(heatPoints[listigIndice[i]])
    }
    heat.setLatLngs(points)
}
function getIntensity(price, min, max) {
    return (price - min) / (max - min);
}

function drawLegend(minPrice, maxPrice) {
//https://bl.ocks.org/HarryStevens/6eb89487fc99ad016723b901cbd57fde
    var data = [{"color": "blue", "value": 0}, {"color": "lime", "value": 0.25}, {
        "color": "yellow",
        "value": 0.5
    }, {"color": "orange", "value": 0.75}, {
        "color": "red",
        "value": 1
    }];
    var extent = d3.extent(data, d => d.value);

    var padding = 20;
    var width = 800;
    var innerWidth = width - (padding * 2);
    var barHeight = 8;
    var height = 28;

    var ticksText = {};
    step = (maxPrice - minPrice) / 5;
    for (i = 0; i <= 4; i++) {

        ticksText[(i * 0.25).toString()] = (i != 4 ? (parseInt(minPrice) + (step * (i))).toFixed(1) : maxPrice);
    }
    var xScale = d3.scaleLinear()
        .range([0, innerWidth])
        .domain(extent);

    var xTicks = data.map(d => d.value);


    var xAxis = d3.axisBottom(xScale)
        .tickSize(barHeight * 2)
        .tickFormat(function (d) {
            return ticksText[d];
        })
        .tickValues(xTicks);

    var svg = d3.select("#heatmap-legend").append("svg").attr("height", height).attr("width",width);
    
    var innerWidth = width - (padding * 2);
    var g = svg.append("g").attr("transform", "translate(" + padding + ", 0)");

    var defs = svg.append("defs");
    var linearGradient = defs.append("linearGradient").attr("id", "myGradient");
    linearGradient.selectAll("stop")
        .data(data)
        .enter().append("stop")
        .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
        .attr("stop-color", d => d.color);
    g.append("rect")
        .attr("width", innerWidth)
        .attr("height", barHeight)
        .style("fill", "url(#myGradient)");

    g.append("g")
        .call(xAxis)
        .select(".domain").remove();
}
