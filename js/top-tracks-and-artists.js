function createTopTracks(tracks){
  svg.append("g").attr("class","top-tracks");
}

function createTopArtists(artists){
  svg.append("g").attr("class","top-artists");
}

function load(){
  d3.json("data/laura-long-term-top-tracks.json", function(tracks){
    createTopTracks(tracks);
  });
  d3.json("data/laura-short-term-top-artists.json", function(artists){
    createTopArtists(artists);
  });
}

load();
