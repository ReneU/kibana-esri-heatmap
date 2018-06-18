import { loadCss, loadModules } from './libs/esri-loader';

const JS_API_URL = '//js.arcgis.com/4.8/';

export default class HeatmapVisualization {
  constructor(el, vis) {
    loadCss(`${JS_API_URL}esri/css/main.css`);
    this.vis = vis;
    this.el = el;
  }

  destroy() {
    if (this.map) {
      this.map.removeAll();
      this.map = undefined;
      this.view = undefined;
    }
    if (this.container) {
      this.el.removeChild(this.container);
      this.container = undefined;
    }
    this.el.innerHTML = `
      <div class="table-vis-error">
        <h2 aria-hidden="true">
          <i aria-hidden="true" class="fa fa-meh-o"></i>
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

  render({ source, objectIdField, spatialReference, fields }) {
    if (!source || !source.length) {
      this.destroy();
      return;
    }

    if (!this.container) {
      this.createContainer();
    }

    loadModules(['esri/views/MapView', 'esri/Map', 'esri/layers/FeatureLayer'], { url: JS_API_URL })
      .then(([MapView, Map, FeatureLayer]) => {
        if (!this.map && !this.view) {
          const map = this.map = new Map({
            basemap: 'topo'
          });
          this.view = new MapView({
            map,
            container: this.container,
            extent: {
              xmin: -117.2,
              ymin: 34.0551,
              xmax: -117.1921,
              ymax: 34.0589
            }
          });
        } else {
          this.map.removeAll();
        }
        this.view.when(() => {
          const featureLayer = new FeatureLayer({
            geometryType: 'point',
            source, objectIdField, spatialReference, fields,
            renderer: {
              type: 'simple',
              symbol: {
                type: 'simple-marker',
                size: 6,
                color: 'black',
                outline: {
                  width: 0.5,
                  color: 'white'
                }
              }
            }
          });
          this.map.add(featureLayer);
        });
      })
      .catch(err => {
        console.error(err);
      });
  }
}
