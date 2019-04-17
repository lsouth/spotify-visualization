let scales = {
  timeframe: d3.scaleOrdinal().domain(["st","mt","lt"]).range(["Short", "Mid", "Long"]),
  color: d3.scaleOrdinal(d3.schemeCategory10),
  popularity: d3.scaleLinear().domain([0,100]).range([10,150])
};

lightcolor = '#FBE6C0'
darkcolor = '#584b32'
darkercolor = '#1e1e1e'
brush_selected_tracks = null
text_size = '8pt'

function createTopTracks(tracks, timeframe, genre_array){

  //.append("g")
  //.attr('transform', d => 'translate(' + (width - margin.left - margin.right - width/8)/6 + ', ' + height/2 +')')
  

  let trackScale = d3.scaleBand().domain(tracks.map(function(d){return d.name;})).range([30,height/2]);
  let selection = d3.select("#top-tracks-" + timeframe);

  selection.append("text").text(scales.timeframe(timeframe))
    .attr('font-size', 'medium')


  // HACKY THING
  tracks = tracks.slice(0, 10)
  for (track of tracks) {
    //track['audio_features'].then(d => console.log(d))
    track.val1 = track["audio_features"]["danceability"] * 100;
    track.val2 = track["audio_features"]["acousticness"] * 100;
    track.val3 = Math.random()*100
  }

  gtracks = selection.selectAll(".track")
    .data(tracks)
    .enter()
    .append("g")
    .attr("class",d => "track by-artist-" + d.artists[0].id)    
    .attr("transform", (d, i) => "translate(" + 0 + "," + ((i+1)*(height*85/100)/tracks.length) + ")")
     .on("mouseover", function(d){
      highlight_tracks(d3.select(this))
      a = svg.selectAll('.artist').filter(a => a.name == d.artists[0].name)
      highlight_artists([a.data()[0]])
      
      /*
      svg.selectAll('.track').selectAll('text')
        .transition()
        .duration(500)
        .style('fill', darkcolor)
      d3.select(this)
        .transition()
        .duration(502)
        .style("font-weight","bold")
        .style('fill', lightcolor)
      
      
      ns = svg.selectAll('.artistlist').selectAll('.artist')
        .transition()
        .duration(500)
        .style('fill', darkcolor)
      svg.selectAll(".artist-" + d.artists[0].id)
        .transition()
        .duration(502)
        .style('fill', lightcolor)
        .style("font-weight","bold")*/

      if (d3.selectAll(".artist-" + d.artists[0].id).data()[0] != undefined)
        highlight_genre(d3.selectAll(".artist-" + d.artists[0].id).data()[0].genres)
    })
    .on("mouseout", function(d){
      dehighlight_tracks()
      dehighlight_artists()
      dehighlight_streamgraph()
    });

  gtracks.append("text")
    .style("font-size", text_size)
    .text(function(d,i){
      let label = d.name;
      if(label.length > 20) label = d.name.substring(0,20) + "...";    
      return (i+1) + ". " + label;
    })
   

      // POPULARITY LINE
  gtracks.append('text')
    .attr("class", "popularitytext")
    .attr("x", 0)
    .attr("y", d => 15)
    .style("fill", "#584b32")
    .style("font-size", "x-small")
    .attr("class", "textval1")
    .text(d => "danceability")

  gtracks.append('line')
    .attr("x1", 0)
    .attr("x2", d => 0)
    .attr("y1", d => 27)
    .attr("y2", d => 27)
    .style("stroke", "#FBE6C0")
    .style("stroke-width", 5)
    .attr("class", "lineval1")
    .style("opacity", 0)
    .style("stroke-linecap", "round")

  gtracks.append('text')
    .attr("class", "popularitytext")
    .attr("x", 0)
    .attr("y", d => 30)
    .style("fill", "#584b32")
    .style("font-size", "x-small")
    .attr("class", "textval1")
    .text(d => Math.round(d.val1))

  gtracks.append('line')
    .attr("x1", 0)
    .attr("x2", d => 0)
    .attr("y1", d => 46)
    .attr("y2", d => 46)
    .style("stroke", "#FBE6C0")
    .style("stroke-width", 5)
    .attr("class", "lineval2")
    .style("opacity", 0)
    .style("stroke-linecap", "round")

  gtracks.append('text')
    .attr("class", "popularitytext")
    .attr("x", 0)
    .attr("y", d => 42)
    .style("fill", "#584b32")
    .attr("class", "textval2")
    .style("font-size", "x-small")
    .text(d => "acoustics")

    gtracks.append('text')
    .attr("class", "popularitytext")
    .attr("x", 0)
    .attr("y", d => 52)
    .style("fill", "#584b32")
    .attr("class", "textval2")
    .style("font-size", "x-small")
    .text(d => Math.round(d.val2))
}


