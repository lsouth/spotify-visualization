let scales = {
  timeframe: d3.scaleOrdinal().domain(["st","mt","lt"]).range(["Short Term", "Medium Term", "Long Term"]),
  color: d3.scaleOrdinal(d3.schemeCategory10),
  popularity: d3.scaleLinear().domain([0,100]).range([10,150])
};

let genres = ["pop","indie pop","rap","hiphop","alternative rock","dance pop", "electropop","rock","show tunes","classical"];

function createTopTracks(tracks, timeframe){
  console.log("Creating top tracks (" + timeframe + ")");
  console.log(tracks);
  let trackScale = d3.scaleBand().domain(tracks.map(function(d){return d.name;})).range([30,height/2]);
  let selection = d3.select("#top-tracks-" + timeframe);
  selection.append("text").text(scales.timeframe(timeframe))

  selection.selectAll(".track")
    .data(tracks)
    .enter()
    .append("text")
    .attr("class",d => "track by-artist-" + d.artists[0].id)
    .attr("y", d => trackScale(d.name))
    .style("font-size","11pt")
    .text(function(d,i){
      let label = d.name;
      if(label.length > 30){
        label = d.name.substring(0,30) + "...";
      }
      return (i+1) + ". " + label;
    })
    .on("mouseover", function(d){
      d3.select(this).style("font-weight","bold");
      d3.selectAll(".artist-" + d.artists[0].id).style("font-weight","bold")
    })
    .on("mouseout", function(d){
      d3.select(this).style("font-weight","normal");
      d3.selectAll(".artist-" + d.artists[0].id).style("font-weight","normal")
    });
}

function init(){
  let listWidth = width/6;
  svg.append("g").attr("id","top-tracks-st").attr("transform", "translate(" + 0 + "," + height/2 + ")");
  svg.append("g").attr("id","top-tracks-mt").attr("transform", "translate(" + 1*listWidth + "," + height/2 + ")");
  svg.append("g").attr("id","top-tracks-lt").attr("transform", "translate(" + 2*listWidth + "," + height/2 + ")");
  svg.append("g").attr("id","top-artists-st").attr("transform", "translate(" + 3*listWidth + "," + height/2 + ")");
  svg.append("g").attr("id","top-artists-mt").attr("transform", "translate(" + 4*listWidth + "," + height/2 + ")");
  svg.append("g").attr("id","top-artists-lt").attr("transform", "translate(" + 5*listWidth + "," + height/2 + ")");
}

function createTopArtists(artists, timeframe){
  console.log(artists);
  console.log("Creating top artists (" + timeframe + ")");
  let artistScale = d3.scaleBand().domain(artists.map(function(d){return d.name;})).range([30,height/2]);
  let selection = d3.select("#top-artists-" + timeframe);
  selection.append("text").text(scales.timeframe(timeframe))

  selection.selectAll(".artist")
    .data(artists)
    .enter()
    .append("text")
    .attr("class",d => "artist artist-" + d.id)
    .attr("y", d => artistScale(d.name))
    .style("font-size","11pt")
    .text(function(d,i){return (i+1) + ". " + d.name;})
    .on("mouseover", function(d){
      console.log(d.id);
      d3.selectAll(".by-artist-" + d.id).style("font-weight","bold");
      d3.selectAll(".artist-" + d.id).style("font-weight","bold");
    })
    .on("mouseout", function(d){
      d3.selectAll(".by-artist-" + d.id).style("font-weight","normal");
      d3.selectAll(".artist-" + d.id).style("font-weight","normal");
    });

  selection.selectAll(".genre-line")
    .data(artists)
    .enter()
    .append("g")
    .attr("id", d => "genre-line-" + d.id)
    /*.append("image")
        .attr("height", 90)
        .attr("width",90)
        .attr("href", function(d){return d.images[0].url;});*/

  artists.forEach(function(artist){
    let lineGroup = selection.select("#genre-line-" + artist.id);
    let offset = 4;
    artist.genres.forEach(function(genre){
      lineGroup.append("line")
        .attr("x1", 0)
        .attr("x2", d => scales.popularity(artist.popularity))
        .attr("y1", d => artistScale(artist.name) + offset)
        .attr("y2", d => artistScale(artist.name) + offset)
        .style("stroke", genres.includes(genre) ? scales.color(genre) : "none")
        .style("stroke-width", 2);
      offset += genres.includes(genre) ? 3 : 0;
    })
    if(offset == 4){
      lineGroup.append("line")
        .attr("x1", 0)
        .attr("x2", d => scales.popularity(artist.popularity))
        .attr("y1", d => artistScale(artist.name) + offset)
        .attr("y2", d => artistScale(artist.name) + offset)
        .style("stroke", "black")
        .style("stroke-width", 2);
    }
  })
}

function addLegend(){
  svg.append("g").attr("transform","translate(100, 100)").attr("class","genre-legend");
  let legend = d3.legendColor().scale(scales.color);
  svg.select(".genre-legend").call(legend);
}

function loadTopTracksArtists(){
  init();
  d3.json("/data/laura-short-term-tracks-march.json").then(function(tracks){
    createTopTracks(tracks.items,"st");
  });
  d3.json("/data/laura-medium-term-top-tracks.json").then(function(tracks){
    createTopTracks(tracks.items,"mt");
  });
  d3.json("/data/laura-long-term-top-tracks.json").then(function(tracks){
    createTopTracks(tracks.items,"lt");
  });
  d3.json("/data/laura-short-term-top-artists.json").then(function(artists){
    createTopArtists(artists.items, "st");
  });
  d3.json("/data/laura-medium-term-top-artists.json").then(function(artists){
    createTopArtists(artists.items, "mt");
  });
  d3.json("/data/laura-long-term-top-artists.json").then(function(artists){
    createTopArtists(artists.items, "lt");
    addLegend();
  });
}
