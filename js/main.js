window.onload = setMap();

//set up choropleth map
function setMap(){

	//map frame dimensions
    var width = 960,
        height = 960;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);
        
// Projection Option 1
//     var projection = d3.geo.cylindricalEqualArea()
//     	.scale(153)
//    		.translate([width / 2, height / 2])
//     	.precision(.1);

    var projection = d3.geo.azimuthalEqualArea()
    	.clipAngle(180 - 1e-3)
    	.scale(237)
    	.translate([width / 2, height / 2])
    	.precision(.1);
        
    var path = d3.geo.path()
        .projection(projection);

	//use queue.js to load data simultaneously
	d3_queue.queue()
        .defer(d3.csv, "data/Countries_vac2.csv") //load attributes from csv
		.defer(d3.json, "data/map.topojson") //load choropleth spatial data
        .await(callback);
	
	console.log("Meghan");
                
    function callback(error, csvData, world){
	   	
	   	// graticule generator
        var graticule = d3.geo.graticule()
            .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

        //create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines
  
       	//translate world TopoJson
       	var worldCountries = topojson.feature(world, world.objects.collection).features;

        console.log(worldCountries);
        
        console.log("One more test!");

        //add countries
        var countries = map.selectAll(".regions")
            .data(worldCountries)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "regions " + d.properties.geounit;
            })
            .attr("d", path);

    };        
};