async function generateGenreList(){
  full_data = await load_streamgraph_data();
  tmp = periods_by_genres(full_data);
  genre_list = tmp[0];
  return genre_list;
}


function init(){

  let column_length = 1.3*(width - margin.left - margin.right - width/8)/(6*2)
  let column_space = 2.1*width/3

  trackbrush = d3.brush()
  .extent([[-10, -10], [600, 600]])
  .on('brush end', trackbrushed)

  top_tracks = svg.append("g").attr("id", "top-tracks").attr("transform", "translate(" + (column_length + width/3) + "," + height*8/100 + ")")
  //top_tracks.append('g').call(trackbrush)

  top_tracks.append("text")
    .text("top tracks")
    .attr("x", column_length + column_length/2 - 5)
    .attr("y", -50)
    .attr("opacity", 0.5)
    .attr("text-anchor", "middle")

  top_tracks.append("rect")
    .attr("x", -10)
    .attr("y", 10)
    .attr("width", column_length)
    .attr("height", height)
    .attr("fill", darkercolor)

  top_tracks.append("g").attr("id","top-tracks-st").attr('class', 'tracklist').attr("transform", "translate(" + 0 + "," + 0 + ")");
  top_tracks.append("g").attr("id","top-tracks-mt").attr('class', 'tracklist').attr("transform", "translate(" + column_length + "," + 0 + ")");
  
  top_tracks.append("rect")
    .attr("x", 2*column_length -10)
    .attr("y", 10)
    .attr("width", column_length)
    .attr("height", height)
    .attr("fill", darkercolor)

  top_tracks.append("g").attr("id","top-tracks-lt").attr('class', 'tracklist').attr("transform", "translate(" + 2*column_length + "," + 0 + ")");
  
  top_artists = svg.append("g").attr("id", "top-artists").attr("transform", "translate(" + (column_space) + "," + (height*8/100) + ")")
  
  top_artists.append("text")
    .text("top artists")
    .attr("x", column_length + column_length/2 - 5)
    .attr("y", -50)
    .attr("opacity", 0.5)
    .attr("text-anchor", "middle")

  top_artists.append("rect")
    .attr("x", -10)
    .attr("y", 10)
    .attr("width", column_length)
    .attr("height", height)
    .attr("fill", darkercolor)

  top_artists.append("g").attr("id","top-artists-st").attr('class', 'artistlist').attr("transform", "translate(" + (0*column_length) + "," + 0 + ")");
  top_artists.append("g").attr("id","top-artists-mt").attr('class', 'artistlist').attr("transform", "translate(" + (1*column_length) + "," + 0 + ")");
  
  top_artists.append("rect")
    .attr("x", 2*column_length -10)
    .attr("y", 10)
    .attr("width", column_length)
    .attr("height", height)
    .attr("fill", darkercolor)

  top_artists.append("g").attr("id","top-artists-lt").attr('class', 'artistlist').attr("transform", "translate(" + (2*column_length) + "," + 0 + ")");
}


function createTopArtists(artists, timeframe, genre_array){
  let artistScale = d3.scaleBand().domain(artists.map(function(d){return d.name;})).range([30,height/2]);
  let selection = d3.select("#top-artists-" + timeframe);
  selection.append("text").text(scales.timeframe(timeframe))

  artists = artists.slice(0, 10)

  gartists = selection.selectAll('.gartist')
    .data(artists)
    .enter()
    .append('g')
    .attr("class", d => "artist artist-" + d.id)
    .attr("transform", (d, i) => "translate(" + 0 + "," + ((i+1)*(height*85/100)/artists.length) + ")")
    .on("mouseover", function(d){
      highlight_artists([d])
      highlight_tracks(svg.selectAll('.track').filter(t => t.artists[0].id == d.id))
      highlight_genre(d.genres)
    })

  gartists
    .append("text")
    .style("font-size", text_size)
    .text(function(d,i){return (i+1) + ". " + d.name;})

    .on("mouseout", function(d){
      dehighlight_tracks()
      dehighlight_artists()
      dehighlight_streamgraph()
    })

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
    .attr("y1", d => 26)
    .attr("y2", d => 26)
    .style("stroke", "#FBE6C0")
    .style("stroke-width", 5)
    .style("opacity", 0)
    .style("stroke-linecap", "round")

  gartists.append('text')
    .attr("class", "popularitytext")
    .attr("x", -2)
    .attr("y", d => 15)
    .style("fill", "#584b32")
    .style("font-size", "x-small")
    .text(d => 'popularity')

  gartists.append('text')
    .attr("class", "popularitytext")
    .attr("x", 0)
    .attr("y", d => 30)
    .style("fill", "#584b32")
    .style("font-size", "x-small")
    .text(d => Math.round(d.popularity*100)/100)

}


