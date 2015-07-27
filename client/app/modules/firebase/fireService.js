/**
 * Created by emiliano on 06/02/15.
 */
angular.module('fireServiceModule', ['firebase'])

  .service('fireService', function($q, $firebaseObject, $firebaseArray, fireRef) {

    var serv = this;
    var ref = fireRef;

    serv.save = function(collection, entityKey, data) {
      if(collection && entityKey) {
        $firebase(ref.child(collection).child(entityKey))
      }
    };

    serv.getTimeStamp = function() {
      return Firebase.ServerValue.TIMESTAMP;
    };

    serv.getRefObject = function() {
      return ref;
    };

    serv.select = function(item, properties) {
      var obj = {};
      var keys = properties.split(" ");

      keys.map(function(key) {
        obj[key] = item[key]
      });

      return obj
    };
    serv.remove = function(collection, id){
      var deleteObjectPromise = $q.defer();

      var ref = new Firebase(fireRef + '/' + collection + '/' +  id);

      var obj = $firebaseObject(ref);

      obj.$remove().then(function(ref) {
        deleteObjectPromise.resolve(ref);
      }, function(error) {
        deleteObjectPromise.reject(error);
      });

      return deleteObjectPromise.promise;
    };

    serv.find = function(collection, queryParams, objectType) {
      var findObjPromise = $q.defer();
      var sync;
      var Q = $q;

      var query = ref.child(collection);

      if(queryParams.subCollection) {
        query = query.child(queryParams.subCollection);
      }
      if(queryParams.$id) {
        query = query.child(queryParams.$id);
      }

      if(!queryParams.$id){
        //var promiseArrays = [];
        delete queryParams.subCollection;
        var keys = Object.keys(queryParams);

        keys.map(function(key) {
          if(keys.length == 1 ){
            query = query.orderByChild(key).startAt(queryParams[key]);
          } else {
          }
        });

        /*
        promiseArrays.push(queryPromise.promise);

        Q.all(promiseArrays)
          .then(function(results) {
            console.log(results);
          })*/


      }

      sync = $firebase(query);

      if(objectType && objectType == 'array') {
        var record = sync.$asArray();
      } else {
        var record = sync.$asObject();
      }
      record.$loaded().then(function() {
        findObjPromise.resolve(record);
      });

      return findObjPromise.promise;
    };




    serv.populate = function(fireObject, params) {
      var populatePromise = $q.defer();
      var Q = $q;
      var promisesArray = [];
      var populationKeys = params.split(" ");;

      populationKeys.map(function(key) {
        var keyPromise = $q.defer();
        var query = fireObject[key];
        var ref = fireObject.population[key];

        promisesArray.push(keyPromise.promise);

        serv.find(ref, {"$id": query })
          .then(function(data) {
            fireObject[key] = data;
            keyPromise.resolve(data);
          })
      });

      Q.all(promisesArray)
        .then(function(populatedData) {
          populatePromise.resolve(fireObject);
        })
      ;

      return populatePromise.promise

    };

    serv.parseResults = function(result) {

      if(!result.hasOwnProperty("$value"))

      var keys = Object.keys(result);
      var obj = {};

      keys.forEach(function(key) {
        if(key.indexOf("$") == -1) {
          obj[key] = result[key]
        }
      });

      return obj;

    };

    serv.match = function(collection,propertyToMatch, query, subCollection) {
      var sync;
      /*if(propertyToMatch.indexOf(".") != -1) {
        var properties = propertyToMatch.split(".");
        sync = $firebase(ref.child(collection).child(properties[0]).child(properties[1]).orderByChild(properties[1]).startAt(query).endAt(query+"~"));
      } else {*/
     // }

      if(subCollection) {
        sync = $firebase(ref.child(collection).child(subCollection).orderByChild(propertyToMatch).startAt(query).endAt(query+"~"));
      } else {
        sync = $firebase(ref.child(collection).orderByChild(propertyToMatch).startAt(query).endAt(query+"~"));
      }

      var matchPromise = $q.defer();

      var record = sync.$asObject();
      record.$loaded().then(function(data) {
        matchPromise.resolve(data);
      });

      return matchPromise.promise;

    };

    serv.retrieveAll = function(collection, subCollection, type) {
      var findAllPromise = $q.defer();

      if(subCollection) {
        var sync = $firebase(ref.child(collection).child(subCollection))
      } else {
        var sync = $firebase(ref.child(collection));
      }

      if(type && type == 'array') {
        var record = sync.$asArray();
      } else {
        var record = sync.$asObject();
      }

      record.$loaded().then(function() {

        findAllPromise.resolve(record);
      });

      return findAllPromise.promise;
    };

    serv.saveAsObject = function(saveObject) {
      saveObject.$save()
    };

    serv.findAndGetObject = function(collection, entityKey, objectType) {
      if (collection && entityKey && entityKey.length) {
        var syncObj = new Firebase(ref + "/" + collection + "/" + entityKey);
      } else if (collection) {
        var syncObj = new Firebase(ref + "/" + collection);
      }

      if (objectType == 'object') {
        return $firebaseObject(syncObj);
      } else if(objectType == 'array') {
        return $firebaseArray(syncObj);
      }else {
        return syncObj;
      }
    }

    serv.initAndGetObject = function(collection, initObject, subCollection){
      var newObjPromise = $q.defer();
      if(subCollection) {
        if(collection == 'optins') {
          var syncObj =  new Firebase(ref + "/" + collection +"/" + subCollection)

      } else {
        var syncObj =  new Firebase(ref + "/" + collection +"/")
      }
     }

      if(collection == 'optins') {
        syncObj.set(initObject, function(error){
          newObjPromise.resolve(syncObj);
        });
      } else {
        syncObj.push(initObject).then(function(error){
          newObjPromise.resolve(syncObj);
        });
      }

      return newObjPromise.promise;

    };

    serv.objectExists = function(collection, entityKey, subCollection){
      var objectRefExists = $q.defer();
      var objectRef;
      if (subCollection){
        objectRef = new Firebase(ref + "/" + collection +"/" + subCollection + "/" + entityKey);
      }
      else{
        objectRef = new Firebase(ref + "/" + collection +"/"+  entityKey)
      }

      objectRef.once('value', function(snapshot){
        //TODO IMPLEMENT IT AGAIN  objectRefExists.resolve((snapshot.val() !== null));
        objectRefExists.resolve((false));
      });

      return objectRefExists.promise;
    };

    serv.query = function(query){

      var queryPromise = $q.defer();
      var _location = query.location;
      var _orderBy = query.orderBy;
      var _startAt = query.startAt;
      var _endAt  = query.endAt;

      if(_location){
        var _ref = new Firebase(ref + _location);
        if(_orderBy){
          _ref = _ref.orderByChild(_orderBy);
          if(_startAt){
            _ref =_ref.startAt(_startAt)
          }
          if(_endAt){
            _ref = _ref.endAt(_endAt)
          }
        }
        var _array = $firebaseArray(_ref);
        _array.$loaded().then(function(){
          queryPromise.resolve(_array);
        });

      }
      else{
        queryPromise.reject();
      }
      return queryPromise.promise;
    };
    window._query = serv.query;
  });
