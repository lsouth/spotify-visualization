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

	area = d3.area()
    	.x((d, i) => i*400)
    	.y1((d, i) =>{
    		s = 0;
    		this_index = genre_list.indexOf(d.genre_name)
    		lower_genres = full_data.filter(e => genre_list.indexOf(e.name) > this_index)
    		sum_array = lower_genres.map(e => e.periods).map(e => e.find(p => p.period == d.period)).map(e => e.count)
    		for (elem of sum_array) s += elem;
    		return streamgraph_height - s * 5
    	})
    	.y0((d, i) => {
    		s = 0;
    		this_index = genre_list.indexOf(d.genre_name)
    		lower_genres = full_data.filter(e => genre_list.indexOf(e.name) > this_index)
    		sum_array = lower_genres.map(e => e.periods).map(e => e.find(p => p.period == d.period)).map(e => e.count)
    		for (elem of sum_array) s += elem;
    		return streamgraph_height - (d.count * 5 + s * 5)
    	})
    	.curve(d3.curveCatmullRom.alpha(0.5))


	svg.selectAll('.genre_curve')
		.data(full_data)
		.enter()
		.append("path")
		.datum(d => d['periods'])
		.attr('fill', (d, i) => d3.interpolateRainbow(i/10.0))
		.attr("d", area)
		.attr("stroke", "#222")
		.attr("stroke-width", "3px")
		.attr('transform', 'translate(400)')
		.on('click', d => console.log(d))
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

	res2 = []
	for (elem in res){
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


async function loadStreamgraph() {
	let full_data = await load_streamgraph_data()
	let tmp = periods_by_genres(full_data)
	full_data = tmp[1]
	let genre_list = tmp[0]
	init_streamgraph(full_data, genre_list);
}