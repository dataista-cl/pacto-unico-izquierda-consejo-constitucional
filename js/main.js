const alianzaUnidad = [
  {
      "nombre": "Unidad para Chile",
      "color": "#f43333",
      "partidos": ["FEDERACION REGIONALISTA VERDE SOCIAL", "PARTIDO COMUNISTA DE CHILE", "REVOLUCION DEMOCRATICA",
                  "ACCIÓN HUMANISTA", "PARTIDO LIBERAL DE CHILE", "PARTIDO SOCIALISTA DE CHILE", "CONVERGENCIA SOCIAL",
                  "COMUNES", "PARTIDO POR LA DEMOCRACIA", "PARTIDO RADICAL DE CHILE", "PARTIDO DEMOCRATA CRISTIANO"],
      "nombres": ["Unidad", "para Chile"]
  },
  {
      "nombre": "Independientes",
      "color": "#a139bb",
      "partidos": ["CANDIDATURAS INDEPENDIENTES"],
      "nombres": ["", "Indep."]
  },
  {
      "nombre": "Partido de la Gente",
      "color": "#48ab24",
      "partidos": ["PARTIDO DE LA GENTE"],
      "nombres": ["Partido de", "la Gente"]
  },
  {
      "nombre": "Chile Seguro",
      "color": "#2bbaee",
      "partidos": ["RENOVACION NACIONAL", "UNION DEMOCRATA INDEPENDIENTE", "EVOLUCION POLITICA"],
      "nombres": ["Chile", "Seguro"]
  },
  {
      "nombre": "Partido Republicano",
      "color": "#0c228d",
      "partidos": ["PARTIDO REPUBLICANO DE CHILE"],
      "nombres": ["Partido", "Republicano"]
  }
];

const alianzaSegura = [
  {
      "nombre": "Unidad para Chile",
      "color": "#f43333",
      "partidos": ["FEDERACION REGIONALISTA VERDE SOCIAL", "PARTIDO COMUNISTA DE CHILE", "REVOLUCION DEMOCRATICA",
                  "ACCIÓN HUMANISTA", "PARTIDO LIBERAL DE CHILE", "PARTIDO SOCIALISTA DE CHILE", "CONVERGENCIA SOCIAL",
                  "COMUNES", "PARTIDO POR LA DEMOCRACIA", "PARTIDO RADICAL DE CHILE", "PARTIDO DEMOCRATA CRISTIANO"],
      "nombres": ["Unidad", "para Chile"]
  },
  {
      "nombre": "Independientes",
      "color": "#a139bb",
      "partidos": ["CANDIDATURAS INDEPENDIENTES"],
      "nombres": ["", "Indep."]
  },
  {
      "nombre": "Partido de la Gente",
      "color": "#48ab24",
      "partidos": ["PARTIDO DE LA GENTE"],
      "nombres": ["Partido de", "la Gente"]
  },
  {
      "nombre": "Chile Seguro",
      "color": "#2bbaee",
      "partidos": ["RENOVACION NACIONAL", "UNION DEMOCRATA INDEPENDIENTE", "EVOLUCION POLITICA", "PARTIDO REPUBLICANO DE CHILE"],
      "nombres": ["Chile", "Seguro"]
  }
];

const windowWidth = window.innerWidth;

