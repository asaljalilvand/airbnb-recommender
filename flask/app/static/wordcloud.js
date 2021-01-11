//https://bl.ocks.org/jyucsiro/767539a876836e920e38bc80d2031ba7
var svgContainer;
var width = 420;
var height = 420;

function initializeWordCloudSVG() {
    svgContainer = d3.select("#wordcloud").append("svg")
        .attr('class', 'wordcloud')
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .property("id", 'wordcloudSVG')
        .attr("transform", "translate(" + [width >> 1, height >> 1] + ")");
    d3.select("#wc-title").html('').style("visibility", "hidden");

}

function clearWordCloud() {
    d3.select("#wordcloudSVG").selectAll("*").remove();
    d3.select("#wc-title").style("visibility", "hidden");
    d3.select("#power-gauge").style("visibility", "hidden");
}

function drawWordCloud(word_count) {
    var fill = d3.scaleLinear()
        .range(["#fc794b", "#81d70a"])
        .interpolate(d3.interpolateHcl)
        .domain([-1, 1]);

    var word_entries = d3.entries(word_count['value']);
    var sentimentPerWord = word_count['sentiment'];

    var xScale = d3.scaleLinear()
        .domain([0, d3.max(word_entries, function (d) {
            return d.value;
        })
        ])
        .range([10, 100]);

    d3.layout.cloud().size([width, height])
        .timeInterval(20)
        .words(word_entries)
        .fontSize(function (d) {
            return xScale(+d.value);
        })
        .text(function (d) {
            return d.key;
        })
        .rotate(function () {
            return ~~(Math.random() * 2) * 90;
        })
        .font("Impact")
        .on("end", draw)
        .start();

    function draw(words) {
        d3.select("#wc-title").style("visibility", "visible");
        d3.select("#power-gauge").style("visibility", "visible");
        svgContainer.selectAll("*").remove();
        svgContainer.selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function (d) {
                return xScale(d.value) + "px";
            })
            .style("font-family", "Impact")
            .style("fill", function (d) {
                return fill(sentimentPerWord[d.key]);
            })
            .attr("text-anchor", "middle")
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) {
                return d.key;
            });
    }

    d3.layout.cloud().stop();
}