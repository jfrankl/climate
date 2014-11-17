// var margin = {top: 20, right: 20, bottom: 30, left: 50},
//     width = 960 - margin.left - margin.right,
//     height = 500 - margin.top - margin.bottom;

// var parseDate = d3.time.format("%Y%m%d").parse;

// var x = d3.time.scale()
//     .range([0, width]);

// var y = d3.scale.linear()
//     .range([height, 0]);

// var xAxis = d3.svg.axis()
//     .scale(x)
//     .orient("bottom");

// var yAxis = d3.svg.axis()
//     .scale(y)
//     .orient("left");

// var area = d3.svg.area()
//     .x(function(d) { return x(d.date); })
//     .y0(function(d) { return y(d.low); })
//     .y1(function(d) { return y(d.high); });

// var svg = d3.select("body").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// d3.csv("d.csv", function(error, data) {

//     console.log(data, 'no');


//   data.forEach(function(d) {
//     d.date = parseDate(d.date);
//     d.low = +d.low;
//     d.high = +d.high;
//   });

//   console.log(data, 'yes');

//   x.domain(d3.extent(data, function(d) { return d.date; }));
//   y.domain([d3.min(data, function(d) { return d.low; }), d3.max(data, function(d) { return d.high; })]);

//   svg.append("path")
//       .datum(data)
//       .attr("class", "area")
//       .attr("d", area);

//   svg.append("g")
//       .attr("class", "x axis")
//       .attr("transform", "translate(0," + height + ")")
//       .call(xAxis);