highlight_tracks = (tracks) => {
  svg.selectAll('.track')
    .transition()
    .duration(500)
    .style('fill', darkcolor)

  tracks
    .transition()
    .duration(502)
    .style("font-weight","bold")
    .style('fill', lightcolor)

  tracks.selectAll('.lineval1')
    .transition()
    .duration(500)
    .attr("x2", d => d.val1)
    .style("opacity", 1)

  tracks.selectAll('.lineval2')
    .transition()
    .duration(500)
    .attr("x2", d => d.val2)
    .style("opacity", 1)

  tracks.selectAll('.textval1')
      .transition()
      .duration(500)
      .attr("x", d => d.val1 + 10)
      .style("fill", lightcolor)

  tracks.selectAll('.textval2')
      .transition()
      .duration(500)
      .attr("x", d => d.val2 + 10)
      .style("fill", lightcolor)
}


dehighlight_tracks = () => {
  svg.selectAll('.track').selectAll('text')
    .transition()
    .duration(503)
    .style('fill', lightcolor)
    .style("font-weight","normal");

  svg.selectAll('.track').selectAll('line')
    .transition()
    .duration(500)
    .attr("x2", d => 0)
    .style("opacity", 0)

  svg.selectAll('.track').selectAll('.textval1')
    .transition()
    .duration(500)
    .attr("x", 0)
    .style("fill", darkcolor)

  svg.selectAll('.track').selectAll('.textval2')
    .transition()
    .duration(500)
    .attr("x", 0)
    .style("fill", darkcolor)
}


highlight_artists = (artists) => {

  ns = svg.selectAll('.artistlist').selectAll('.artist')
      .transition()
      .duration(500)
      .style('fill', darkcolor)

  if (artists[0] == undefined) return

  for (d of artists){
    svg.selectAll('g.artist-' + d.id).selectAll('line')
        .transition()
        .duration(500)
        .attr("x2", d => scales.popularity(d.popularity))
        .style("opacity", 1)

    svg.selectAll('g.artist-' + d.id).selectAll('.popularitytext')
      .transition()
      .duration(500)
      .attr("x", d => scales.popularity(d.popularity) + 10)
      .style("fill", lightcolor)

    svg.selectAll(".artist-" + d.id)
      .transition()
      .duration(502)
      .style('fill', lightcolor)
      .style("font-weight","bold")
  }
}

dehighlight_artists = () => {
  svg.selectAll('g.artist').selectAll('line')
    .transition()
    .duration(500)
    .attr("x2", d => 0)
    .style("opacity", 0)

  svg.selectAll('.artist').selectAll('.popularitytext')
    .transition()
    .duration(500)
    .attr("x", 0)
    .style("fill", darkcolor)
    
  d3.selectAll(".artist")
    .transition()
    .duration(500)
    .style('fill', lightcolor)
    .style("font-weight","normal")
}


trackbrushed = () => {
  if (d3.event.selection == null) return
  x0 = d3.event.selection[0][0]
  y0 = d3.event.selection[0][1]
  x1 = d3.event.selection[1][0]
  y1 = d3.event.selection[1][1]

  highlight_tracks(svg.select('#top-tracks').selectAll('g.track').filter(t => {
    box = svg.select('#top-tracks').selectAll('g.track').filter(n => t == n).node().getBoundingClientRect()
    boxx = box.x
    boxy = box.y
    brushx0 = x0 + svg.select('#top-tracks').node().getBoundingClientRect().x
    brushx1 = x1 + svg.select('#top-tracks').node().getBoundingClientRect().x
    brushy0 = y0 + svg.select('#top-tracks').node().getBoundingClientRect().y
    brushy1 = y1 + svg.select('#top-tracks').node().getBoundingClientRect().y
    if (brushx0 < boxx && boxx < brushx1 && brushy0 < boxy && boxy < brushy1) {
      return true
    } else return false
  }))
}


async function loadTopTracksArtists(){
  init();
  let full_data = await load_streamgraph_data();
  let tmp = periods_by_genres(full_data);
  let genre_array = tmp[0];

    var swapi = initSpotifyWebApi();
    getTopTracks(swapi).then(function(topTracks) {
        createTopTracks(topTracks["short_term"]["items"], "st", genre_array);
        createTopTracks(topTracks["medium_term"]["items"], "mt", genre_array);
        createTopTracks(topTracks["long_term"]["items"], "lt", genre_array);
    });
    getTopArtists(swapi).then(function(topArtists) {
        createTopArtists(topArtists["short_term"]["items"], "st", genre_array);
        createTopArtists(topArtists["medium_term"]["items"], "mt", genre_array);
        createTopArtists(topArtists["long_term"]["items"], "lt", genre_array);
    });
    addLegend(genre_array);
}