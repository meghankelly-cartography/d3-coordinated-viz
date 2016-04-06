//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

//pseudo-global variables
var attrArray = ["HepB_2014", "Hib3_2014", "PAB_2014", "Polio_2014"];
var expressed = attrArray[0]; //initial attribute

//start script onload
window.onload = setMap();

//set up choropleth map
function setMap(){

	//map frame dimensions
    var width = 960,
        height = 500;

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

        //add enumeration units to the map
        setEnumerationUnits(worldCountries, map, path);
        
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
       	
function setEnumerationUnits(worldCountries, map, path){
    //add countries
    var countries = map.selectAll(".countries")
        .data(worldCountries)
        .enter()
        .append("path")
        .attr("class", function(d){
            return "countries " + d.properties.geounit;
         })
        .attr("d", path);
	
	  console.log(worldCountries)
};



})(); //last line of main.js
