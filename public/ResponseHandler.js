export function handleResponse(vis, response) {
  if(!response.hits.hits || !response.hits.hits.length) return {};
  const source = response.hits.hits.map(event => {
    const attributes = event._source;
    return {
      geometry: {
        type: 'point',
        lat: attributes[vis.params.geoField].lat,
        lon: attributes[vis.params.geoField].lon
      },
      attributes: {
        scale: attributes.scale,
        objectid: event._id,
        test: 100
      }
    };
  });
  const objectIdField = 'objectid';
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
    }
  ];
  return { source, objectIdField, fields };
}