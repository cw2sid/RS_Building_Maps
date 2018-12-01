function loadmap(districts) {
  //define what we have
  var width = 1400,
  height = 1400
  scale=80000;
  //define zoom
  const zoom = d3.zoom()
  .scaleExtent([1, 20])
  .translateExtent([[0,0], [width, height]])
  .extent([[0, 0], [width+200, height]])
  .on("zoom", zoomed);
  //define projection
  var svg = d3.select('svg')
  .call(zoom);
  var albersProjection = d3.geoAlbers()
  .scale(scale)
  .rotate([73.6533, 0])
  .center([0, 40.4806])
  .translate([width/2, height/2]);
  var geoPath = d3.geoPath()
  .projection(albersProjection);
  // need to clear
  d3.selectAll("g").remove();
  //then append
  var g = svg.append('g')
  var buildinglayer = svg.append('g')
  //just for legend
  var z = d3.scaleOrdinal()
      .range(["#dc2f0d","#12049d"]);
  //make legend
  var legendlable=["Lost Units","Gained Units"];
  var legend = svg.append('g')
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(legendlable)
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(0," + i * 40 + ")"; });
  legend.append("circle")
    .attr("r", 10)
    .attr("cx",100)
    .attr("cy",50)
    .attr('fill-opacity','.75')
    .attr("fill", z);  
  legend.append("text")
    .attr("x", 80)
    .attr("y", 50)
    .attr("dy", "0.32em")
    .text(function(d) { return d; });
  //make tooltip
  var div = d3.select("body").append("div")	
  .attr("class", "tooltip")				
  .style("opacity", 0);
  //set defualt district boundaries
  var geojsonurl="https://data.cityofnewyork.us/resource/jp9i-3b7y.geojson"
  if (districts !=""){
    geojsonurl = districts
  }
  //send request for geojson data
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) { //got geojson response
      //parse the response
      var districtBoundaries = JSON.parse(this.responseText);
      //add the paths to the svg
      g.selectAll('path')
      .data(districtBoundaries.features)
      .enter()
      .append('path')
      .attr('fill', '#ccc')
      .attr('class','lines')
      .attr('d', geoPath);
      //load building data after load 
      loadbuildings()
    }
  };
  //actual call to endpoint
  xmlhttp.open("GET",geojsonurl, true);
  xmlhttp.send(); 
  //to load the buildings
  function loadbuildings(){
    //parse the data from the csv, then
    d3.csv("changes-summary_2007-2014.csv",function(d){
      return{
        address: d.address,
        totalUnits: d.unitstotal,
        stabilizedUnits: d.unitsstab2017,
        diff: d.diff,
        percentchange: d.percentchange,
        longitude: d.lon,
        latitude: d.lat,
        j51: d.j51,
        c421a: d["421a"],
        scrie: d.scrie,
        drie: d.drie,
        c420c: d["420c"]
      }
    },function(buildings){ // for each data element add circle
      buildinglayer.selectAll('circle')
      .data(buildings)
      .enter()
      .append('circle')
      .attr('class','point')
      .attr('fill',function(d){
        return color(d.percentchange)})
      .attr( "cx", function(d){
          return albersProjection([d.longitude,d.latitude])[0];})
      .attr("cy",function(d){
            return albersProjection([d.longitude,d.latitude])[1];})
      .attr("r",function(d){
              return d3.event?.5+Math.abs(d.diff/500)/d3.event.transform.k:.5+Math.abs(d.diff/500)
      })
      .on("mouseover", function(d) { //defines tooltip behaviour
              div.transition()		
              .duration(200)		
              .style("opacity", .9);		
              div.html("Address: "+d.address+"<br/>"+
              "Units Changed: "+(d.diff>0?"+":"")+d.diff+"<br/>"+
              "Percent: "+(d.percentchange>0?"+":"")+d.percentchange+"<br/>"+
              "Total Units: "+d.totalUnits+"<br/>"+
              (d.j51?"j51: "+d.j51+"<br/>":"")+(d.c421a?" 421a: "+d.c421a+"<br/>":"")+
              (d.scrie?"SCRIE: "+d.scrie+"<br/>":"")+(d.drie?" DRIE: "+d.drie+"<br/>":"")+(d.c420c?" 420c: "+d.c420c:""))	
              .style("left", (d3.event.pageX) + "px")		
              .style("top", (d3.event.pageY - 28) + "px");	
            })					
        .on("mouseout", function(d) {		
              div.transition()		
              .duration(500)		
              .style("opacity", 0);	
            });
          }
        );
      }
      // color selection
      function color(change){
        if (change > 0) {
          return "#12049d"
        } else if (change == 0){
          return 'none'
        } else if (change < 0) {
          return "#dc2f0d"
        }
      }
      //zoom supporter function - applies transform
      function zoomed() {
        g.attr("transform", d3.event.transform);
        buildinglayer.attr("attr",d3.event.transform);
        
      };
      
      
    }
