import { loadCss, loadModules } from './libs/esri-loader';

const JS_API_URL = '//js.arcgis.com/3.24/';

export default class HeatmapVisualization {
  constructor(el, vis) {
    loadCss(`${JS_API_URL}esri/css/esri.css`);
    this.vis = vis;
    this.el = el;
  }

  destroy() {
    if (this.map) {
      this.map = undefined;
    }
    if (this.container) {
      this.el.removeChild(this.container);
      this.container = undefined;
    }
    this.el.innerHTML = `
      <div class='table-vis-error'>
        <h2 aria-hidden='true'>
          <i aria-hidden='true' class='fa fa-meh-o'></i>
        </h2>
        <h4>No results found</h4>
      </div>`;
  }

  createContainer() {
    this.el.innerHTML = '';
    const container = this.container = document.createElement('div');
    container.style.height = '100%';
    container.style.width = '100%';
    this.el.appendChild(container);
  }

  render({ source, objectIdField, fields }) {
    if (!source || !source.length) {
      this.destroy();
      return;
    }

    if (!this.container) {
      this.createContainer();
    }

    loadModules([
      'esri/map',
      'esri/geometry/Extent',
      'esri/geometry/Point',
      'esri/graphic',
      'esri/renderers/HeatmapRenderer',
      'esri/SpatialReference',
      'esri/layers/FeatureLayer'
    ], { url: JS_API_URL })
      .then(([Map, Extent, Point, Graphic, HeatmapRenderer, SpatialReference, FeatureLayer]) => {
        if (!this.map) {
          this.map = new Map(this.container, {
            basemap: 'topo',
            extent: new Extent({
              xmin: -117.2,
              ymin: 34.0551,
              xmax: -117.1921,
              ymax: 34.0589,
              spatialReference: { wkid: 4326 }
            })
          });
        } else {
          this.heatmaplayer && this.map.removeLayer(this.heatmaplayer);
          this.heatmaplayer = undefined;
        }
        const featureCollection = {
          layerDefinition: {
            geometryType: 'esriGeometryPoint',
            objectIdField,
            fields
          },
          featureSet: {
            features: source.map(item => {
              item.geometry.spatialReference = new SpatialReference(4326);
              const geometry = new Point(item.geometry.lon, item.geometry.lat);
              const graphic = new Graphic(geometry);
              graphic.setAttributes(item.attributes);
              return graphic;
            }),
            geometryType: 'esriGeometryPoint'
          }
        };
        const heatmaplayer = this.heatmaplayer = new FeatureLayer(featureCollection, {
          id: 'heatmaplayer'
        });
        const heatmapRenderer = new HeatmapRenderer({
          blurRadius: this.vis.params.blurRadius
        });
        heatmaplayer.setRenderer(heatmapRenderer);
        this.map.addLayer(heatmaplayer);

      })
      .catch(err => {
        console.error(err);
      });
  }
}
