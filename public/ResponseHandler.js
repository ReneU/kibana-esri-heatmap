export function handleResponse(vis, response) {
  if(!response.hits.hits || !response.hits.hits.length) return {};
  const source = response.hits.hits.map(event => {
    const attributes = event._source;
    return {
      geometry: {
        type: 'point',
        x: attributes.center.x,
        y: attributes.center.y,
        spatialReference: attributes.center.spatialReference.latestWkid
      },
      attributes: {
        scale: attributes.scale,
        objectid: event._id,
        test: 100
      }
    };
  });
  const objectIdField = 'objectid';
  const spatialReference = response.hits.hits[0]._source.center.spatialReference.latestWkid;
  const fields = [
    {
      name: 'objectid',
      alias: 'ObjectID',
      type: 'oid'
    },
    {
      name: 'scale',
      alias: 'Scale',
      type: 'double '
    },
    {
      name: 'test',
      alias: 'test',
      type: 'integer'
    }
  ];
  return { source, objectIdField, spatialReference, fields };
}