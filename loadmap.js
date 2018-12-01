function loadmap(districts) {
  var width = 1400,
  height = 1400
  scale=80000;
  const zoom = d3.zoom()
  .scaleExtent([1, 20])
  .translateExtent([[0,0], [width, height]])
  .extent([[0, 0], [width+200, height]])
  .on("zoom", zoomed);
  var albersProjection = d3.geoAlbers()
  .scale(scale)
  .rotate([73.6533, 0])
  .center([0, 40.4806])
  .translate([width/2, height/2]);
  
  var z = d3.scaleOrdinal()
      .range(["#dc2f0d","#12049d"]);
  var svg = d3.select('svg')
  .call(zoom);
  var legendlable=["Lost Units","Gained Units"];
  var geoPath = d3.geoPath()
  .projection(albersProjection);
  d3.selectAll("g").remove();
  var g = svg.append('g')
  var buildinglayer = svg.append('g')
  var legend = svg.append('g')
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(legendlable)
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 40 + ")"; });
      legend.append("rect")
          .attr("width", 15)
          .attr("height", 20)
          .attr("x",100)
          .attr("y",50)
          .attr("fill", z);
    
      legend.append("text")
          .attr("x", 90)
          .attr("y", 60)
          .attr("dy", "0.32em")
          .text(function(d) { return d; });

  var div = d3.select("body").append("div")	
  .attr("class", "tooltip")				
  .style("opacity", 0);
  
  var geojsonurl="https://data.cityofnewyork.us/resource/jp9i-3b7y.geojson"
  if (districts !=""){
    geojsonurl = districts
  }
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var community_districts = JSON.parse(this.responseText);
      g.selectAll('path')
      .data(community_districts.features)
      .enter()
      .append('path')
      .attr('fill', '#ccc')
      .attr('class','lines')
      .attr('d', geoPath);
      
      loadbuildings()
    }
  };
  xmlhttp.open("GET",geojsonurl, true);
  xmlhttp.send(); 
  
  function loadbuildings(){
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
    },function(buildings){
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
              return .5+Math.abs(d.diff/500)
      })
      .on("mouseover", function(d) {
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
      
      
      function color(change){
        if (change > 0) {
          return "#12049d"
        } else if (change == 0){
          return 'none'
        } else if (change < 0) {
          return "#dc2f0d"
        }
      }
    function zoomed() {
        g.attr("transform", d3.event.transform);
        buildinglayer.attr("transform", d3.event.transform);
      };
      
      
    }
