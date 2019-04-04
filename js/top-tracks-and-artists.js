let scales = {
  timeframe: d3.scaleOrdinal().domain(["st","mt","lt"]).range(["Short Term", "Medium Term", "Long Term"]),
  color: d3.scaleOrdinal(d3.schemeCategory10),
  popularity: d3.scaleLinear().domain([0,100]).range([10,150])
};


function createTopTracks(tracks, timeframe, genre_array){

  

  //.append("g")
  //.attr('transform', d => 'translate(' + (width - margin.left - margin.right - width/8)/6 + ', ' + height/2 +')')
  

  let trackScale = d3.scaleBand().domain(tracks.map(function(d){return d.name;})).range([30,height/2]);
  let selection = d3.select("#top-tracks-" + timeframe);

  selection.append("text").text(scales.timeframe(timeframe))

  gtracks = selection.selectAll(".track")
    .data(tracks)
    .enter()
    .append("g")
    .attr("pointer-events", "all")
    .attr("class",d => "track by-artist-" + d.artists[0].id)
    

  gtracks.append("text")
    .attr("y", d => trackScale(d.name))
    .style("font-size","9pt")
    .attr("pointer-events", "all")
    .text(function(d,i){
      let label = d.name;
      if(label.length > 30){
        label = d.name.substring(0,30) + "...";
      }
      return (i+1) + ". " + label;
    })
    .on("mouseover", function(d){
      svg.selectAll('.track').selectAll('text')
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
      
      svg.selectAll('.track').selectAll('text')
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

  let column_length = 0.9*(width - margin.left - margin.right - width/8)/6
  let column_space = 200

  trackbrush = d3.brush()
  .extent([[0, 0], [600, 600]])
  .on('brush end', trackbrushed)

  top_tracks = svg.append("g").attr("id", "top-tracks").attr("transform", "translate(" + column_length + "," + height/2 + ")")
  top_tracks.append('g').call(trackbrush)
  top_tracks.append("g").attr("id","top-tracks-st").attr('class', 'tracklist').attr("transform", "translate(" + 0 + "," + 0 + ")");
  top_tracks.append("g").attr("id","top-tracks-mt").attr('class', 'tracklist').attr("transform", "translate(" + column_length + "," + 0 + ")");
  top_tracks.append("g").attr("id","top-tracks-lt").attr('class', 'tracklist').attr("transform", "translate(" + 2*column_length + "," + 0 + ")");
  
  top_artists = svg.append("g").attr("id", "top-artists")
  top_artists.append("g").attr("id","top-artists-st").attr('class', 'artistlist').attr("transform", "translate(" + (4*column_length + column_space) + "," + height/2 + ")");
  top_artists.append("g").attr("id","top-artists-mt").attr('class', 'artistlist').attr("transform", "translate(" + (5*column_length + column_space) + "," + height/2 + ")");
  top_artists.append("g").attr("id","top-artists-lt").attr('class', 'artistlist').attr("transform", "translate(" + (6*column_length + column_space) + "," + height/2 + ")");
}


function createTopArtists(artists, timeframe, genre_array){
  let artistScale = d3.scaleBand().domain(artists.map(function(d){return d.name;})).range([30,height/2]);
  let selection = d3.select("#top-artists-" + timeframe);
  selection.append("text").text(scales.timeframe(timeframe))

  gartists = selection.selectAll('.gartist')
    .data(artists)
    .enter()
    .append('g')
    //.attr('id', d => d.id)
    .attr("class", d => "artist artist-" + d.id)
    .attr("transform", d => "translate(" + 0 + "," + artistScale(d.name) + ")")
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
      
      svg.selectAll('g.artist-' + d.id).selectAll('line')
        .transition()
        .duration(500)
        .attr("x2", d => scales.popularity(d.popularity))
        .style("opacity", 1)

      svg.selectAll('g.artist-' + d.id).selectAll('.popularitytext')
        .transition()
        .duration(500)
        .attr("x", d => scales.popularity(d.popularity) + 10)
        .style("fill", '#FBE6C0')

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

  gartists
    .append("text")
    .attr('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif')
    .style("font-size","9pt")
    .text(function(d,i){return (i+1) + ". " + d.name;})

    .on("mouseout", function(d){

      svg.selectAll('g.artist').selectAll('line')
        .transition()
        .duration(500)
        .attr("x2", d => 0)
        .style("opacity", 0)

      svg.selectAll('g.artist-' + d.id).selectAll('.popularitytext')
        .transition()
        .duration(500)
        .attr("x", 0)
        .style("fill", '#584b32')

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
    })
    .on('click', d => console.log(d))

  // LITTLE GENRE CIRCLES
  gartists.selectAll('.genrecircle')
    .data(d => {
      filtered_genres = d.genres.filter(g => genre_array.includes(g))
      if (filtered_genres.length != d.genres.length) filtered_genres.push('other')
      filtered_genres.sort((a, b) => genre_array.indexOf(a) > genre_array.indexOf(b))
      return filtered_genres
    })
    .enter()
    .append('circle')
    .attr('fill', d => genre_color(d))
    .attr('cx', (d, i) => 10 + i*10)
    .attr('cy', 7)
    .attr('r', 3)

  // POPULARITY LINE
  gartists.append('line')
    .attr("x1", 0)
    .attr("x2", d => 0)
    .attr("y1", d => 16)
    .attr("y2", d => 16)
    .style("stroke", "#FBE6C0")
    .style("stroke-width", 5)
    .style("opacity", 0)
    .style("stroke-linecap", "round")

  gartists.append('text')
    .attr("class", "popularitytext")
    .attr("x", 0)
    .attr("y", d => 20)
    .style("fill", "#584b32")
    .style("font-size", "x-small")
    .text(d => Math.round(d.popularity*100)/100)

}


async function addLegend(genre_array){

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


trackbrushed = () => {
  if (d3.event.selection == null) return
  x0 = d3.event.selection[0][0]
  y0 = d3.event.selection[0][1]
  x1 = d3.event.selection[1][0]
  y1 = d3.event.selection[1][1]

  full_nodes = svg.select('#top-tracks').selectAll('g.track').nodes()
  for (node of full_nodes){
    let box = node.getBBox() 
    if (box.x - svg.select('#top-tracks').node().getBBox().x > x0){
      console.log(node)
    }
  }
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
