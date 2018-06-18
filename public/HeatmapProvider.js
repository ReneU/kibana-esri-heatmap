import optionsTemplate from './options_template.html';
import HeatmapVisualization from './HeatmapVisualization';
import { RequestHandlerProvider } from './RequestHandlerProvider';
import { handleResponse } from './ResponseHandler';

import { CATEGORY } from 'ui/vis/vis_category';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';

function HeatmapProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);
  const requestHandler = Private(RequestHandlerProvider);

  return VisFactory.createBaseVisualization({
    name: 'esri-heatmap',
    title: 'Esri Heatmap',
    icon: 'fa fa-line-chart',
    description: 'Esri Heatmap',
    category: CATEGORY.OTHER,
    visualization: HeatmapVisualization,
    responseHandler: handleResponse,
    requestHandler: requestHandler.handle,
    visConfig: {
      defaults: {
        geoField: 'center',
        maxEventCount: 100
      },
    },
    editorConfig: {
      optionsTemplate: optionsTemplate
    }
  });
}

VisTypesRegistryProvider.register(HeatmapProvider);