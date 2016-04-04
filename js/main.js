window.onload = setMap();

//set up choropleth map
function setMap(){

//map frame dimensions
//     var width = 960,
//         height = 460;
// 
//     //create new svg container for the map
//     var map = d3.select("body")
//         .append("svg")
//         .attr("class", "map")
//         .attr("width", width)
//         .attr("height", height);
// 
//     //create Albers equal area conic projection centered on France
//     var projection = d3.geo.albers()
//         .center([0, 0])
//         .rotate([-2, 0, 0])
//         .parallels([45, 45])
//         .scale(2500)
//         .translate([width / 2, height / 2]);
//         
//     var path = d3.geo.path()
//         .projection(projection);

	//use queue.js to load data simultaneously
	d3_queue.queue()
        .defer(d3.csv, "data/Countries_vac2.csv") //load attributes from csv
        .defer(d3.json, "data/mapbase.topojson") //load background spatial data
		.defer(d3.json, "data/map.topojson") //load choropleth spatial data
        .await(callback);
	
	console.log("Meghan");
                
    function callback(error, csvData, base, world){
       	console.log("Meghan");
      	console.log(error);
	   	console.log(csvData);
	   	console.log(world);
  
       	//translate world TopoJson
       	var baseMap = topojson.feature(base, base.objects.Countries_base),
			worldCountries = topojson.feature(world, world.objects.Countries).features;

		console.log(baseMap);
        console.log(worldCountries);
        
        console.log("One more test!");

    };        
};