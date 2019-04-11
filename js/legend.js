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
    .attr("class", "legend_text")
    .attr("font-size", "small")
    .attr("text-anchor", "end")
    .text(d => d)

  legend_lines.append("rect")
    .attr("x", 10)
    .attr("y", -10)
    .attr("width", 10)
    .attr("class", "legend_rect")
    .attr("height", 10)
    .attr("fill", (d, i) => genre_color(d))
}