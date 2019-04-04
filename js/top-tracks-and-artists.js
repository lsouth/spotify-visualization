let scales = {
  timeframe: d3.scaleOrdinal().domain(["st","mt","lt"]).range(["Short Term", "Medium Term", "Long Term"]),
  color: d3.scaleOrdinal(d3.schemeCategory10),
  popularity: d3.scaleLinear().domain([0,100]).range([10,150])
};

//let genres = ["pop","indie pop","rap","hiphop","alternative rock","dance pop", "electropop","rock","show tunes","classical"];

function createTopTracks(tracks, timeframe, genre_array){
  let trackScale = d3.scaleBand().domain(tracks.map(function(d){return d.name;})).range([30,height/2]);
  let selection = d3.select("#top-tracks-" + timeframe);

  selection.append("text").text(scales.timeframe(timeframe))

  selection.selectAll(".track")
    .data(tracks)
    .enter()
    .append("text")
    .attr("class",d => "track by-artist-" + d.artists[0].id)
    .attr("y", d => trackScale(d.name))
    .style("font-size","9pt")
    .text(function(d,i){
      let label = d.name;
      if(label.length > 30){
        label = d.name.substring(0,30) + "...";
      }
      return (i+1) + ". " + label;
    })
    .on("mouseover", function(d){
      svg.selectAll('.track')
        .transition()
        .duration(500)
        .style('fill', '#584b32')

      d3.select(this)
        .transition()
        .duration(502)
        .style("font-weight","bold")
        .style('fill', '#FBE6C0')
      
      ns = svg.selectAll('.artistlist').selectAll('.artist')
        .transition()
        .duration(500)
        .style('fill', '#584b32')

      svg.selectAll(".artist-" + d.artists[0].id)
        .transition()
        .duration(502)
        .style('fill', '#FBE6C0')
        .style("font-weight","bold")

      if (d3.selectAll(".artist-" + d.artists[0].id).data()[0] != undefined)
        highlight_genre(d3.selectAll(".artist-" + d.artists[0].id).data()[0].genres)
    })
    .on("mouseout", function(d){
      
      svg.selectAll('.track')
        .transition()
        .duration(500)
        .style('fill', '#FBE6C0')
        .style("font-weight","normal");

      d3.selectAll(".artist")
        .transition()
        .duration(500)
        .style('fill', '#FBE6C0')
        .style("font-weight","normal")
      
      dehighlight()
    });
}


async function generateGenreList(){
  full_data = await load_streamgraph_data();
  tmp = periods_by_genres(full_data);
  genre_list = tmp[0];
  return genre_list;
}


function init(){
  svg.append("g").attr("id","top-tracks-st").attr('class', 'tracklist').attr("transform", "translate(" + (width - margin.left - margin.right - width/8)/6 + "," + height/2 + ")");
  svg.append("g").attr("id","top-tracks-mt").attr('class', 'tracklist').attr("transform", "translate(" + 2*(width - margin.left - margin.right - width/8)/6 + "," + height/2 + ")");
  svg.append("g").attr("id","top-tracks-lt").attr('class', 'tracklist').attr("transform", "translate(" + 3*(width - margin.left - margin.right - width/8)/6 + "," + height/2 + ")");
  svg.append("g").attr("id","top-artists-st").attr('class', 'artistlist').attr("transform", "translate(" + 4*(width - margin.left - margin.right - width/8)/6 + "," + height/2 + ")");
  svg.append("g").attr("id","top-artists-mt").attr('class', 'artistlist').attr("transform", "translate(" + 5*(width - margin.left - margin.right - width/8)/6 + "," + height/2 + ")");
  svg.append("g").attr("id","top-artists-lt").attr('class', 'artistlist').attr("transform", "translate(" + 6*(width - margin.left - margin.right- width/8)/6 + "," + height/2 + ")");
}