Promise.all([
  d3.csv("data/votos.csv"),
  d3.csv("data/cupos.csv"),
  d3.json("data/alianzas.json"),
  d3.json("data/partidos.json"),
  d3.json("js/es-ES.json")
]).then(function(data){

  const votos = data[0],
    cupos = data[1],
    alianzas = data[2],
    partidos = data[3];

  d3.formatDefaultLocale(data[4]);

  const partidosDict = {},
    alianzasDict = {};
  
  partidos.forEach(partido => {
    let colorFill = d3.color(partido.color);
    colorFill.opacity = 0.5;
    partidosDict[partido.nombre] = {
      "colorFill": colorFill,
      "colorStroke": d3.color(partido.color),
      "nombreCorto": partido.nombreCorto
    }
  });

  let overCircle = null,
    pactoNumber = alianzas.length + 1;

  votos.forEach(d => {
    d.partido = d.partido.trim();
    d.votos = +d.votos;
  });

  cupos.forEach(cupo => {
    cupo.cupos = +cupo.cupos;
  })

  const width = windowWidth < 500 ? 400 : windowWidth < 600 ? 500 : windowWidth < 800 ? 600 : windowWidth < 1000 ? 800 :  1000,
    height = 400;

  const bigFont = windowWidth < 700 ? 14 : 16,
    smallFont = windowWidth < 700 ? 12 : 14;

  const margin = {"top": 80, "bottom": 20};

  const ncols = windowWidth < 500 ? 2 : windowWidth < 600 ? 3 : windowWidth < 1000 ? 4 : 6;

  const svg = d3.select("#viz")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("font", "10px sans-serif")
    .attr("text-anchor", "middle");

  function plotEscanos(alianzasData, div, addLabels=true) {
    calculateVotes(alianzasData);

    const padding = windowWidth < 700 ? 4 : windowWidth < 1280 ?  6 : 8,
      radius = windowWidth < 460 ? 8 : windowWidth < 700 ? 9 : windowWidth < 1280 ?  10 : 14,
      labelHeight = 60,
      untercioPadding = 20;

    const svgWidth = 17 *  (2 * radius) + 18 * padding,
      svgHeight = 3 * (2 * radius) + 2 * padding + labelHeight + untercioPadding;

    const escanosData = alianzasData.map(alianza => {
      return d3.range(alianza.nRepresentantes).map(d => {
        return {
          "nombre": alianza.nombre,
          "index": d
        }
      }).flat()
    }).flat();

    escanosData.forEach((escano, i) => {
      escano.col = Math.floor(i / 3);
      escano.row = Math.floor(i % 3);
    });

    const escanosSvg = d3.select(`#${div}`)
      .selectAll("svg")
      .data([escanosData])
      .join("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("viewBox", [0, 0, svgWidth, svgHeight])
        .style("font", "10px sans-serif")
        .attr("text-anchor", "initial");

    const escanos = escanosSvg
      .selectAll(".escano")
      .data(d => d)
      .join("circle")
        .attr("class", "escano")
        .attr("r", radius)
        .attr("fill", (d) => alianzasDict[d.nombre].color)
        .attr("cx", d => (2 * d.col + 1) * radius + d.col * padding + padding / 2)
        .attr("cy", d => (2 * d.row + 1) * radius + d.row * padding + padding / 2 + untercioPadding);

    const escanosLabels = escanosSvg
      .selectAll(".escano-labels")
      .data(escanosData.filter(d => d.index === 0))
      .join("g")
        .attr("class", "escano-labels")
        .attr("fill", d => alianzasDict[d.nombre].color)
        .attr("transform", d => `translate(${2 * d.col * radius + d.col * padding + padding / 2},${3 * (2 * radius) + 2 * padding+ 20 + padding + untercioPadding})`)
    
    escanosLabels.selectAll("text")
      .data(d => [...alianzasDict[d.nombre].nombres,
        alianzasDict[d.nombre].nRepresentantes === 1 ? alianzasDict[d.nombre].nRepresentantes + " escaño" : alianzasDict[d.nombre].nRepresentantes + " escaños"])
      .join("text")
        .attr("dy", (d,i) => i * 16)
        .style("font-size", (d,i) => i <= 1 ? bigFont : smallFont)
        .style("font-weight", d => d.includes('votos') ? 300 : d.includes('escaño') ? 400 : 500)
        .style("letter-spacing", "-0.5px")
        .text(d => d);

    const labelColor = "#777";

    escanosSvg.selectAll(".untercio")
        .data([0])
        .join("path")
          .attr("class", "untercio")
          .attr("d", `M 1 ${1 + untercioPadding}
                    L ${12 * radius + 6 * padding} ${1 + untercioPadding}
                    L ${12 * radius + 6 * padding} ${4 * radius + 2 * padding + untercioPadding}
                    L ${10 * radius + 5 * padding} ${4 * radius + 2 * padding + untercioPadding}
                    L ${10 * radius + 5 * padding} ${6 * radius + 3 * padding + untercioPadding}
                    L 1 ${6 * radius + 3 * padding + untercioPadding}
                    L 1 ${1 + untercioPadding}`)
          .attr("fill", "none")
          .style("stroke", labelColor)
          .style("stroke-width", windowWidth < 700 ? 1.0 : 1.5)
          .style("stroke-location", "inside");

    if (addLabels === true) {
      escanosSvg.selectAll(".untercio-label")
          .data(["1/3 de escaños"])
          .join("text")
            .attr("class", "untercio-label")
            .style("text-anchor", "end")
            .attr("x", (12 * radius + 6 * padding))
            .attr("y", untercioPadding - 2)
            .attr("fill", labelColor)
            .text(d => d);
    }
  };

  function calculateVotes(alianzasData) {
    // D'Hondt
    const mostVotes = cupos.map(cupo => {

      // Calculate votes per alianza for each region
      const alianzaVotes = alianzasData.map(alianza => {
        const votosAlianza = votos.filter(voto => (voto.region === cupo.region) & (alianza.partidos.includes(voto.partido)))
          .reduce((a,b) => a + b.votos, 0);

        return {
          "nombre": alianza.nombre,
          "votosTotales": votosAlianza
        }
      });

      // Simulates D'Hondt voting by diving alianza votes per number of seats
      const allVotes = alianzaVotes.map(alianza => {
        return d3.range(1, cupo.cupos + 1).map(idx => {
            return {
              "nombre": alianza.nombre,
              "votos": alianza.votosTotales / idx
            }
          })
      }).flat();

      // Select the most voted based on number of seats
      return allVotes.sort((a,b) => b.votos - a.votos).slice(0, cupo.cupos);
    }).flat();

    alianzasData.forEach(alianza => {
      alianza.votosTotales = votos.filter(voto => alianza.partidos.includes(voto.partido))
        .reduce((a,b) => a + b.votos, 0);
      alianza.nRepresentantes = mostVotes.filter(vote => alianza.nombre === vote.nombre).length;
      alianzasDict[alianza.nombre] = {
        "color": alianza.color,
        "votosTotales": alianza.votosTotales,
        "nRepresentantes": alianza.nRepresentantes,
        "nombres": alianza.nombres
      }
    });
  }

  function updatePlot(alianzasData) {
    calculateVotes(alianzasData);

    const nrows = Math.ceil(alianzasData.length / ncols);

    const circlesData = {
      "name": "All",
      "children": alianzasData.map(alianza => {
          return {
            "name": alianza.nombre,
            "children": alianza.partidos.map(partido => {
              return {
                "name": partido,
                "value": votos.filter(voto => voto.partido === partido).reduce((a,b) => a + b.votos, 0)
              }
            })
          }
      })
    };

    const pack = data =>
      d3.pack()
        .size([width - 2, height - 2])
        .padding(3)(
          d3
            .hierarchy(data)
            .sum(d => d.value)
        );

    const gScale = d3
      .scalePoint()
      .padding(0.5)
      .domain(d3.map(alianzasData.filter(alianza => alianza.partidos.length > 0), (d) => d.nombre))
      .range([20, width-20]);

    const root = pack(circlesData);

    const mainnodes = root.descendants().filter((d) => d.height == 1);

    const alianzasCircles = root.descendants().filter((d) => d.height == 1);

    const maxRadius = d3.max(alianzasCircles, d => d.r);

    const widthPadding = maxRadius * 0.6;

    // const widthBand = d3.sum(mainnodes, (d) => d.r * 2 + widthPadding);
    const widthBand = windowWidth < 600 ? windowWidth : d3.sum(mainnodes, (d) => d.r * 2 + widthPadding);

    const rScale = d3.scaleLinear().domain([0, widthBand]).range([0, width]);

    const svgHeight = nrows * 2 * (rScale(maxRadius) + margin.top + margin.bottom);
    const stdY = svgHeight / 2;

    const circlePadding = 50
    let cumPos = circlePadding;
    alianzasCircles.forEach((alianza, alianzaIdx) => {
      const col = Math.floor(alianzaIdx % ncols),
        row = Math.floor(alianzaIdx / ncols) + 1;
      if (col === 0) cumPos = circlePadding;

      const pactoWidth = Math.max(rScale(alianza.r), 20);

      alianza.posX = cumPos + pactoWidth;
      cumPos += 2 * pactoWidth + circlePadding;

      alianza.posY = row * margin.top + (row - 1) * margin.bottom + (2 * row - 1) * rScale(maxRadius);
    });

    const posXExtent = d3.extent(alianzasCircles, d => d.posX);
    const midX = d3.sum(posXExtent) / 2;

    alianzasCircles.forEach(alianza => {
      alianza.posX = alianza.posX * width / 2 / midX;
    })
    
    svg.attr('height', svgHeight).attr("viewBox", [0, 0, width, svgHeight]);

    const drag = d3.drag()
      .on("start", startDragging)
      .on("drag", dragCircle)
      .on("end", endDragging);

    function dragCircle(event, d) {
      const [x, y] = event.identifier === "mouse" ? d3.pointer(event, svg.node()) : d3.pointer(event.sourceEvent.touches[0], svg.node());
      d3.select(this)
        .attr("transform", `translate(${x},${y})`);
      overCircle = overDragCircles(x, y);
      if (overCircle !== null) {
        outerNodes.filter(d => d.data.name === overCircle.data.name)
          .attr("stroke", d => alianzasDict[d.data.name].color)
          .attr("stroke-width", 3);
      } else {
        outerNodes.attr("stroke", "#BBB");
      }
    }
    
    function overDragCircles(x, y) {
      let thisCircle = null;
      alianzasCircles.forEach(circle => {
        if (Math.pow(x - circle.posX, 2) + Math.pow(y - circle.posY, 2) <= Math.pow(rScale(circle.r), 2)) {
          thisCircle = circle;
        }
      });
      return thisCircle;
    }
    
    function startDragging(event) {
      d3.select(this)
        .raise();
    }
    
    function endDragging(event, d) {
      const [x, y] = d3.pointer(event, svg.node());
      overCircle = overDragCircles(x, y);
      let removeIdx = null;
      if (overCircle === null) {
        alianzasData.forEach((alianza, idx) => {
          if (alianza.partidos.includes(d.data.name)) {
            let index = alianza.partidos.indexOf(d.data.name);
            alianza.partidos.splice(index, 1);

            if (alianza.partidos.length === 0) removeIdx = idx;
          }
        });
        if (removeIdx !== null) alianzasData.splice(removeIdx, 1);
        pactoNumber++;
        alianzasData.push({
          "nombre": "Pacto " + (pactoNumber),
          "color": partidosDict[d.data.name].colorStroke,
          "partidos": [d.data.name],
          "nombres": ["Nuevo", "Pacto " + pactoNumber]
        });
      } else if (overCircle.data.children.filter(ch => ch.name === d.data.name).length != 1) {
        pactoNumber++;
        alianzasData.forEach((alianza, idx) => {
          if (alianza.partidos.includes(d.data.name)) {
            let index = alianza.partidos.indexOf(d.data.name);
            alianza.partidos.splice(index, 1);

            if (alianza.partidos.length === 0) removeIdx = idx;
          }
        });
        if (removeIdx !== null) alianzasData.splice(removeIdx, 1);
        alianzasData.filter(alianza => alianza.nombre === overCircle.data.name)[0].partidos.push(d.data.name);
      }
      updatePlot(alianzasData);
    }

    const outerNodes = svg
      .selectAll(".outer-circle")
      .data(alianzasCircles)
      .join("circle")
      .attr("class", "outer-circle")
      .attr("r", (d) => rScale(d.r))
      .attr("fill", (d) => "none")
      .attr("stroke", d => alianzasDict[d.data.name].color)
      .attr("opacity", 0.8)
      .attr("stroke-width", 2)
      .attr("cx", d => d.posX)
      .attr("cy", d => d.posY);

    const groups = svg.selectAll(".partido")
      .data(alianzasCircles.map(d => d.children).sort((a,b) => b.r - a.r).flat())
      .join("g")
        .attr("class", "partido")
        .attr("transform", d => `translate(${d.parent.posX + rScale(d.x - d.parent.x)},${d.parent.posY + rScale(d.y - d.parent.y)})`)
        .call(drag);

    groups.selectAll(".inner-circle")
      .data(d => [d])
      .join("circle")
      .attr("class", "inner-circle")
      .attr("r", (d) => rScale(d.r))
      .attr("fill", (d) => partidosDict[d.data.name].colorFill)
      .attr("opacity", 0.5)
      .attr("stroke", d => partidosDict[d.data.name].colorStroke)
      .attr("stroke-width", 1.5)
      // .attr("cx", (d) => rScale(d.x - d.parent.x))
      // .attr("cy", (d) => rScale(d.y - d.parent.y))
      .attr("transform", `translate(0,0)`);

    const fontSize = 24;

    groups.selectAll(".inner-circle-label")
      .data(d =>[d])
      .join("text")
      .attr("class", "inner-circle-label")
      .attr("fill", (d) => partidosDict[d.data.name].colorStroke)
      .style("font-size", d => d3.min([fontSize, rScale(d.r)*2/3]))
      .style("font-weight", 700)
      .attr("dominant-baseline", "middle")
      // .attr("x", (d) => rScale(d.x - d.parent.x))
      // .attr("y", (d) => rScale(d.y - d.parent.y))
      .attr("transform", `translate(0,0)`)
      .text(d => partidosDict[d.data.name].nombreCorto);

    svg.selectAll(".labels").remove();

    const labels = svg
      .selectAll(".alianza-labels")
      .data(alianzasCircles)
      .join("g")
        .attr("class", "alianza-labels")
        .attr("fill", d => alianzasDict[d.data.name].color)
        .attr("transform", d => `translate(${d.posX},${d.posY - rScale(maxRadius) - 60})`)
    
    labels.selectAll("text")
      .data(d => [...alianzasDict[d.data.name].nombres,
        alianzasDict[d.data.name].nRepresentantes === 1 ? alianzasDict[d.data.name].nRepresentantes + " escaño" : alianzasDict[d.data.name].nRepresentantes + " escaños",
        d3.format(".3s")(alianzasDict[d.data.name].votosTotales) + ' votos'])
      .join("text")
        .attr("dy", (d,i) => i * 16)
        .style("font-size", (d,i) => i <= 1 ? bigFont : smallFont)
        .style("font-weight", d => d.includes('votos') ? 300 : d.includes('escaño') ? 400 : 500)
        .style("letter-spacing", "-0.5px")
        .text(d => d);

  }
  updatePlot(alianzas);
  plotEscanos(alianzas, "escanos-final", addLabels=true);
  plotEscanos(alianzaUnidad, "escanos-unidad", addLabels=false);
  plotEscanos(alianzaSegura, "escanos-seguro", addLabels=false);

})
