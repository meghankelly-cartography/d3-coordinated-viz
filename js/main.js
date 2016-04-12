//wrap everything in a self-executing anonymous function to move to local scope
(function(){

//pseudo-global variables
var attrArray = ["HepB_2014", "Hib3_2014", "PAB_2014", "Polio_2014"];
var expressed = attrArray[0]; //initial attribute


//chart frame dimensions
var chartWidth = window.innerWidth * 0.425,
    chartHeight = 473,
    leftPadding = 25,
    rightPadding = 2,
    topBottomPadding = 5,
    chartInnerWidth = chartWidth - leftPadding - rightPadding,
    chartInnerHeight = chartHeight - topBottomPadding * 2,
    translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

//create a scale to size bars proportionally to frame and for axis
var yScale = d3.scale.linear()
    .range([463, 0])
    .domain([0, 110]);

//start script onload
window.onload = setMap();

//set up choropleth map
function setMap(){

	//map frame dimensions
    var width = window.innerWidth * 0.65,
        height = 1000;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

	var projection = d3.geo.robinson()
    	.scale(300)
    	.translate([width / 2, height / 2])
    	.precision(.1);
        
    var path = d3.geo.path()
        .projection(projection);

	//use queue.js to load data simultaneously
	d3_queue.queue()
        .defer(d3.csv, "data/Countries_vac2.csv") //load attributes from csv
		.defer(d3.json, "data/map.topojson") //load choropleth spatial data
        .await(callback);
	                
    function callback(error, csvData, world){
  
       	//place graticule on the map
        setGraticule(map, path);
       	
       	//translate world TopoJson
       	var worldCountries = topojson.feature(world, world.objects.collection).features;
       	
       	//join csv data to GeoJSON enumeration units
       	worldCountries = joinData(worldCountries, csvData);

        //create the color scale
        var colorScale = makeColorScale(csvData);
        
        //add enumeration units to the map
        setEnumerationUnits(worldCountries, map, path, colorScale);
        
        //add coordinated visualization to the map
        setChart(csvData, colorScale);
        
        createDropdown(csvData);
        
    };
}; //end of setMap()

function setGraticule(map, path){
// 	   	graticule generator
//         var graticule = d3.geo.graticule()
//             .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude
// 
//         create graticule lines
//         var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
//             .data(graticule.lines()) //bind graticule lines to each element to be created
//             .enter() //create an element for each datum
//             .append("path") //append each element to the svg as a path element
//             .attr("class", "gratLines") //assign class for styling
//             .attr("d", path); //project graticule lines 
}; //end of setGraticule

function joinData(worldCountries, csvData){

	//loop through csv to assign each set of csv attribute values to geojson region
    for (var i=0; i<csvData.length; i++){
    	
        var csvCountry = csvData[i]; //the current region
        var csvKey = csvCountry.GEOUNIT; //the CSV primary key

        //loop through geojson regions to find correct region
        for (var a=0; a<worldCountries.length; a++){

            var geojsonProps = worldCountries[a].properties; //the current region geojson properties
            var geojsonKey = geojsonProps.geounit; //the geojson primary key

            //where primary keys match, transfer csv data to geojson properties object
            if (geojsonKey == csvKey){

                //assign all attributes and values
                attrArray.forEach(function(attr){
                    var val = parseFloat(csvCountry[attr]); //get csv attribute value
                    geojsonProps[attr] = val; //assign attribute and value to geojson properties
                });
            };
        };
    };
    
    return worldCountries;
};
       	
function setEnumerationUnits(worldCountries, map, path, colorScale){
    //add countries
    var countries = map.selectAll(".countries")
        .data(worldCountries)
        .enter()
        .append("path")
        .attr("class", function(d){
            return "countries " + d.properties.geounit;
         })
        .attr("d", path)
        .style("fill", function(d){
            return choropleth(d.properties, colorScale);
        })
        
        //**not sure what's going on here
        .on("mouseover", function(d){
            highlight(d.properties);
        })
        .on("mouseout", function(d){
            dehighlight(d.properties);
        })
        //add style descriptor to each path
    	var desc = countries.append("desc")
        	.text('{"stroke": "#000", "stroke-width": "0.5px"}');
    };

//function to create color scale generator
function makeColorScale(data){
    var colorClasses = [
        "#eff3ff",
        "#bdd7e7",
        "#6baed6",
        "#3182bd",
        "#08519c"
    ];

    //create color scale generator
    var colorScale = d3.scale.quantile()
        .range(colorClasses);

    //build array of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    };

    //assign array of expressed values as scale domain
    colorScale.domain(domainArray);

    return colorScale;
};

//function to test for data value and return color
function choropleth(props, colorScale){
	//make sure attribute value is a number
	var val = parseFloat(props[expressed]);
	//if attribute value exists, assign a color; otherwise assign gray
	if (val && val != NaN){
		return colorScale(val);
	} else {
		return "#CCC";
	};
};

//function to create coordinated bar chart
function setChart(csvData, colorScale){

    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");
        
   	//create a rectangle for chart background fill
    var chartBackground = chart.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);

    //set bars for each province
    var bars = chart.selectAll(".bar")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return b[expressed]-a[expressed]
        })
        .attr("class", function(d){
            return "bar " + d.GEOUNIT;
        })
        .attr("width", chartInnerWidth / csvData.length - 1)
        
        //**not sure what's going on here
        .on("mouseover", highlight)
        .on("mouseout", dehighlight)
        
        //**not sure what's going on here
        var desc = bars.append("desc")
        	.text('{"stroke": "none", "stroke-width": "0px"}');
        
    //create a text element for the chart title
    var chartTitle = chart.append("text")
        .attr("x", 20)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text(" " + expressed + " Vaccinations by Country");
        
    //create vertical axis generator
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");
        
    //place axis
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);
        
    //create frame for chart border
    var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);
        
    //set bar positions, heights, and colors
    updateChart(bars, csvData.length, colorScale);
};

