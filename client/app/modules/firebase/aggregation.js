/**
 * Created by emiliano on 24/02/15.
 */



var aggregation = function(aggregationKeys) {

  var aggregation = this;

  aggregation.$or = function(orArray, data, dataKey, isMatch) {
    var candidateToDelete = true;
    for(var i = 0; orArray.length > i; i++) {
      var condition = orArray[i];

      var conditionKey = Object.keys(condition)[0];

      if(aggregationKeys.indexOf(conditionKey) != -1) {
        aggregation[conditionKey].apply(orArray[conditionKey], data, dataKey);
      } else {
        if(!isMatch) {
          if(data[dataKey][conditionKey] == condition[conditionKey]) {
            candidateToDelete = false;
            break;
          }
        } else {
          if(data[dataKey][conditionKey].match(/condition[conditionKey]/ig)) {
            candidateToDelete = false;
            break;
          }
        }

      }
    }

    return candidateToDelete;

  };

  aggregation.$and = function(andArray, data, dataKey, isMatch) {

    var candidateToDelete = false;

    for (var i = 0; andArray.length > i; i++) {
      var condition = andArray[i];

      var conditionKeys = Object.keys(condition);

      for(var j= 0; conditionKeys.length > j; j++) {

        if (aggregationKeys.indexOf(conditionKeys[j]) != -1) {
          candidateToDelete = aggregation[conditionKeys[j]](andArray[0][conditionKeys[j]], data, dataKey);

          if(candidateToDelete) {
            break;
          }

        } else {
          if(!isMatch) {
            if(condition[conditionKeys[j]].hasOwnProperty("$in")) {
              candidateToDelete = aggregation.$in(condition[conditionKeys[j]].$in, data[dataKey], conditionKeys[j]);
              if(candidateToDelete) {
                break;
              }
            } else {
              if (data[dataKey][conditionKeys[j]] != condition[conditionKeys[j]]) {
                candidateToDelete = true;
                break;
              }
            }

          } else {
            if(!(data[dataKey][conditionKeys[j]].match(new RegExp(condition[conditionKeys[j]],"ig") ) )) {
              candidateToDelete = true;
              break;
            }
          }

        }

      }
    }

    return candidateToDelete;
  };

  //Todo rethink it before integrate it to Kutral

  aggregation.$not = function(notObj, data, keyParent) {
    var notKey = Object.keys(notObj);
    var candidateToDelete = false;

    if(data[dataKey][notKey] == notObj[notKey]) {
      candidateToDelete = true;
    }
    return candidateToDelete;
  }

  aggregation.$in = function(inArray, data, keyParent) {
    var candidateToDelete = true;
    inArray.forEach(function(condition) {
      if(data[keyParent]) {
        data[keyParent].some(function(dataElement) {
          if(dataElement == condition){
            candidateToDelete = false;
            return
          }
        })
      } else {
        candidateToDelete = true;
      }
    })

    return candidateToDelete;
  }

};


angular.module('fireQuery.aggregation', [])
  .constant("aggregationKeys", ["$or", "$and", "$not", "$in"])
  .service('aggregation', aggregation);
