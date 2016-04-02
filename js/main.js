window.onload = setMap();

//set up choropleth map
function setMap(){
	//use queue.js to load data simultaneously
	d3_queue.queue()
        .defer(d3.csv, "data/Countries_vac.csv") //load attributes from csv
        .defer(d3.topojson, "data/worldData.topojson") //load choropleth spatial data
        .await(callback);
	
	console.log("Meghan");
                
    function callback(error, csvData, world){
       console.log("Meghan");
       console.log(error);
	   console.log(csvData);
	   console.log(world);
  
    	console.log("Meghan");
        //translate world TopoJson
        var worldCountries = topojson.feature(world, world.objects.worldCountries).features;

        console.log(worldCountries);
    };        
};