//ps = ['short term', 'medium term', 'long term', 'long long term']
ps = ['short term', 'medium term', 'long term']
window.mousedown = false;
window.selected_genres = [];


preprocess = (data) => {
	// preprocess data
	res = {}
	genres = [...new Set(data.items.map(d => d.genres).flat())]
	genres = genres.sort((a, b) => { return data.items.filter(d => d.genres.indexOf(a)!=-1).length <= data.items.filter(d => d.genres.indexOf(b)!=-1).length; })
	for (g of genres){
		res[g] = data.items.filter(d => d.genres.indexOf(g)!=-1).length
	}
	return res;
}


init_streamgraph = (full_data, genre_list) => {

	create_glow()

	streamgraphbrush = d3.brush()
  		.extent([[-10, -10], [1000, 1000]])
  		//.on('brush end', streamgraph_brushed)

	let numsteps = ps.length; // change this in the future
	let smargin = {
		right: width*50/100, 
		left:width*2/100, 
		top:height*30/100, 
		bottom: height*0/100}
	let max_height = 1.2*(height - smargin.top - smargin.bottom)/2;
	let numsongs_per_period = 50;
	let single_step = max_height/numsongs_per_period;

	area = d3.area()
    	.x((d, i) => smargin.left + (i)*(width - smargin.left - smargin.right)/numsteps)
    	.y1((d, i) =>{
    		s = 0;
    		this_index = genre_list.indexOf(d.genre_name)
    		lower_genres = full_data.filter(e => genre_list.indexOf(e.name) > this_index)
    		sum_array = lower_genres.map(e => e.periods).map(e => e.find(p => p.period == d.period)).map(e => e.count)
    		for (elem of sum_array) s += elem;
    		return max_height - s * single_step
    	})
    	.y0((d, i) => {
    		s = 0;
    		this_index = genre_list.indexOf(d.genre_name)
    		lower_genres = full_data.filter(e => genre_list.indexOf(e.name) > this_index)
    		sum_array = lower_genres.map(e => e.periods).map(e => e.find(p => p.period == d.period)).map(e => e.count)
    		for (elem of sum_array) s += elem;
    		return max_height - (d.count * single_step + s * single_step)
    	})
    	.curve(d3.curveCatmullRom.alpha(0.5))

    streamgraph = svg.append('g')
    	.on('mousedown', () => {window.mousedown = true;})
    	.on('mouseup', () => window.mousedown = false)
    	.on('mousemove', () => {})

    // create streamgraph curves
	streamgraph_paths = streamgraph.selectAll('.genre_curve')
		.data(full_data)
		.enter()
		.append("path")
		.datum(d => d['periods'])
		.attr('fill', (d, i) => genre_color(d[0].genre_name))
		.attr("d", area)
		.attr("stroke", "#222")
		.attr("class", "genre_curve")
		.attr("stroke-width", "0px")
		.attr('transform', 'translate('+ (smargin.left) +','+smargin.top+')')
		.style("filter", "url(#glow)")
		.on('mouseover', d => {
			//if (window.mousedown) window.selected_genres.push(d[0].genre_name)
			ns = svg.selectAll('.artistlist').selectAll('.artist').filter(s => !s.genres.includes(d[0].genre_name))
				.transition()
				.duration(500)
				.style('fill', '#584b32')

			na = svg.selectAll('.tracklist').selectAll('.track')
				.transition()
				.duration(500)
				.style('fill', '#584b32')

			s = svg.selectAll('.artistlist').selectAll('.artist').filter(s => s.genres.includes(d[0].genre_name))
			s.style('font-weight', 'bold')
			s.each(artist => svg.selectAll('.tracklist').selectAll(".by-artist-" + artist.id)
				.transition()
				.duration(502)
				.style('fill', '#FBE6C0')
				.style("font-weight","bold"))

			highlight_genre([d[0].genre_name] + window.selected_genres)
		})
		.on('mouseout', d => {
			svg.selectAll('.artistlist').selectAll('.artist').filter(s => !s.genres.includes(d[0].genre_name))
				.transition()
				.duration(500)
				.style('fill', '#FBE6C0')
			s = svg.selectAll('.artistlist').selectAll('.artist').style('font-weight', 'normal')
			svg.selectAll('.tracklist').selectAll(".track")
				.transition()
				.duration(500)
				.style('fill', '#FBE6C0')
				.style('font-weight', 'normal')

			dehighlight_streamgraph()
			highlight_genre(window.selected_genres)	
		})
		.on('click', (d) => {
			if (window.selected_genres.includes(d[0].genre_name)) window.selected_genres.splice(window.selected_genres.indexOf(d[0].genre_name), 1)
			else window.selected_genres.push(d[0].genre_name)
			
			highlight_genre(window.selected_genres)	
		})


	periodbox = svg.selectAll('.periodbox')
		.data(ps)
		.enter()
		.append('g')
		.attr('class', 'periodbox')
		.attr('transform', (d, i) => {
			if (i == 0) t = 20
			else if (i == ps.length-1) t = -20
			else t = 0
			return 'translate('+(t + smargin.left*2 + i * (width - smargin.left - smargin.right)/numsteps)+','+ smargin.top +')'
		})


    var line = d3.line()
         .x(function(d) { return d['x']; })
         .y(function(d) { return d['y']; });

	periodbox.append('path')
		.attr('class', 'defline')
		.attr('stroke', '#333')
		.attr('stroke-width', 2)
		.style("stroke-dasharray", ("10, 10")) 
        .attr("d", (d, i) => line([{x:0, y:0}, {x:0, y:max_height + 10}]));

	periodbox.append('text')
		.attr('text-anchor', 'middle')
		.attr('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif')
		.attr('font-size', '12pt')
		.attr('fill', '#888')
		.attr('x', 0)
		.attr('y', (max_height + 25) )
		.text(d => d)

	div = document.createElement("div")
	div.innerHTML = "Spotify Visualization"
	div.style.position = 'absolute'
	div.style.color = lightcolor
	div.style.bottom = '5%'
	div.style.left = '5%'
	div.style.fontSize = 'x-large'
	div2 = document.createElement('div')
	div2.innerHTML = "'Spotify Visualization' is a tool to visualize trends in your music listening habits. Everything spans over three periods of time: Short term, Mid Term and Long term. The streamgraph above represents the genres you have been listening to. " +
		"On the right, you can find your top tracks and top artists over the three periods. Over hover a genre, a track or an artists to see additional details, or click on them in order to select them. Click on an item again to deselect it."
	div2.style.maxWidth = width/3 + 'px'
	div2.style.fontSize = 'small'
	div.append(div2)
	document.body.append(div)
}