function createTopArtists(artists, timeframe, genre_array){
  let artistScale = d3.scaleBand().domain(artists.map(function(d){return d.name;})).range([30,height/2]);
  let selection = d3.select("#top-artists-" + timeframe);
  selection.append("text").text(scales.timeframe(timeframe))

  gartists = selection.selectAll('.gartist')
    .data(artists)
    .enter()
    .append('g')
    .attr("transform", d => "translate(" + 0 + "," + artistScale(d.name) + ")")

  gartists
    .append("text")
    .attr('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif')
    .attr("class", d => "artist artist-" + d.id)
    .style("font-size","9pt")
    .text(function(d,i){return (i+1) + ". " + d.name;})
    .on("mouseover", function(d){
      
      svg.selectAll('.track')
        .transition()
        .duration(500)
        .style('fill', '#584b32')

      d3.selectAll(".by-artist-" + d.id)
        .transition()
        .duration(502)
        .style("font-weight","bold")
        .style('fill', '#FBE6C0')
      
      
      ns = svg.selectAll('.artistlist').selectAll('.artist')
        .transition()
        .duration(500)
        .style('fill', '#584b32')

      svg.selectAll(".artist-" + d.id)
        .transition()
        .duration(502)
        .style('fill', '#FBE6C0')
        .style("font-weight","bold")

      highlight_genre(d.genres)

    })
    .on("mouseout", function(d){
      svg.selectAll('.track')
        .transition()
        .duration(500)
        .style('fill', '#FBE6C0')
        .style("font-weight","normal");

      d3.selectAll(".artist")
        .transition()
        .duration(500)
        .style('fill', '#FBE6C0')
        .style("font-weight","normal")
      
      dehighlight()
    });


  selection.selectAll(".genre-line")
    .data(artists)
    .enter()
    .append("g")
    .attr("id", d => "genre-line-" + d.id)


  artists.forEach(function(artist){
    let lineGroup = selection.select("#genre-line-" + artist.id);
    let offset = 4;
    artist.genres.forEach(function(genre){
      if (!genre_array.includes(genre)) return
      lineGroup.append("line")
        .attr("x1", 0)
        .attr("x2", d => scales.popularity(artist.popularity))
        .attr("y1", d => artistScale(artist.name) + offset)
        .attr("y2", d => artistScale(artist.name) + offset)
        .style("stroke", genre_array.includes(genre) ? genre_color(genre) : "none")
        .style("stroke-width", 2);
      offset += genre_array.includes(genre) ? 3 : 0;
    })
    if(offset == 4){
      lineGroup.append("line")
        .attr("x1", 0)
        .attr("x2", d => scales.popularity(artist.popularity))
        .attr("y1", d => artistScale(artist.name) + offset)
        .attr("y2", d => artistScale(artist.name) + offset)
        //.style("stroke", "black")
        //.style("stroke-width", 2);
    }
  })
}


async function addLegend(genre_array){
  //let genre_legend = svg.append("g").attr("transform","translate(100, 100)").attr("class","genre-legend");
  //let legend = d3.legendColor().scale(scales.color);
  //svg.select(".genre-legend").call(legend);

  //genres = await generateGenreList()

  let line_spacing = 12;
  let genre_legend = svg.append("g").attr("transform","translate(250, 80)")

  let legend_lines = genre_legend.selectAll(".dot-legend")
    .data(genre_array)
    .enter()
    .append("g")
    .attr("transform", (d, i) => "translate(0," + i*line_spacing + ")")

  legend_lines.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("font-size", "small")
    .attr("text-anchor", "end")
    .text(d => d)

  legend_lines.append("rect")
    .attr("x", 10)
    .attr("y", -10)
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", (d, i) => genre_color(d))
}


async function loadTopTracksArtists(){
  init();
  let full_data = await load_streamgraph_data();
  let tmp = periods_by_genres(full_data);
  let genre_array = tmp[0];

  d3.json("./data/"+user+"-short-term-top-tracks.json").then(function(tracks){
    createTopTracks(tracks.items,"st", genre_array);
  });
  d3.json("./data/"+user+"-medium-term-top-tracks.json").then(function(tracks){
    createTopTracks(tracks.items,"mt", genre_array);
  });
  d3.json("./data/"+user+"-long-term-top-tracks.json").then(function(tracks){
    createTopTracks(tracks.items,"lt", genre_array);
  });
  d3.json("./data/"+user+"-short-term-top-artists.json").then(function(artists){
    createTopArtists(artists.items, "st", genre_array);
  });
  d3.json("./data/"+user+"-medium-term-top-artists.json").then(function(artists){
    createTopArtists(artists.items, "mt", genre_array);
  });
  d3.json("./data/"+user+"-long-term-top-artists.json").then(function(artists){
    createTopArtists(artists.items, "lt", genre_array);
    addLegend(genre_array);
  });
}
