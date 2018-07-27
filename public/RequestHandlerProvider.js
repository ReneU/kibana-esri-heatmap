const getRequestBody = (params, queryFilter, timeFilter) => {
  const requestBody = {
    'size': params.maxEventCount,
    'query': {
      'bool': {
        'must': [
          {
            'exists': { 'field': params.geoField }
          },
          {
            'range': {
              'timestamp': {
                'gte': timeFilter.from,
                'lte': timeFilter.to
              }
            }
          }
        ]
      }
    }
  };

  if (params.actionField && params.actionName) {
    requestBody.query.bool.must.push({
      'match': { [params.actionField]: { 'query': params.actionName } }
    });
  }

  const queries = queryFilter.getFilters();
  if (queries && queries.length) {
    queries.forEach(({ meta }) => {
      if (meta.disabled) return;
      let query;
      switch (meta.type) {
        case 'phrase':
          query = {
            match: {
              [meta.key]: meta.value
            }
          };
          addMustQuery(requestBody, query, meta);
          break;
        case 'phrases':
          meta.params.forEach(param => {
            query = {
              match: {
                [meta.key]: param
              }
            };
            addShouldQuery(requestBody, query, meta);
          });
          break;
        case 'range':
          query = {
            range: {
              [meta.key]: meta.params
            }
          };
          addRangeQuery(requestBody, query, meta);
          break;
        case 'exists':
          query = {
            exists: {
              field: meta.key
            }
          };
          addMustQuery(requestBody, query, meta);
      }
    });
  }
  return requestBody;
};

function addMustQuery(request, query, { negate }) {
  const boolObject = request.query.bool;
  let matcher;
  if (negate) {
    matcher = boolObject.must_not ? boolObject.must_not : (boolObject.must_not = []);
  } else {
    matcher = boolObject.must ? boolObject.must : (boolObject.must = []);
  }
  matcher.push(query);
}

function addShouldQuery(request, query, { negate }) {
  let matcher;
  if (negate) {
    matcher = request.query.bool.must_not ? request.query.bool.must_not : (request.query.bool.must_not = []);
  } else {
    matcher = request.query.bool.should ? request.query.bool.should : (request.query.bool.should = []);
    request.query.bool.minimum_should_match = 1;
  }
  matcher.push(query);
}

function addRangeQuery(request, query, { negate }) {
  let matcher;
  if (negate) {
    matcher = request.query.bool.must_not ? request.query.bool.must_not : (request.query.bool.must_not = []);
  } else {
    matcher = request.query.bool.must;
  }
  matcher.push(query);
}

export function RequestHandlerProvider(Private, es) {
  return {
    handle(vis) {
      const { timeFilter, queryFilter } = vis.API;
      return new Promise(resolve => {
        const params = vis.params;
        const requestBody = getRequestBody(params, queryFilter, timeFilter.time);
        es.search({
          index: 'analytics',
          body: requestBody
        }).then(result => resolve(result));
      });
    }
  };
}