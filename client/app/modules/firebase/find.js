/**
 * Created by emiliano on 08/04/15.
 */


var findService = function(parsers) {

  var serv = this;

  serv.findPipeline = function(data,query, queryKeys, self) {

    //queryKeys.splice(queryKeys.indexOf(useIndex));
    self.collectionSize = data.length;
    //if we have a query with multiple params, lets filter the data

    var uniqueIdKey = parsers.determineUniqueId(self.internalSchema.schema);

    if(queryKeys.length) {

      var dataKeys = Object.keys(data);
      var aggregationKeys = [];

      dataKeys.map(function(dataKey) {
        var deletedKey = false;
        queryKeys.map(function(queryKey) {
          if(!deletedKey) {
            if(query[queryKey].hasOwnProperty("$in")) {
              var deleteIt = aggregation.$in(query[queryKey].$in, data[dataKey], queryKey);
              if(deleteIt) {
                delete data[dataKey];
                deletedKey = true;
                //dataKeys.splice(dataKeys.indexOf(dataKey));
              }
            }
            else if(queryKey.indexOf("$") == -1 && !!query[queryKey] &&  data[dataKey][queryKey] != query[queryKey] ) {
              delete data[dataKey];
              deletedKey = true;
            } else if(queryKey.indexOf("$") != -1 && aggregationKeys.indexOf(queryKey) == -1) {
              aggregationKeys.push(queryKey);
            }
          }
        });
      });
    }

    //Agreggate pipeline
    if(aggregationKeys && aggregationKeys.length) {
      dataKeys.map(function(dataKey) {
        aggregationKeys.map(function(aggregationKey) {
          var deleteIt = aggregation[aggregationKey](query[aggregationKey], data, dataKey);
          if(deleteIt) {
            delete data[dataKey]
          } else {

            data[dataKey][uniqueIdKey] = dataKey;
          }
        });
      });
    }

    return data;
  }
};

angular.module('fireQuery.find', ['fireQuery.parsers'])
  .service('find', findService);

