window.onload = function(){
	//set variable w and h
	var w = 1000, h =550;

	//use d3.method to access <body> element in DOM
	var container = d3.select("body")
		//add new svg in the body
		//place each method goes on its own line
		.append("svg")
		//call variables w and h to assign height and width of svg
		.attr("width", w)
		.attr("height", h)
		//give class name the same name as variable
		.attr("class", "container");

	//add second element to the body by apending it to the svg container above
	var rectangle = container.append("rect")
		//define data with datum method
		.datum(450)
		//giving an anonymous function to apply datum to height and width
		.attr("width", function(d){
			return d * 2;
		})
		.attr("height", function(d){
			return d;
		})
		//give class name the same name as variable
		.attr("class", "rectangle")
		//adjust centering
		//0,0 is in the upper left corner of svg
		//this can also be done in the style sheet
		.attr("x", 50)
		.attr("y", 50);
		
	//create array for city and population data
	//D3 can only work with arrays
	var cityPop = [
        {
            city: 'Portland',
            population: 609456
        },
        { 
            city: 'San Francisco',
            population: 837442
        },
        {
            city: 'Eugene',
            population: 159190
        },
        {
            city: 'Oakland',
            population: 406253
        },
    ];

	//define the min value of cityPop data
	//this will be used in the linear scaling
	var minPop = d3.min(cityPop, function(d){
		return d.population;
	});
	
	//define the max value of cityPop data
	//this will be used in the linear scaling
	var maxPop = d3.max(cityPop, function(d){
		return d.population;
	});
	
	//a generator, custom function that will scale data along y axis
	var y = d3.scale.linear()
		//set range and domain as constraints to data
		.range([495, 95])
		.domain([0, 900000]);

	//a generator, a custom function that will place data along particular range
	var x = d3.scale.linear()
		.range([120,810])
		.domain([0, 3]);
	
	//a generator, a custom function that will color data circles based on their linear relationship
	var color = d3.scale.linear()
		//colors reflect attribute values, think unclassed choropleth/proportional symbols
		//set beginning and end hues, color values with mix between the two
		.range(["#FFF", "#542d44"])
		//set domain to minimum value and maximum population value
		.domain([minPop, maxPop]);
		
	//create new svg element for the scale
	var yAxis = d3.svg.axis()
		.scale(y)
		//position to bottom left corner
		.orient("left")
		
	//add new svg element to the container element
	var axis = container.append("g")
		//assign class name that's the same as variable name
		.attr("class", "axis")
		//use transform to adjust/displace the axis svg element
		.attr("transform", "translate(50,0)")
		.call(yAxis);
		
	//add text element to the container
	var title = container.append("text")
		//assign class name that's the same as variable name
		.attr("class", "title")
		//anchor text and center title
		.attr("text-anchor", "middle")
		//assign placement
		.attr("x", 450)
		.attr("y", 30)
		//assign string in text element
		.text("West Coast City Populations");
	
	//use selectAll to work on more than one element, in this case 4 labels
	var labels = container.selectAll(".labels")
		//access/call cityPop data (the array defined above)
		.data(cityPop)
		//magical enter, essentially is a loop through array?
		.enter()
		//add text
		.append("text")
		//assign class name that's the same as variable name
		.attr("class", "labels")
		//anchor and align text
		.attr("text-anchor", "left")
		//adjust placement of text element to the right of circle symbol
		.attr("x", function(d,i){
			return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
		})
		.attr("y", function(d){
			return y(d.population) + 5;
		})

	//create two lines of text instead of adjusting the leading between lines
	//this is a shortcut to Botsick's more complicated method
	//create the first line of text and add to label elements
	var nameLine = labels.append("tspan")
		//assign class name that's the same as variable
		.attr("class", "nameLine")
		//adjust placement
		.attr("x", function(d, i){
			//position labels to the right of the circles
			return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
		})
		//add text string that calls city name
		.text(function(d){
			return d.city;
		});
		
	//format method that will add a comma to long numbers
	var format = d3.format(",");
	
	//create the second line of text and add to label elements
	var popLine = labels.append("tspan")
		//assign class name that's the same as variable
		.attr("class", "popLine")
		//adjust placement
		.attr("x", function(d, i){
			//position labels to the right of the circles
			return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
		})
		//adjust vertical offset
		.attr("dy", "15")
		//add text string that calls city population infomration
		.text(function(d){
			return "Pop. " + format(d.population);
		});
		
   	//create an empty selection for all circles
    var circles = container.selectAll(".circles")
        //add or feed data from the array
        .data(cityPop) 
        //magic, acts as a loop?
        .enter()
        //add individual circle elements to container
        .append("circle")
        //assign class name that's the same as variable
        .attr("class", "circles")
        //give each element in array an ID based on the city information
        .attr("id", function(d){
            return d.city;
        })
        //calculate the radius based on population value as circle area
        .attr("r", function(d){
            var area = d.population * 0.01;
            return Math.sqrt(area/Math.PI);
        })
        //use the index to place each circle horizontally
        .attr("cx", function(d, i){
            return x(i);
        })
        //use population attribute to assign vertical position
        .attr("cy", function(d){
            return y(d.population);
        })
        //use population to determine circle fill color, variable called above!
        .style("fill", function(d, i){
        	return color(d.population);
        })
        //define stroke and styling
        .style("stroke", "gray");
}

//My notes
//selectAll(".squares")
	//.data()
	//.enter()

//D3 only takes an array