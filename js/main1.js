//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

//pseudo-global variables
var attrArray = ["HepB_2014", "Hib3_2014", "PAB_2014", "Polio_2014"];
var expressed = attrArray[0]; //initial attribute

var colorClasses = [
        "#D4B9DA",
        "#C994C7",
        "#DF65B0",
        "#DD1C77",
        "#980043"
    ];
var currentVariable = attrArray[0]; 
var currentColors = []; //array to hold the colors currently displayed on map
var currentArray = []; //array to hold scale currently being rendered on map
var jsonCountries;
var colorize; //colorscale generator
var mapWidth = 1000, mapHeight = 500; //set map container dimensions
var chartTitle; //dynamic title for chart
var chartLabels = []; //dynamic labels for chart
var squareWidth = 10; //width of rects in chart (in pixels)
var squareHeight = 25; //height of rects in chart (in pixels)
var chart; //create chart
var chartWidth = 900; //width of chart (in pixels)
var chartHeight = (squareHeight*6)+5; //set chart container dimensions
var scale; 
var description; //description of selected variable

//start script onload
window.onload = setMap();

//set up choropleth map
function setMap(){

	//map frame dimensions
    var width = window.innerWidth * 0.65,
        height = 460;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

	var projection = d3.geo.robinson()
    	.scale(150)
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
        });
        
    };

//function to create color scale generator
function makeColorScale(data){

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

	//create container for chart
	chart = d3.select("body")
		.append("svg")
		.attr("width", chartWidth)
		.attr("height", chartHeight)
		.attr("class", "chart");

// 	create chart title
// 	chartTitle = d3.select("body")
// 		.append("text")
// 		.attr("class", "chartTitle");

// 	chartLabels = d3.select("body")
// 		.append("div")
// 		.attr("class", "chartLabels");

	//append squares to the chart, one square to represent each country
	var squares = chart.selectAll(".square")
		.data(csvData)
		.enter()
		.append("rect")
		.attr("class", function(d){
			return "square " + d.GEOUNIT;
		})
		.attr("width", squareWidth+"px")
		.attr("height", squareHeight+"px");
		
		updateChart(squares, csvData.length, csvData);
};

function updateChart(squares, numSquares, csvData){
	colorize = makeColorScale(csvData);
	var xValue = 0; 
	var yValue = 0;
	var colorObjectArray = [];

	//create object array to hold a count of how many countries are in each class
	for (i = 0; i < colorClasses.length; i++) {
		var colorObject = {"color": colorClasses[i],"count":0} ;
		colorObjectArray.push(colorObject);			
	}

	var squareColor = squares.style("fill", function(d) {
			return choropleth(d, colorize);
		})
		.attr("x", function(d,i) {
			color = choropleth(d, colorize);
			//for loop arranges each class so that the squares are contiguous horizontally
			for (i = 0; i < colorObjectArray.length; i++) {
				if (colorObjectArray[i].color == color) {
					xValue = colorObjectArray[i].count*(squareWidth+1);
					colorObjectArray[i].count+=1;
				}
				if (color == "#ccc" || color == undefined) {
					xValue = -100000;
				}
			}
			return xValue;
		})
		.attr("y", function(d,i) {
			color = choropleth(d, colorize);
			// var xLocation = Parse(this);
			if (color == currentColors[0]) {
				return 0
			} else if (color == colorClasses[1]) {
				return (squareHeight+1);
			} else if (color == colorClasses[2]) {
				return (squareHeight+1)*2;
			} else if (color == colorClasses[3]) {
				return (squareHeight+1)*3;
			} else if (color == colorClasses[4]) {
				return (squareHeight+1)*4;
			} else if (color == currentColors[5]) {
				return (squareHeight+1)*5;
			}
			
		})
		.on("mouseover", highlight)
		.on("mouseout", dehighlight)
 		.on("mousemove", moveLabel);
	};
	
	
function highlight(csvData) {
	var properties = csvData.properties ? csvData.properties : csvData;
	
	d3.selectAll("."+properties.code3)
		.style("fill", "#f7eb3e");

	var labelAttribute = properties[currentVariable]+"<br>"+currentVariable;
	
	var labelName;
	if (properties.name_long == undefined) {
		labelName = properties.GEOUNIT;
	} else {
		labelName = properties.GEOUNIT;
	}
	
	if (Boolean(properties[currentVariable]) == true) {
		if (currentVariable == "HepB_2014") {
			labelAttribute = properties[currentVariable];
		} else if (currentVariable == "Hib3_2014") {
			labelAttribute = "1 in "+properties[currentVariable]+"<br>test"
		} else if (currentVariable == "PAB_2014") {
			labelAttribute = Math.round(properties[currentVariable])+"test"
		} else if (currentVariable == "Polio_2014") {
			labelAttribute = Math.round(properties[currentVariable])+"test"
		}; 
	} else { //if no data associated with selection, display "No data"
		labelAttribute = "No data";
	};


	var infoLabel = d3.select("body")
		.append("div")
		.attr("class", "infoLabel")
		.attr("id",properties.GEOUNIT+"label")
		.html(labelName)
		.append("div")
		.html(labelAttribute)
		.attr("class", "labelName");
};

function dehighlight(csvData) {
	var properties = csvData.properties ? csvData.properties : csvData;

	var selection = d3.selectAll("."+properties.GEOUNIT);

	var fillColor = selection.select("desc").text();
	selection.style("fill", fillColor);
	
	var deselect = d3.select("#"+properties.GEOUNIT+"label").remove(); //remove info label
};

function moveLabel(csvData) {

	//horizontal label coordinate based mouse position stored in d3.event
	var x = d3.event.clientX < window.innerWidth - 245 ? d3.event.clientX+10 : d3.event.clientX-210; 
	//vertical label coordinate
	var y = d3.event.clientY < window.innerHeight - 100 ? d3.event.clientY-75 : d3.event.clientY-175; 
	
	d3.select(".infoLabel") //select the label div for moving
		.style("margin-left", x+"px") //reposition label horizontal
		.style("margin-top", y+"px"); //reposition label vertical
};

})(); //last line of main.js