genre_color = (name) => {
	if (name == 'other') return '#333'
	return d3.interpolateRainbow(genre_list.indexOf(name)/(genre_list.length + 3))
}


highlight_genre = (genres) => {
	// manage legend
	svg.selectAll('.legend_text').filter(d => !genres.includes(d)).attr('fill', darkcolor)
	svg.selectAll('.legend_text').filter(d => genres.includes(d)).attr('fill', lightcolor)

	svg.selectAll('.legend_rect').filter(d => !genres.includes(d)).attr('fill', d => darken_genre_color(d))
	svg.selectAll('.legend_rect').filter(d => genres.includes(d)).attr('fill', d => genre_color(d))
	
	// manage paths
	svg.selectAll('.genre_curve')
		.transition()
		.style('fill', (d) => darken_genre_color(d[0].genre_name))
		.duration(500)

	svg.selectAll('.genre_curve').filter(c => genres.includes(c[0].genre_name)).transition()
		.style('fill', (d) => saturate_genre_color(d[0].genre_name))
		.duration(502)
}


darken_genre_color = function(c){
	col = d3.hsl(genre_color(c))
	col.l = 0.3
	col.s = 0.3
	return col + ''
}


saturate_genre_color = function(c){
	col = d3.hsl(genre_color(c))
	col.s = 1
	return col + ''
}


dehighlight_streamgraph = () => {
	svg.selectAll('.genre_curve')
		.transition()
		.style('fill', d => genre_color(d[0].genre_name))
		.duration(500)
}


periods_by_genres = (data) => {
	res = {}

	for (a of data){
		for (p in a){
			period = p
			for (genre in a[p]){
				if (res[genre] == undefined){
					res[genre] = []
					res[genre].push({'period':period, 'count': a[p][genre], 'genre_name':genre})
				} else {
					res[genre].push({'period':period, 'count': a[p][genre], 'genre_name':genre})
				}
			}
		}
	}

	genre_list = Object.keys(res)
	genre_count_total = {}
	for (elem in res){
		if (genre_count_total[elem] == undefined) genre_count_total[elem] = 0
		for (elem2 in res[elem]){
			genre_count_total[elem] += res[elem][elem2].count
		}
	}

	genre_list = genre_list.sort((a, b) => genre_count_total[a] < genre_count_total[b]).slice(0, 10)
	genre_list.unshift('other')

	res2 = []
	for (elem in res){
		if (genre_list.indexOf(elem) == -1) continue
		new_periods = []
		for (p of ps){
			if (res[elem].find(e => e.period == p) == undefined){
				new_periods.push({'period': p, 'count':0, 'genre_name':elem})
			} else {
				new_periods.push({'period': p, 'count':res[elem].find(e => e.period == p).count, 'genre_name':elem})
			}
		}
		res2.push({'name': elem, 'periods': new_periods})
	}
	return [genre_list, res2]
}


streamgraph_brushed = function(){
	if (d3.event.selection == null) return
  	x0 = d3.event.selection[0][0]
  	y0 = d3.event.selection[0][1]
  	x1 = d3.event.selection[1][0]
  	y1 = d3.event.selection[1][1]

  	paths = d3.selectAll('.genre_curve').each(p => console.log(p))
  	for (path of paths){
  		console.log(path)
  	}
}


load_streamgraph_data = () => {
	return new Promise(function(resolve, reject){
        var swapi = initSpotifyWebApi();
        getTopArtists(swapi).then(function(full_data){
            Object.keys(full_data).map(function(k, i){
                console.log(full_data);
                full_data[i] = preprocess(full_data[i]);
            });
            resolve(full_data);
        });
    });
}


create_glow = () => {
	//Container for the gradients
	var defs = svg.append("defs");

	//Filter for the outside glow
	var filter = defs.append("filter")
	    .attr("id","glow");
	filter.append("feGaussianBlur")
	    .attr("stdDeviation","3.5")
	    .attr("result","coloredBlur");
	var feMerge = filter.append("feMerge");
	feMerge.append("feMergeNode")
	    .attr("in","coloredBlur");
	feMerge.append("feMergeNode")
	    .attr("in","SourceGraphic");
}


async function loadStreamgraph() {
	let full_data = await load_streamgraph_data()
	let tmp = periods_by_genres(full_data)
	full_data = tmp[1]
	window.genre_list = tmp[0]

	// fill other genres
    other = {
    	"name":"other", 
    	"periods": []
    }

    for (period of ps){
    	other.periods.push({
    		"period": period,
    		"count":  50 - full_data.map(e => e.periods).map(e => e.find(p => p.period == period)).map(e => e.count).reduce((a, b) => a+b),
    		"genre_name": "other"
    	})
    }

    full_data.unshift(other)

	init_streamgraph(full_data, genre_list);
}