//   svg.append("g")
//       .attr("class", "y axis")
//       .call(yAxis)
//     .append("text")
//       .attr("transform", "rotate(-90)")
//       .attr("y", 6)
//       .attr("dy", ".71em")
//       .style("text-anchor", "end")
//       .text("Temperature (ºF)");
// });



     var graphic = d3.select(".g-chart"),
         dispatch = d3.dispatch("resize", "load");

     var nativeHeight = 570,
         margin = {
             top: 100,
             right: 10,
             bottom: 40,
             left: 0
         }

     var width = $("#g-graphic").width();

     var height = nativeHeight - margin.top - margin.bottom,
         fakeMarginRight = width < 300 ? 35 : 80;

     function resized() {
         var newGraphicWidth = graphic.node();
         width = Math.max(newGraphicWidth - margin.left - margin.right, 950);
         fakeMarginRight = width < 300 ? 35 : 80;
         dispatch.resize();data
     }
     // d3.select(window)
     //     .on("resize", resized);

     var currCodes = {
             Education: "0",
             Age: "0",
             Race: "0"
         },
         mainvar = "score_median",
         loc1 = 6,
         loc2 = 10,
         loc3 = 8.5,
         realData, realDataX;

     d3.csv("data.csv", function(error, data) {
         dispatch.load(data);
     });


     function trackEvent(category, action, opt_label, opt_value) {

         try {
             if (_gaq) {
                 _gaq.push(['_trackEvent', category, action, opt_label, opt_value]);
             }
         } catch (e) {

         }
     }

     function ordinal_suffix_of(i) {
         var j = i % 10,
             k = i % 100;
         if (j == 1 && k != 11) {
             return i + "st";
         }
         if (j == 2 && k != 12) {
             return i + "nd";
         }
         if (j == 3 && k != 13) {
             return i + "rd";
         }
         return i + "th";
     }

     function formatter(d) {
         return ordinal_suffix_of(d);
     }

     function roundedPounds(d) {

         return d3.format(".1f")(d / 16);
     }

     function moveTicks() {
         d3.selectAll(".y.axis .tick text")
             .attr("x", width - fakeMarginRight + 15)
             .attr("y", 0);
     }

     pounds = function(d, i) {

         if(d == 7.4){
            return "Avg.";
         }

         var desc = width < 600 ? "" : " at birth";
         return d + (d == 11 ? (" lbs." + desc) : "");
     }

     dispatch.on("load.data", function(data) {

         // everything is a number
         var keys = d3.keys(data[0])
         data.forEach(function(d) {
             keys.forEach(function(k) {
                 d[k] = +d[k];
             })
             d["ozb"] = (d["weight_range_top"] + d["weight_range_bottom"]) / 2 / 16;
         });

         var x = d3.scale.linear()
             .range([0, width - fakeMarginRight])
             .domain([.9, 12.4]);

         var y = d3.scale.linear()
             .range([height, 0])
             .domain([14, 100]);

         var line = d3.svg.line()
             .defined(function(d) {
                 return true;
                 return d[mainvar] != 0;
             })
             .x(function(d) {
                 return x(d.ozb);
             })
             .y(function(d) {
                 return y(d[mainvar]);
             });

         var polyPoints = function(d) {
             return d.map(function(d) {
                 return [x(d.x), y(d.val)].join(",");
             }).join(" ");
         };

         var xAxis = d3.svg.axis()
             .scale(x)
             .orient("bottom")
             .tickPadding(5)
             .tickFormat(pounds)
             .tickValues([2,3,4,5,6,7,7.4,8,9,10,11]);

         getData = function(name) {
             return selectedData.map(
                 function(d) {
                     return {
                         x: d["ozb"],
                         val: d[name],
                         bottomQ: d["score_p25"],
                         lower: d["weight_range_bottom"],
                         upper: d["weight_range_top"]
                     }
                 })
         }

         var selectedData = data.filter(function(d) {
             return d.Education === 0 & d.Age === 0 & d.Race === 0;
         });

         var yAxis = d3.svg.axis()
             .scale(y)
             .orient("left")
             .tickValues(d3.range(2, 5).map(function(x) {
                 return x * 20 - 10;
             }))
             .tickFormat(formatter)
             .tickPadding(5);

         var svg = d3.select("#chartsvg")
             .attr("height", height + margin.top + margin.bottom)
             .attr("width", "1050px")
             .append("g")
             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

         svg.append('rect')
             .attr("x", 0)
             .attr("y", 0)
             .attr("height", height)
             .attr("width", width)
             .attr("fill", "white")
             .attr("opacity", 0.01)

         var clip = svg.append("clipPath")
             .attr("id", "clip")
             .append("rect")
             .attr("width", width)
             .attr("height", height + margin.top + margin.bottom);

         var dotclip = svg.append("clipPath")
             .attr("id", "dotclip")
             .append("rect")
             .attr("width", width)
             .attr("height", height + margin.top + margin.bottom);

         var poly = getData("score_p25").concat(getData("score_p75").reverse());
         // console.log('poly', poly);
         var polys = svg.selectAll("polygon")
             .data([poly])
             .enter().append("polygon")
             .attr("points", polyPoints)
             .attr("fill", "#ddd")
             .attr('class', 'polygon')
             .attr('fill-opacity', .25)
             .attr("clip-path", "url(#clip)");

             // console.log("done");
             // console.log(polys);


         var yAxisContainer = svg.append("g")
             .attr("class", "y axis")
             .call(yAxis);

         moveTicks();

         var avg = svg.append("path")
             .datum(selectedData)
             .attr("class", "line")
             .attr("d", line)
             .attr("clip-path", "url(#clip)");

         var xAxisContainer = svg.append("g")
             .attr("class", "x axis")
             .attr("transform", "translate(0," + (height + 5) + ")")
             .call(xAxis);

         d3.selectAll(".x.axis .tick:nth-child(10) text")
             .style("text-anchor", function(d) {
                 return width < 600 ? "middle" : "start"
             })
             .attr("x", function(d) {
                 return width < 600 ? "10" : "-5"
             })

         var ticks = d3.selectAll(".y.axis .tick")[0],
             topTick = ticks[ticks.length - 1],
             tickPos = d3.select(topTick).select("text").attr("x");

         var extraLabel = d3.select(topTick)
             .append("text")
             .attr("x", tickPos)
             .attr("y", 0)
             .attr("dy", "1.42em")
             .attr("class", "g-extraLabel")

         // var yaxisLabel = d3.select(topTick)
         //     .selectAll("words")
         //     .data(["School", 'scores'])
         //     .enter()
         //     .append("g")
         //     .append("text")
         //     .attr("x", tickPos)
         //     .attr("y", 0)
         //     .attr("dy", function(d,i) {return -3.5 + (i * 1.2) + "em" })
         //     .attr("class", "g-yaxisLabel")
         //     .text(function(d, i){return width < 600 ? "" : d});

         var polyLabel = svg
             .selectAll("words")
             .data(["Middle", '50%'])
             .enter()
             .append("g")
             .append("text")
             .attr("class", "g-polyLabel")
             .text(function(d, i) {
                 return d
             });

         var captions = [
             ["Babies around", loc2 + " pounds", "scored in the", "55th percentile", "on average"].reverse(), ["Babies around", loc1 + " pounds", "scored in the", "42nd percentile", "on average"].reverse()
         ];

         function getLoc(d, i) {
             return getPos(i);
         }

         function getNearPoint(val) {
             return getData(mainvar)
                 .filter(function(d) {
                     return (val >= d.lower / 16) & (val <= d.upper / 16);
                 })
         }

         function getPos(i) {
             var val = i == 0 ? loc2 : loc1;
             var lab1pos = getNearPoint(val)
             return "translate(" + (x(lab1pos[0].x)) + "," + (y(lab1pos[0].val) - 40) + ")"
         }


         var dots = svg.append("g")
             .attr("clip-path", "url(#dotclip)")
             .attr("class", "dotHolder")
             .selectAll(".g-dot")
             .data(selectedData)
             .enter().append("circle")
             .attr("class", function(d, i) {
                 return "g-dot g-dot" + i
             })
             .attr("fill", "#bad80a")
             .attr("cx", function(d, i) {
                 return x(d.ozb);
             })
             .attr("cy", function(d) {
                 return y(d[mainvar]);
             })

         var annotations = svg.selectAll("annotations")
             .data(captions)
             .enter()
             .append("g")
             .attr("class", "annotation")
             .attr("text-anchor", function(d, i) {
                 return i == 0 ? "start" : "end"
             })
             .attr("transform", getLoc)

         annotations
             .append("line")
             .attr("x1", 0)
             .attr("y1", 12)
             .attr("x2", 0)
             .attr("y2", 30)
             .attr("stroke-width", .5)
             .attr("stroke", "black");

         annotations.selectAll("littleText")
             .data(function(d, i) {
                 return d
             })
             .enter().append("text")
             .attr("dy", function(d, i) {
                 return i * -20
             })
             .attr("dx", function(d, i) {
                 return this.parentNode.__data__[3][0] == loc1 ? 10 : -10 // really bad.
             })
             .text(function(d) {
                 return d;
             })
             .attr("class", function(d, i) {
                 return (i == 1 | i == 3) ? "g-label-bold" : "g-label"
             })



         d3.selectAll(".y.axis .tick:nth-child(2) line")
             .style("stroke", "darkgrey")


         var buttons = d3.selectAll(".g-demo")
             .on("click", function(d) {
                 currCodes[this.getAttribute("data-demo")] = this.getAttribute("data-code");
                 selectChart(currCodes.Age, currCodes.Education, currCodes.Race);
                 trackEvent('birthWeight', 'click', currCodes.Age + currCodes.Education + currCodes.Race);
             });

         function updateButtons() {

             d3.selectAll(".g-list").each(function() {
                 d3.select(this).selectAll(".g-demo")
                     .classed("selected", function() {
                         return currCodes[this.getAttribute("data-demo")] === this.getAttribute("data-code")
                     });
             });

             // can't be a young college grad.
             d3.select(".g-young").classed("disabled", currCodes.Education == 4);
             d3.select(".g-college").classed("disabled", currCodes.Age == 1);

             // asians are too thin to do 3-way breakdowns?




         }


         chartResize()

         function updateChart(age, educ, race, ttime) {

             ttime = ttime ? ttime : 500;

             currCodes.Age = age;
             currCodes.Education = educ;
             currCodes.Race = race;

             selectedData = data.filter(function(d) {
                 return d.Education == educ & d.Age == age & d.Race == race;
             })

             moveTicks();

             annotations
                 .transition()
                 .duration(ttime)
                 .attr("transform", getLoc)

             var anno0Loc = y(getNearPoint(loc1)[0].val);
             d3.selectAll(".interactive-leadin").classed("veryFaint", anno0Loc < 250);
             d3.select("#story-header").classed("veryFaint", anno0Loc < 250);
             d3.select("#nytint-upshot-nameplate").classed("veryFaint", anno0Loc < 200);


             d3.selectAll(".annotation text:nth-child(3)").text(
                 function(d, i) {
                     var pctl = Math.round(getNearPoint(i == 0 ? 10 : 6)[0].val);
                     return ordinal_suffix_of(pctl) + " percentile"
                 }
             )

             poly = getData("score_p25")
                 .concat(getData("score_p75").reverse())

             polys
                 .data([poly])
                 .transition()
                 .duration(ttime)
                 .attr("points", polyPoints);

             // console.log(polys);

             avg
                 .datum(selectedData)
                 .transition()
                 .duration(ttime)
                 .attr("d", line);

             dots
                 .data(selectedData)
                 .attr("r", function(d) {
                     return d.fake == 1 ? 0 : (width < 600 ? 1 : 3.1);
                 })

             dots
                 .transition()
                 .duration(ttime)
                 .attr("cx", function(d, i) {
                     return x(d.ozb);
                 })
                 .attr("cy", function(d) {
                     return y(d[mainvar]);
                 });

             polyLabel
                 .transition()
                 .duration(ttime)
                 // .style("opacity", (age + race + educ == 0) ? .6 : .6)
                 .attr("x", x(loc3))
                 .attr("y", y(getNearPoint(loc3)[0].bottomQ))
                 .attr("dy", function(d, i) {
                     return -2.5 + (i * 1.2) + "em"
                 })

             realData = selectedData.filter(function(d) {
                 return d.fake === 0;
             });

             realDataX = d3.extent(realData, function(d) {
                 return d.ozb;
             });

             clip
                 .attr("x", x(realDataX[0]) - 1)
                 .attr("width", x(realDataX[1]) - x(realDataX[0]) + 2)

             dotclip
                 .attr("x", x(realDataX[0]) - 4)
                 .attr("width", x(realDataX[1]) - x(realDataX[0]) + 8);

             // console.log('done');

         }

         function selectChart(age, educ, race) {
             updateChart(age, educ, race);
             updateButtons();
         }

         function turnOffTooltip() {
             d3.select(".tooltip")
                 .style("left", -9999 + "px")
                 .style("top", -9999 + "px")
         }




         svg.on("mousemove", function() {

             var mouse = d3.mouse(this);
             // // var mouse = d3.select("#g-graphic").node()

             var m = findClosestLine(mouse),
                 i = m[0],
                 crow = m[1];

             d3.selectAll(".highlightDot")
                 .attr("r", 3.1)
                 .classed("highlightDot", false);

             if (crow < 8000) {
                 var thisdot = selectedData[i];

                 if (thisdot.fake == 0) {
                     d3.select(".g-dot" + i)
                         .classed("highlightDot", true)
                         .attr("r", 4);

                     // var dotx = x(thisdot.ozb),
                     //     doty = y(thisdot.score_average);

                     d3.select(".tooltip")
                         .style("left", Math.min(Math.max((mouse[0] - 60), 0), width - 110) + "px")
                         .style("top", (mouse[1]) + "px")

                     d3.select(".g-pctl")
                         .html(ordinal_suffix_of(Math.round(thisdot[mainvar])) + " percentile")
                     d3.select(".g-weight")
                         .html(roundedPounds(thisdot.weight_range_bottom) + " to " +
                             roundedPounds(thisdot.weight_range_top) + " pounds");
                 }

             } else {
                 turnOffTooltip();
             }
         });

         svg.on("mouseout", function() {

             d3.selectAll(".highlightDot")
                 .attr("r", 3.1)
                 .classed("highlightDot", false);

             turnOffTooltip();
         });


         function findClosestLine(m) {

             var dist = Infinity,
                 crowdist = 0,
                 i = 0,
                 match = "",
                 delta;

             selectedData.forEach(function(d, i) {

                 crow = Math.pow(m[0] - x(d.ozb), 2) + Math.pow(m[1] - y(d[mainvar]), 2);
                 delta = Math.abs(m[0] - x(d.ozb));

                 if (delta < dist) {
                     dist = delta;
                     crowdist = crow;
                     match = i;
                 }

             })

             return [match, crowdist];
         }


         dispatch.on("resize.data", chartResize);

         function chartResize() {

             x.range([0, width - fakeMarginRight]);
             xAxisContainer.call(xAxis);

             yAxis.tickSize(-(width - fakeMarginRight + 5))
             yAxisContainer.call(yAxis);
             moveTicks();

             extraLabel
                 .text(width < 600 ? "pctl." : "percentile");

             updateChart(currCodes.Age, currCodes.Education, currCodes.Race, .01);
             updateButtons();

         }


     });
