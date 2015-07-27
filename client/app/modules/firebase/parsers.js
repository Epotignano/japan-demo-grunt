/**
 * Created by emiliano on 08/04/15.
 */


var parsersServ = function() {
  var parsers = this;

  parsers.determineUniqueId = function(schema) {
    if(schema) {
      var schemaKeys = Object.keys(schema);
      var uniqueId;

      _.some(schemaKeys, function(key) {
        if(schema[key].hasOwnProperty("uniqueId")) {
          uniqueId = key
        }
      });

      return uniqueId || "id"
    } else {
      return "id";
    }

  };



  parsers.findByIdParser = function (self, query, snapshotData) {
    var uniqueIdKey = parsers.determineUniqueId(self.internalSchema.schema);
    if(snapshotData) {
      snapshotData[uniqueIdKey] = query.$id;
    }
    return snapshotData;
  };
};

angular.module('fireQuery.parsers', [])
  .service('parsers', parsersServ);




