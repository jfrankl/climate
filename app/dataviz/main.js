var margin = {
    top: 20,
    right: 80,
    bottom: 30,
    left: 50
  },
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
    console.log(d.date);
    return x(d.date);
  })
  .y(function(d) {
    console.log(d.temperature);
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

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function mouseover(d) {
  d3.select('svg').classed("in", true);
  var selectedCity = d3.selectAll('.city-'+d.city)
    .classed("hover", true);
}

function mouseout(d) {
  d3.select('svg').classed("in", false);
  var allCities = d3.selectAll('.city')
    .classed("hover", false);
}

d3.json("temp.json", function(error, data) {

  color.domain(d3.keys(data[0]).filter(function(key) {
    return key !== "date";
  }));

  data.forEach(function(d) {
    d.date = parseDate(d.date);
  });

  x.domain(d3.extent(data, function(d) {
    return d.date;
  }));

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
    d3.min(cities, function(c) {
      return d3.min(c.values, function(v) {
        return v.low;
      });
    }),
    d3.max(cities, function(c) {
      return d3.max(c.values, function(v) {
        return v.high;
      });
    })
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
    .data(cities, function(d) {
      return d.name;
    })
    .enter().append("g")
    .attr("class", "poly");

  poly.append("path")
    .attr("class", function(d) {
      return "area city city-" + d.name;
    })
    .attr("d", function(d) {
      return area(d.values);
    })
    .style("fill", function(d) { return color(d.name); });

  var indline = svg.selectAll(".indline")
    .data(cities, function(d) {
      return d.name;
    })
    .enter().append("g")
    .attr("class", "indline");

  indline.append("path")
    .attr("class", function(d) {
      return "line city city-" + d.name;
    })
    .attr("d", function(d) {
      return line(d.values);
    })
    .style("stroke", function(d) {
      return color(d.name);
    });

  indline.append("text")
    .datum(function(d) {
      return {
        name: d.name,
        value: d.values[d.values.length - 1]
      };
    })
    .attr("transform", function(d) {
      return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")";
    })
    .attr("x", 3)
    .attr("dy", ".35em")
    .text(function(d) {
      return d.name;
    });

  var voronoiGroup = svg.append("g")
    .attr("class", "voronoi");

  voronoiGroup.selectAll("path")
    .data(voronoi(d3.nest()
      .key(function(d) {
        return d.city, d.date, y(d.temperature);
      })
      .rollup(function(v) {
        return v[0];
      })
      .entries(d3.merge(cities.map(function(d) {
        return d.values;
      })))
      .map(function(d) {
        return d.values;
      })))
    .enter().append("path")
    .attr("d", function(d) {
      return "M" + d.join("L") + "Z";
    })
    .datum(function(d) {
      return d.point;
    })
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);
});

function updateData(file) {

  d3.json(file, function(error, data) {

    color.domain(d3.keys(data[0]).filter(function(key) {
      return key !== "date";
    }));

    data.forEach(function(d) {
      d.date = parseDate(d.date);
    });

    x.domain(d3.extent(data, function(d) {
      return d.date;
    }));

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
      d3.min(cities, function(c) {
        return d3.min(c.values, function(v) {
          return v.low;
        });
      }),
      d3.max(cities, function(c) {
        return d3.max(c.values, function(v) {
          return v.high;
        });
      })
    ]);

    var polygons = d3.selectAll(".poly").select('.area');

    polygons
      .data(cities)
      .transition()
      .duration(500)
      .attr("d", function(d) {
        return area(d.values);
      })

    d3.selectAll('.voronoi').remove();

    var voronoiGroup = svg.append("g")
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

    var polygons = d3.selectAll(".indline");

    var man = polygons.select('.line');

    man
      .data(cities)
      .transition()
      .duration(500)
      .attr("d", function(d) {
        return line(d.values);
      })

    svg.select(".y.axis")
      .transition()
      .duration(550)
      .call(yAxis);

    var indline = svg.selectAll(".indline")
      .data(cities, function(d) {
        return d.name;
      })
      .enter().append("g")
      .attr("class", "indline");

    indline.append("path")
      .attr("class", "line")
      .attr("d", function(d) {
        return line(d.values);
      })
      .style("stroke", function(d) {
        return color(d.name);
      });

    indline.append("text")
      .datum(function(d) {
        return {
          name: d.name,
          value: d.values[d.values.length - 1]
        };
      })
      .attr("transform", function(d) {
        return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")";
      })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function(d) {
        return d.name;
      });

  });


}