//function to create a dropdown menu for attribute selection
function createDropdown(csvData){
	//add select element
	var dropdown = d3.select("body")
		.append("select")
		.attr("class", "dropdown")
		//
		.on("change", function(){
            changeAttribute(this.value, csvData)
        });

	//add initial option
	var titleOption = dropdown.append("option")
		.attr("class", "titleOption")
		.attr("disabled", "true")
		.text("Select Attribute");

	//add attribute name options
	var attrOptions = dropdown.selectAll("attrOptions")
		.data(attrArray)
		.enter()
		.append("option")
		.attr("value", function(d){ return d })
		.text(function(d){ return d });
};

function changeAttribute(attribute, csvData){
    //change the expressed attribute
    expressed = attribute;

    //recreate the color scale
    var colorScale = makeColorScale(csvData);

    //recolor enumeration units
    var regions = d3.selectAll(".countries")
    	.transition()
        .duration(500)
        .style("fill", function(d){
            return choropleth(d.properties, colorScale)
        });

    //re-sort, resize, and recolor bars
    var bars = d3.selectAll(".bar")
        //re-sort bars
        .sort(function(a, b){
            return b[expressed] - a[expressed]
        });
// Animate chart
//         .transition() //add animation
//         .delay(function(d, i){
//             return i * 20
//         })
//         .duration(500);

    updateChart(bars, csvData.length, colorScale);
};

//function to position, size, and color bars in chart
function updateChart(bars, n, colorScale){
    //position bars
    bars.attr("x", function(d, i){
            return i * (chartInnerWidth / n) + leftPadding;
        })
        //size/resize bars
        .attr("height", function(d, i){
            return 463 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        //color/recolor bars
        .style("fill", function(d){
            return choropleth(d, colorScale);
        });
        
        //at the bottom of updateChart()...add text to chart title
    var chartTitle = d3.select(".chartTitle")
     	.text("Number of  " + expressed + " vaccinations by country");
};

//function to highlight enumeration units and bars
function highlight(props){
    //change stroke
    var selected = d3.selectAll("." + props.GEOUNIT)
        .style({
            //"stroke": "#DD1C77",
            "fill": "#980043",
            //"stroke-width": "2"
        });
};

//function to reset the element style on mouseout
function dehighlight(props){
    var selected = d3.selectAll("." + props.GEOUNIT)
        .style({
            "stroke": function(){
                return getStyle(this, "stroke")
            },
            "stroke-width": function(){
                return getStyle(this, "stroke-width")
            }
        });

    function getStyle(element, styleName){
        var styleText = d3.select(element)
            .select("desc")
            .text();

        var styleObject = JSON.parse(styleText);

        return styleObject[styleName];
    };
};

})(); //last line of main.js
