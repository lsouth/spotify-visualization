//ps = ['short term', 'medium term', 'long term', 'long long term']
ps = ['long term', 'medium term', 'short term']
streamgraph_height = window.innerHeight*0.4;


preprocess = (data) => {
	// preprocess data
	res = {}
	genres = [...new Set(data.items.map(d => d.genres).flat())]
	genres = genres.sort((a, b) => { return data.items.filter(d => d.genres.indexOf(a)!=-1).length <= data.items.filter(d => d.genres.indexOf(b)!=-1).length; }).slice(0, 10)
	for (g of genres){
		res[g] = data.items.filter(d => d.genres.indexOf(g)!=-1).length
	}
	return res;
}


init_streamgraph = (full_data, genre_list) => {

	create_glow()

	let numsteps = 3 // change this in the future
	let smargin = {right: width*10/100, left:width*10/100}

	area = d3.area()
    	.x((d, i) => smargin.left + (i)*(width - smargin.left - smargin.right)/numsteps)
    	.y1((d, i) =>{
    		s = 0;
    		this_index = genre_list.indexOf(d.genre_name)
    		lower_genres = full_data.filter(e => genre_list.indexOf(e.name) > this_index)
    		sum_array = lower_genres.map(e => e.periods).map(e => e.find(p => p.period == d.period)).map(e => e.count)
    		for (elem of sum_array) s += elem;
    		return streamgraph_height - s * 10
    	})
    	.y0((d, i) => {
    		s = 0;
    		this_index = genre_list.indexOf(d.genre_name)
    		lower_genres = full_data.filter(e => genre_list.indexOf(e.name) > this_index)
    		sum_array = lower_genres.map(e => e.periods).map(e => e.find(p => p.period == d.period)).map(e => e.count)
    		for (elem of sum_array) s += elem;
    		return streamgraph_height - (d.count * 10 + s * 10)
    	})
    	.curve(d3.curveCatmullRom.alpha(0.5))


	streamgraph = svg.selectAll('.genre_curve')
		.data(full_data)
		.enter()
		.append("path")
		.datum(d => d['periods'])
		.attr('fill', (d, i) => d3.interpolateRainbow(i/10.0))
		.attr("d", area)
		.attr("stroke", "#222")
		.attr("stroke-width", "0px")
		.attr('transform', 'translate('+ (smargin.left) +','+0+')')
		.on('click', d => console.log(d))
		.style("filter", "url(#glow)")
		.on('mouseover', d => {
			s = svg.selectAll('.artistlist').selectAll('.artist').filter(s => s.genres.includes(d[0].genre_name))
			s.style('font-weight', 'bold')
			s.each(artist => svg.selectAll('.tracklist').selectAll(".by-artist-" + artist.id).style("font-weight","bold"))
		})
		.on('mouseout', d => {
			s = svg.selectAll('.artistlist').selectAll('.artist').style('font-weight', 'normal')
			svg.selectAll('.tracklist').selectAll(".track").style('font-weight', 'normal')
		})

	periodbox = svg.selectAll('.periodbox')
		.data(ps)
		.enter()
		.append('g')
		.attr('class', 'periodbox')
		.attr('transform', (d, i) => {
			if (i == 0) t = 20
			else if (i == ps.length-1) t = -20
			return 'translate('+(t + smargin.left*2 + i * (width - smargin.left - smargin.right)/numsteps)+','+ 0 +')'
		})


    var line = d3.line()
         .x(function(d) { return d['x']; })
         .y(function(d) { return d['y']; });

	periodbox.append('path')
		.attr('class', 'defline')
		.attr('stroke', '#888')
		.attr('stroke-width', 1)
		.style("stroke-dasharray", ("5, 5")) 
        .attr("d", (d, i) => line([{x:0, y:80}, {x:0, y:streamgraph_height + 10}]));

	periodbox.append('text')
		.attr('text-anchor', 'middle')
		.attr('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif')
		.attr('font-size', '9pt')
		.attr('fill', '#888')
		.attr('x', 0)
		.attr('y', (streamgraph_height + 25) )
		.text(d => d)
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

	genre_list = genre_list.sort((a, b) => genre_count_total[a] < genre_count_total[b]).slice(0, 5)

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


load_streamgraph_data = () => {
	return new Promise(function(resolve, reject){
		full_data = [];
		d3.json('data/'+user+'-long-term-top-artists.json').then(function(data, error){
			long_term = preprocess(data);
			d3.json('data/'+user+'-short-term-top-artists.json').then(function(data, error){
				short_term = preprocess(data);
				d3.json('data/'+user+'-medium-term-top-artists.json').then(function(data, error){
					medium_term = preprocess(data);
					full_data.push({'short term': short_term});
					full_data.push({'medium term': medium_term});
					full_data.push({'long term': long_term});
					resolve(full_data);
				})
			})
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
	let genre_list = tmp[0]
	init_streamgraph(full_data, genre_list);
}