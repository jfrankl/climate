'use strict';

var d3Chart = {};

d3Chart.create = function (el, data) {

    var margin = { top: 20, right: 80, bottom: 30, left: 50 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%Y").parse;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .interpolate("linear")
        .x(function(d) {
            return x(d.date);
        })
        .y(function(d) {
            return y(d.temperature);
        });

    var voronoi = d3.geom.voronoi()
        .x(function(d) {
            return x(d.date);
        })
        .y(function(d) {
            return y(d.temperature);
        })
        .clipExtent([
        [-margin.left, -margin.top],
        [width + margin.right, height + margin.bottom]
      ]);

    var area = d3.svg.area()
        .interpolate("linear")
        .x(function(d) {
            return x(d.date);
        })
        .y0(function(d) {
            return y(d.low);
        })
        .y1(function(d) {
            return y(d.high);
        });

    var mouseover = function(d) {
        console.log('over', d, d.city);
        d3.select('svg').classed("in", true);
        var selectedCity = d3.selectAll('.city-' + d.city)
            .classed("hover", true);
    };

    var mouseout = function(d) {
        console.log('out', d, d.city);
        d3.select('svg').classed("in", false);
        var allCities = d3.selectAll('.city')
            .classed("hover", false);
    };

    var makeVoronoi = function(d, cities) {
        d3.select(el).selectAll('.voronoi').remove();

        var voronoiGroup = d3.select(el).select('svg').append("g")
            .attr("class", "voronoi");

        voronoiGroup.selectAll("path")
            .data(voronoi(d3.nest()
                .key(function(d) { return d.city, d.date, y(d.temperature); })
                .rollup(function(v) { return v[0]; })
                .entries(d3.merge(cities.map(function(d) { return d.values; })))
                .map(function(d) { return d.values; })))
            .enter().append("path")
            .attr("d", function(d) {
                return "M" + d.join("L") + "Z";
            })
            .datum(function(d) {
                return d.point;
            })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);
    };

    var svg = d3.select(el).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

        data.forEach(function(d) { d.date = parseDate(d.date); });

        x.domain(d3.extent(data, function(d) { return d.date; }));

        var cities = color.domain().map(function(name) {
            return {
                name: name,
                values: data.map(function(d) {
                    return {
                        date: d.date,
                        temperature: +d[name].medium,
                        low: +d[name].low,
                        high: +d[name].high,
                        x: x(d.date),
                        city: name
                    };
                })
            };
        });

        y.domain([
            d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.low; }); }),
            d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.high; }); })
        ]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Temperature (ºC)");

        var poly = svg.selectAll(".poly")
            .data(cities, function(d) { return d.name; })
            .enter().append("g")
            .attr("class", "poly");

        poly.append("path")
            .attr("class", function(d) { return "area city city-" + d.name; })
            .attr("d", function(d) {
                return area(d.values);
            })
            .style("fill", function(d) { return color(d.name); });

        var indline = svg.selectAll(".indline")
            .data(cities, function(d) { return d.name; })
            .enter().append("g")
            .attr("class", "indline");

        indline.append("path")
            .attr("class", function(d) { return "line city city-" + d.name; })
            .attr("d", function(d) { return line(d.values); })
            .style("stroke", function(d) { return color(d.name); });

        makeVoronoi(data, cities);

    return this;

}

d3Chart.update = function (el, data) {

    var margin = { top: 20, right: 80, bottom: 30, left: 50 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%Y").parse;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .interpolate("linear")
        .x(function(d) {
            return x(d.date);
        })
        .y(function(d) {
            return y(d.temperature);
        });

    var voronoi = d3.geom.voronoi()
        .x(function(d) {
            return x(d.date);
        })
        .y(function(d) {
            return y(d.temperature);
        })
        .clipExtent([
        [-margin.left, -margin.top],
        [width + margin.right, height + margin.bottom]
      ]);

    var area = d3.svg.area()
        .interpolate("linear")
        .x(function(d) {
            return x(d.date);
        })
        .y0(function(d) {
            return y(d.low);
        })
        .y1(function(d) {
            return y(d.high);
        });

    var mouseover = function(d) {
        console.log('over', d, d.city);
        d3.select('svg').classed("in", true);
        var selectedCity = d3.selectAll('.city-' + d.city)
            .classed("hover", true);
    };

    var mouseout = function(d) {
        console.log('out', d, d.city);
        d3.select('svg').classed("in", false);
        var allCities = d3.selectAll('.city')
            .classed("hover", false);
    };

    var makeVoronoi = function(d, cities) {
        d3.select(el).selectAll('.voronoi').remove();

        var voronoiGroup = d3.select(el).select('svg').append("g")
            .attr("class", "voronoi");

        voronoiGroup.selectAll("path")
            .data(voronoi(d3.nest()
                .key(function(d) { return d.city, d.date, y(d.temperature); })
                .rollup(function(v) { return v[0]; })
                .entries(d3.merge(cities.map(function(d) { return d.values; })))
                .map(function(d) { return d.values; })))
            .enter().append("path")
            .attr("d", function(d) {
                return "M" + d.join("L") + "Z";
            })
            .datum(function(d) {
                return d.point;
            })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);
    };


    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

    data.forEach(function(d) { d.date = parseDate(d.date); });

    x.domain(d3.extent(data, function(d) { return d.date; }));

    var cities = color.domain().map(function(name) {
        return {
            name: name,
            values: data.map(function(d) {
                return {
                    date: d.date,
                    temperature: +d[name].medium,
                    low: +d[name].low,
                    high: +d[name].high,
                    x: x(d.date),
                    city: name
                };
            })
        };
    });

    y.domain([
        d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.low; }); }),
        d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.high; }); })
    ]);

    d3.select(el).selectAll(".poly").select('.area')
        .data(cities)
        .transition()
        .duration(500)
        .attr("d", function(d) { return area(d.values); })

    d3.select(el).selectAll(".indline").select('.line')
        .data(cities)
        .transition()
        .duration(500)
        .attr("d", function(d) { return line(d.values); })

    d3.select(el).select(".y.axis")
        .transition()
        .duration(550)
        .call(yAxis);

    makeVoronoi(data, cities);

    return this;

}

var nice;

d3.json('tempb.json', function (error, data) {
    nice = d3Chart.create('.link1', data);
})

var good;

d3.json('temp.json', function (error, data) {
    good = d3Chart.create('.link2', data);
})

function updateGraphOne (json) {
    d3.json(json, function (error, data) {
        nice.update('.link1', data);
    });
}

function updateGraphTwo (json) {
    d3.json(json, function (error, data) {
        good.update('.link2', data);
    });
}
