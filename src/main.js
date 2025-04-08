import Map from 'ol/Map.js';
import 'ol/ol.css';
import './main.css';
import OSM from 'ol/source/OSM.js';
import TileWMS from 'ol/source/TileWMS.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { fromLonLat, toLonLat } from 'ol/proj.js';
import Overlay from 'ol/Overlay.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import XYZ from 'ol/source/XYZ.js';
import { Draw, Modify } from 'ol/interaction.js';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style.js';
import { getArea, getLength } from 'ol/sphere.js';
import { LineString, Polygon, Point } from 'ol/geom.js';
import { ScaleLine, defaults as defaultControls } from 'ol/control.js';

// carregamento do config.json
document.addEventListener("DOMContentLoaded", function () {
  //console.log('DOM carregado, aguardando render completo');
  setTimeout(() => {
    fetch(`/config.json?nocache=${Date.now()}`)
      .then(response => {
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        return response.json();
      })
      .then(configFile => {
        try {
          iniciarMapa(configFile);
        } catch (err) {
          console.error('Erro dentro do iniciarMapa:', err);
        }
      })
      .catch(error => {
        console.error('Erro ao carregar config.json:', error);
      });
  }, 100);
});


function iniciarMapa(configFile) {
  const esriLightGrayCanvas = new TileLayer({
    source: new XYZ({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    }),
  });

  const esriWorldImageryLayer = new TileLayer({
    source: new XYZ({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    }),
    visible: false,
  });

  const esriWorldTopoLayer = new TileLayer({
    source: new XYZ({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    }),
    visible: false,
  });

  const source = new VectorSource();
  const vectorLayer = new VectorLayer({
    source: source,
    style: function (feature) {
      return styleFunction(feature, showSegments.checked);
    },
  });

  //adicionar a escala
  const scaleControl = new ScaleLine({
    units: 'metric',  // fixa a unidade em métrica
    bar: false,        // mostra a barra de escala
    steps: 2,         // número de divisões na barra
    text: true,       // mostra o valor da escala
    minWidth: 50, // largura mínima da barra
    maxWidth: 150
  });

  const map = new Map({
    layers: [esriLightGrayCanvas, esriWorldImageryLayer, esriWorldTopoLayer, vectorLayer],
    target: 'map',
    view: new View({
      center: fromLonLat([-50.7805786132812, -13.9462928771973]),
      zoom: 4.8,
    }),
    controls: defaultControls().extend([scaleControl])  // Adiciona o controle de escala ao mapa
  });

  const layersSelecionados = {};
  const filtro = {
    concessionariasSelecionadas: {},
    unidadesFederacaoSelecionadas: {},
    rodoviasSelecionadas: {}
  };

  // adiciona as concessionárias
  for (const element in configFile['concessionarias']) {
    const nomeConcessionariaJson = element;
    const title = configFile['concessionarias'][element].title;

    let checkbox = document.createElement("input");
    checkbox.id = nomeConcessionariaJson;
    checkbox.type = "checkbox";

    let span = document.createElement("span");
    span.textContent = title;
    span.className = "lista-item";

    let a = document.createElement("a");
    a.className = "nav-link";
    a.href = "#";
    a.append(checkbox);
    a.append(span);

    let li = document.createElement("li");
    li.append(a);

    document.getElementById("listaConcessionarias").append(li);

    checkbox.onclick = function () {
      if (this.checked) {
        filtro['concessionariasSelecionadas'][nomeConcessionariaJson] = title;
      } else {
        delete filtro['concessionariasSelecionadas'][nomeConcessionariaJson];
      }
      exibirLayers(layersSelecionados, filtro);
    }
  }

  // adiciona as unidades da federação
  for (const element in configFile['rodovia_uf']) {
    const uf = element;
    const title = configFile['rodovia_uf'][element].title;

    let checkbox = document.createElement("input");
    checkbox.id = uf;
    checkbox.type = "checkbox";

    let span = document.createElement("span");
    span.textContent = title;
    span.className = "lista-item";

    let a = document.createElement("a");
    a.className = "nav-link";
    a.href = "#";
    a.append(checkbox);
    a.append(span);

    let li = document.createElement("li");
    li.append(a);

    document.getElementById("listaUnidadesFederacao").append(li);

    checkbox.onclick = function () {
      if (this.checked) {
        filtro['unidadesFederacaoSelecionadas'][uf] = title;
      } else {
        delete filtro['unidadesFederacaoSelecionadas'][uf];
      }
      exibirLayers(layersSelecionados, filtro);
    }
  }

  // adiciona as rodovias
  for (const element in configFile['rodovias']) {
    const rodovia = element;
    const title = configFile['rodovias'][element].title;

    let checkbox = document.createElement("input");
    checkbox.id = rodovia;
    checkbox.type = "checkbox";

    let span = document.createElement("span");
    span.textContent = title;
    span.className = "lista-item";

    let a = document.createElement("a");
    a.className = "nav-link";
    a.href = "#";
    a.append(checkbox);
    a.append(span);

    let li = document.createElement("li");
    li.append(a);

    document.getElementById("listaRodovias").append(li);

    checkbox.onclick = function () {
      if (this.checked) {
        filtro['rodoviasSelecionadas'][rodovia] = title;
      } else {
        delete filtro['rodoviasSelecionadas'][rodovia];
      }
      exibirLayers(layersSelecionados, filtro);
    }
  }

  /*// adiciona os sentidos
  for (const element in configFile['sentidos']) {
    const sentido = element;
    const title = configFile['sentidos'][element].title;

    let checkbox = document.createElement("input");
    checkbox.id = sentido;
    checkbox.type = "checkbox";

    let span = document.createElement("span");
    span.textContent = title;
    span.className = "lista-item";

    let a = document.createElement("a");
    a.className = "nav-link";
    a.href = "#";
    a.append(checkbox);
    a.append(span);

    let li = document.createElement("li");
    li.append(a);

    document.getElementById("listaSentido").append(li);

    checkbox.onclick = function () {
      if (this.checked) {
        filtro['sentidosSelecionados'][sentido] = title;
      } else {
        delete filtro['sentidosSelecionados'][sentido];
      }
      exibirLayers(layersSelecionados, filtro);
    }
  }*/


  // adiciona os layers
  for (const element in configFile['layers']) {
    const nomeLayerJson = element;
    const title = configFile['layers'][element].title;
    const url = configFile['layers'][element].url;
    const nomeLayerPostgis = configFile['layers'][element].nomeLayerPostgis;
    const permitirFiltroPorConcessionaria = configFile['layers'][element].permitirFiltroPorConcessionaria;

    const layer = new TileLayer({
      title: title,
      visible: false,
      source: new TileWMS({
        url: url,
        params: {
          'LAYERS': nomeLayerPostgis,
          'TILED': true
        },
        serverType: 'geoserver'
      })
    });
    map.addLayer(layer);

    let checkbox = document.createElement("input");
    checkbox.id = nomeLayerJson;
    checkbox.type = "checkbox";

    let span = document.createElement("span");
    span.textContent = title;
    span.className = "lista-item";

    let a = document.createElement("a");
    a.className = "nav-link";
    a.href = "#";
    a.append(checkbox);
    a.append(span);

    let li = document.createElement("li");
    li.append(a);

    document.getElementById("listaLayers").append(li);

    checkbox.onclick = function () {
      if (this.checked) {
        layersSelecionados[nomeLayerJson] = {layer, permitirFiltroPorConcessionaria};
      } else {
        delete layersSelecionados[nomeLayerJson];
      }
      exibirLayers(layersSelecionados, filtro);
    }
  }

  // elemento para o popup
  const popupElement = document.createElement('div');
  popupElement.className = 'ol-popup';
  const popupTitleElement = document.createElement('div');
  popupTitleElement.className = 'ol-popup-title';
  popupElement.appendChild(popupTitleElement);
  const popupContentElement = document.createElement('div');
  popupContentElement.className = 'ol-popup-content';
  popupElement.appendChild(popupContentElement);
  const closerElement = document.createElement('a');
  closerElement.href = '#';
  closerElement.className = 'ol-popup-closer';
  popupElement.appendChild(closerElement);

  // overlay para o popup
  const popupOverlay = new Overlay({
    element: popupElement,
    autoPan: false,
    autoPanAnimation: {
      duration: 250
    }
  });
  map.addOverlay(popupOverlay);

  // função para iniciar o arrasto da popup
  function startDragPopup(event) {
    event.preventDefault();

    // obter a posição inicial da popup em coordenadas do OpenLayers
    const overlayPosition = popupOverlay.getPosition();

    // converter as coordenadas do OpenLayers para pixels na tela
    const pixelPosition = map.getPixelFromCoordinate(overlayPosition);

    // calcular o deslocamento do cursor em relação ao topo e à esquerda da popup
    const offsetX = event.clientX - pixelPosition[0];
    const offsetY = event.clientY - pixelPosition[1];

    // função para mover a popup conforme o mouse é movido
    function movePopup(event) {
      event.preventDefault();

      // calcular a nova posição da popup em pixels
      const newLeft = event.clientX - offsetX;
      const newTop = event.clientY - offsetY;

      // converter a posição do pixel de volta para coordenadas do OpenLayers
      const newCoordinate = map.getCoordinateFromPixel([newLeft, newTop]);

      // atualizar a posição da popup
      popupOverlay.setPosition(newCoordinate);
    }

    // função para interromper o arraste da popup ao soltar o botão do mouse
    function stopDragPopup() {
      document.removeEventListener('mousemove', movePopup);
      document.removeEventListener('mouseup', stopDragPopup);
    }

    // adicionar ouvintes de evento para movimentar a popup
    document.addEventListener('mousemove', movePopup);
    document.addEventListener('mouseup', stopDragPopup);
  }

  // adicionar listener para iniciar o arrasto ao clicar na popup
  popupElement.addEventListener('mousedown', startDragPopup);

  // objeto de tradução de nomes de atributos
  const attributeTranslation = {
    nu_cnpj: 'CNPJ',
    no_fantasia: 'Concessão',
    no_rodovia: 'Rodovia',
    sg_uf: 'UF',
    km_m: 'Km',
    municipio: 'Municipio',
    tipo_pista: 'Tipo Pista',
    sentido: 'Sentido',
    tipo_ativo: 'Tipo do Ativo',
    latitude: "Latitude",
    longitude: 'Longitude'
  };

  // função para exibir o popup com informações formatadas em uma tabela
  function displayPopup(properties, coord) {
    const title = properties.rodovia ? ` ${properties.rodovia}` : '';
    popupTitleElement.innerHTML = `<h6>${title}</h6>`;

    let content = '<table class="popup-table">';

    // iterar sobre as propriedades e criar linhas da tabela
    for (const [key, value] of Object.entries(properties)) {
      const translatedKey = attributeTranslation[key] || key;
      let displayValue = value;

      if (typeof value === 'object' && value !== null) {
        displayValue = JSON.stringify(value);
      }

      content += `<tr><th>${translatedKey}</th><td>${displayValue}</td></tr>`;
    }

    content += '</table>';
    popupContentElement.innerHTML = content;

    // definir o tamanho fixo para o popup
    popupOverlay.setPosition(coord);
    popupElement.style.minWidth = '20vh'; // Largura mínima
    popupElement.style.maxWidth = '60vh'; // Largura máxima
    popupElement.style.maxHeight = '60vh'; // Altura máxima
    popupElement.style.minHeight = '10vh'; // Altura mínima
  }

  // adicionar interação de passagem do mouse para exibir a popup
  map.on('pointermove', function (event) {
    const pixel = map.getEventPixel(event.originalEvent);
    const coord = map.getCoordinateFromPixel(pixel);
    const viewResolution = map.getView().getResolution();


    // encontrar a camada correta que está visível
    let layerComInfoUrl = null;
    for (let key in layersSelecionados) {
      const {layer} = layersSelecionados[key];
      if (layer.getVisible() && layer.getSource() instanceof TileWMS) {
        layerComInfoUrl = layer;
        break;
      }
    }

    if (layerComInfoUrl) {
      const url = layerComInfoUrl.getSource().getFeatureInfoUrl(
          coord, viewResolution, 'EPSG:3857', {
            'INFO_FORMAT': 'application/json'
          }
      );


      if (url) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
              if (data.features && data.features.length > 0) {
                const properties = data.features[0].properties;
                displayPopup(properties, coord);
              }
            })
            .catch(err => {
              console.error('Erro ao buscar informações da feature:', err);
              popupOverlay.setPosition(undefined);
            });
      } else {
        popupOverlay.setPosition(undefined);
      }
    } else {
      popupOverlay.setPosition(undefined);
    }
  });

  // fechar o popup ao clicar no botão de fechar
  closerElement.onclick = function () {
    popupOverlay.setPosition(undefined);
    closerElement.blur();
    return false;
  };

  // função para exibir os layers selecionados
  function exibirLayers(layersSelecionados, filtro) {
    const concessionariasSelecionadas = filtro['concessionariasSelecionadas'];
    const unidadesFederacaoSelecionadas = filtro['unidadesFederacaoSelecionadas'];
    const rodoviasSelecionadas = filtro['rodoviasSelecionadas'];
    //const sentidosSelecionados = filtro['sentidosSelecionados'];

    const cql_filter_concessionarias = Object.keys(concessionariasSelecionadas)
        .map(key => `concession = '${concessionariasSelecionadas[key]}'`)
        .join(' OR ');

    const cql_filter_uf = Object.keys(unidadesFederacaoSelecionadas)
        .map(key => `uf = '${unidadesFederacaoSelecionadas[key]}'`)
        .join(' OR ');

    const cql_filter_rodovias = Object.keys(rodoviasSelecionadas)
        .map(key => `rodovia = '${rodoviasSelecionadas[key]}'`)
        .join(' OR ');

    /*const cql_filter_sentidos = Object.keys(sentidosSelecionados)
        .map(key => `sentido = '${sentidosSelecionados[key]}'`)
        .join(' OR ');*/

    const cql_filter = [cql_filter_concessionarias, cql_filter_uf, cql_filter_rodovias]
        .filter(Boolean)
        .join(' AND ');

    // oculta todas as camadas que não são base
    map.getLayers().forEach(layer => {
      if (layer !== esriLightGrayCanvas && layer !== esriWorldImageryLayer && layer !== esriWorldTopoLayer && layer !== vectorLayer) {
        layer.setVisible(false);
      }
    });

    // exibe apenas as camadas selecionadas
    for (let key in layersSelecionados) {
      const {layer, permitirFiltroPorConcessionaria} = layersSelecionados[key];
      let params = layer.getSource().getParams();

      if ((permitirFiltroPorConcessionaria && (cql_filter_concessionarias || cql_filter_rodovias)) || cql_filter_uf) {
        params['CQL_FILTER'] = cql_filter;
      } else {
        delete params['CQL_FILTER'];
      }

      layer.getSource().updateParams(params);
      layer.setVisible(true);
    }
  }

  // adicionar controle de coordenadas
  const coordenadasDiv = document.createElement('div');
  coordenadasDiv.className = 'ol-coordinates ol-unselectable ol-control';


  map.getTargetElement().appendChild(coordenadasDiv);

  // exibir coordenadas ao clicar no mapa
  map.on('click', function (evt) {
    const coordinate = toLonLat(evt.coordinate);
    const lon = coordinate[0].toFixed(6);
    const lat = coordinate[1].toFixed(6);
    coordenadasDiv.innerHTML = `Longitude: ${lon}, Latitude: ${lat}`;
  });

  // controle de visibilidade das camadas base
  const esriWorldImageryIcon = document.getElementById('satellite-layer');
  const esriWorldTopoIcon = document.getElementById('hillshade-layer');
  const opacityInput = document.getElementById('opacity-input');
  const opacityOutput = document.getElementById('opacity-output');

  function setBaseLayerVisibility(imageryVisible, topoVisible) {
    esriWorldImageryLayer.setVisible(imageryVisible);
    esriWorldTopoLayer.setVisible(topoVisible);
    esriLightGrayCanvas.setVisible(true);
  }

  esriWorldImageryIcon.addEventListener('click', function () {
    const isVisible = esriWorldImageryLayer.getVisible();
    setBaseLayerVisibility(!isVisible, false);
  });

  esriWorldTopoIcon.addEventListener('click', function () {
    const isVisible = esriWorldTopoLayer.getVisible();
    setBaseLayerVisibility(false, !isVisible);
  });

  opacityInput.addEventListener('input', function () {
    const value = parseFloat(this.value);
    opacityOutput.textContent = value.toFixed(2);
    esriWorldImageryLayer.setOpacity(value);
    esriWorldTopoLayer.setOpacity(value);
  });

  // funções para mostrar e esconder os menus
  const measurementIcon = document.getElementById('measurement-icon');
  const measurementControl = document.getElementById('measurement-control');
  const measurementCloseButton = document.getElementById('measurement-close-btn');
  const layerIcon = document.getElementById('layer-icon');
  const layerControl = document.getElementById('layer-control');
  const closeButton = document.getElementById('close-btn');
  const exportIcon = document.getElementById('export-icon');
  const exportControl = document.getElementById('export-control');
  const exportCloseButton = document.getElementById('export-close-btn');
  const exportButton = document.getElementById('export-pdf');

  function hideIcons() {
    measurementIcon.style.display = 'none';
    layerIcon.style.display = 'none';
    exportIcon.style.display = 'none';
  }

  function showIcons() {
    measurementIcon.style.display = 'flex';
    layerIcon.style.display = 'flex';
    exportIcon.style.display = 'flex';
  }

  measurementIcon.addEventListener('click', () => {
    measurementControl.style.display = measurementControl.style.display === 'block' ? 'none' : 'block';
    if (measurementControl.style.display === 'block') {
      hideIcons();
    } else {
      showIcons();
    }
  });

  measurementCloseButton.addEventListener('click', () => {
    measurementControl.style.display = 'none';
    showIcons();
  });

  layerIcon.addEventListener('click', () => {
    layerControl.style.display = layerControl.style.display === 'block' ? 'none' : 'block';
    if (layerControl.style.display === 'block') {
      hideIcons();
    } else {
      showIcons();
    }
  });

  closeButton.addEventListener('click', () => {
    layerControl.style.display = 'none';
    showIcons();
  });

  exportIcon.addEventListener('click', () => {
    exportControl.style.display = exportControl.style.display === 'block' ? 'none' : 'block';
    if (exportControl.style.display === 'block') {
      hideIcons();
    } else {
      showIcons();
    }
  });

  exportCloseButton.addEventListener('click', () => {
    exportControl.style.display = 'none';
    showIcons();
  });

  // inicialização da interação de medição
  const typeSelect = document.getElementById('type');
  const showSegments = document.getElementById('segments');
  const clearPrevious = document.getElementById('clear');
  const startMeasurementButton = document.getElementById('start-measurement');
  const stopMeasurementButton = document.getElementById('stop-measurement');
  const clearMeasurementsButton = document.getElementById('clear-measurements');

  const style = new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.5)',
      lineDash: [10, 10],
      width: 2,
    }),
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
    }),
  });

  const labelStyle = new Style({
    text: new Text({
      font: '14px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      padding: [3, 3, 3, 3],
      textBaseline: 'bottom',
      offsetY: -15,
    }),
  });

  const modify = new Modify({source: source, style: style});
  map.addInteraction(modify);

  let draw;

  function formatLength(line) {
    const length = getLength(line);
    let output;
    if (length > 100) {
      output = (Math.round(length / 1000 * 100) / 100) + ' km';
    } else {
      output = (Math.round(length * 100) / 100) + ' m';
    }
    return output;
  }

  function formatArea(polygon) {
    const area = getArea(polygon);
    let output;
    if (area > 10000) {
      output = (Math.round(area / 1000000 * 100) / 100) + ' km²';
    } else {
      output = (Math.round(area * 100) / 100) + ' m²';
    }
    return output;
  }

  function styleFunction(feature, segments) {
    const styles = [style];
    const geometry = feature.getGeometry();
    let point, label, line;
    if (geometry.getType() === 'Polygon') {
      point = geometry.getInteriorPoint();
      label = formatArea(geometry);
      line = new LineString(geometry.getCoordinates()[0]);
    } else if (geometry.getType() === 'LineString') {
      point = new Point(geometry.getLastCoordinate());
      label = formatLength(geometry);
      line = geometry;
    }
    if (segments && line) {
      let count = 0;
      line.forEachSegment(function (a, b) {
        const segment = new LineString([a, b]);
        const label = formatLength(segment);
        const segmentPoint = new Point(segment.getCoordinateAt(0.5));
        styles.push(new Style({
          geometry: segmentPoint,
          text: new Text({
            text: label,
            font: '12px Calibri,sans-serif',
            fill: new Fill({
              color: 'rgba(255, 255, 255, 1)',
            }),
            backgroundFill: new Fill({
              color: 'rgba(0, 0, 0, 0.4)',
            }),
            padding: [2, 2, 2, 2],
            textBaseline: 'bottom',
            offsetY: -12,
          }),
        }));
        count++;
      });
    }
    if (label) {
      labelStyle.setGeometry(point);
      labelStyle.getText().setText(label);
      styles.push(labelStyle);
    }
    return styles;
  }

  function addInteraction() {
    const drawType = typeSelect.value;
    draw = new Draw({
      source: source,
      type: drawType,
      style: function (feature) {
        return styleFunction(feature, showSegments.checked);
      },
    });
    draw.on('drawstart', function () {
      if (clearPrevious.checked) {
        source.clear();
      }
      modify.setActive(false);
    });
    draw.on('drawend', function () {
      modify.setActive(true);
    });
    map.addInteraction(draw);
  }

  function removeInteraction() {
    if (draw) {
      map.removeInteraction(draw);
      draw = null;
    }
  }

  startMeasurementButton.addEventListener('click', function () {
    removeInteraction();
    addInteraction();
  });

  stopMeasurementButton.addEventListener('click', function () {
    removeInteraction();
  });

  clearMeasurementsButton.addEventListener('click', function () {
    source.clear();
  });

  typeSelect.onchange = function () {
    removeInteraction();
    addInteraction();
  };

  showSegments.onchange = function () {
    vectorLayer.changed();
  };

  // função para colocar as camadas na tabela de layers
  function camadasNaTabela() {
    const table = document.getElementById('table-striped');
    table.innerHTML = '';
    for (let key in layersSelecionados) {
      const {layer} = layersSelecionados[key];
      const row = document.createElement('tr');
      const titleCell = document.createElement('td');
      titleCell.textContent = layer.get('title');
      row.appendChild(titleCell);
      table.appendChild(row);
    }
  }
  /*
  //função para contar os pontos
  for (const element in configFile['layers']) {
    contarPontos(configFile, element);

    async function contarPontos() {
      const urlGeoJson = configFile['layers'][element].urlJson;
      const nomeLayer = configFile['layers'][element].title;
      try {
        const response = await fetch(urlGeoJson);
        if (!response.ok) {
          throw new Error('Erro ao contar os pontos');
        }
        const data = await response.json();
        const totalFeicoes = data.totalFeatures;
        console.log(nomeLayer);
        console.log('Total de pontos:', totalFeicoes);
        //console.log('urlGeoJson', urlGeoJson);

      } catch (error) {
        console.error('Erro ao contar os pontos:', error);
      }
    }
  }*/

}
