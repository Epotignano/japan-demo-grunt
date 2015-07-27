/**
 * Created by emiliano on 21/02/15.
 */



angular.module('fireQuery', ['firebase', 'fireQuery.aggregation', 'fireQuery.find', 'fireQuery.parsers'])
  .factory('Kutral', function ($firebaseObject, $firebaseArray, $q, aggregationKeys, aggregation, find, parsers) {


    function Queue() {

      // store your callbacks

      this._methods = [];

      // keep a reference to your response

      this._response = null;

      // all queues start off unflushed

      this._flushed = false;

    }

    Queue.prototype = {

      // adds callbacks to your queue

      add: function(fn) {

        // if the queue had been flushed, return immediately

        if (this._flushed) {

          fn(this._response);



          // otherwise push it on the queue

        } else {

          this._methods.push(fn);

        }

      },

      flush: function(resp) {

        // store your response for subsequent calls after flush()

        this._response = resp;

        // mark that it's been flushed

        this._flushed = true;

        // shift 'em out and call 'em back

        if (this._methods[0]) {

          this._methods.shift()(resp);

        }

      }

    };

    //initial instance
    var fireQuery = function (url) {
      this.fireUrl = url;
      this.queue = new Queue();
      this.baseUrl = url;
    };

    var determineAvailableIndexes = function(schema) {
      var indexes = {};

      if(schema) {
        var schemaKeys = Object.keys(schema);

        schemaKeys.map(function(key) {
          if(schema[key].indexOn) {
            indexes[key] = true;
          }
        });
      }

      return indexes;
    };



    var determineTypeOfDataRef = function(self) {

      var dataRef;

      if(self.sync) {
        var asArray = self.queue._methods.some(function(method) {return (method.name == "asArray") } );
        dataRef = (asArray) ? $firebaseArray(self.ref) : $firebaseObject(self.ref);
      } else {
        dataRef = self.ref;
      }

      return dataRef;
    };

    //Todo move schema from here
    fireQuery.Schema = function (schema) {
      this.schema = schema;
    };

    fireQuery.prototype.model = function (collectionKey, Schema) {
      this.collectionKey = collectionKey;
      this.internalSchema = Schema || {};
      this.indexes = determineAvailableIndexes(this.internalSchema.schema);
      this.fireUrl = this.fireUrl + collectionKey;
      this.ref = new Firebase(this.fireUrl);
      return this;
    }

    fireQuery.prototype.model.discriminator = function (discriminator, baseModel) {
      var instance;
      instance = new fireQuery(baseModel.baseUrl);
      instance.collectionKey = baseModel.collectionKey;
      instance.discriminator = discriminator;
      instance.model(instance.collectionKey+ '/'+instance.discriminator, baseModel.internalSchema.schema);
      return instance;
    };

    fireQuery.prototype.match = function(query, callback) {
      //should we support multiple matchs?
      var self = this;
      var queryKeys = Object.keys(query);

      self.queue.add(function(self) {
        if(queryKeys.length == 1 && queryKeys[0].indexOf("$") != -1) {

          var aggregationKeys = Object.keys(query);
          var aggregate;

          for(var i = 0; aggregationKeys.length > i; i++) {
            if(queryKeys[0] == aggregationKeys[i]) {
              aggregate = aggregationKeys[i];
              break;
            }
          }

          //retrive all and start the comparisions
          self.ref.on('value', function(collectionSnapshot) {
            var data = collectionSnapshot.val();
            var dataKeys = Object.keys(data);

            dataKeys.map(function(dataKey) {
              var deleteIt = aggregation[aggregate](query[aggregate], data, dataKey, true);
              if(deleteIt) {
                delete data[dataKey];
              }
            });

            self.data = data;

            if(!callback) {
              self.queue.flush(self);
            } else {
              callback(self.data);
            }
          });

        } else {

          self.ref.on('value', function(collectionSnapshot) {

            var data = collectionSnapshot.val();
            var aggregationKeys = [];
            var dataKeys = Object.keys(data);

            dataKeys.map(function(dataKey) {
              var matched = false;
              queryKeys.map(function(queryKey) {

                if(queryKey.indexOf("$") == -1 && !!query[queryKey] && data[dataKey][queryKey] && data[dataKey][queryKey].match(new RegExp(query[queryKey],'ig') )) {
                  matched = true;
                } else if(queryKey.indexOf("$") != -1 && aggregationKeys.indexOf(queryKey) == -1) {
                  aggregationKeys.push(queryKey)
                }
              });

              if(!matched) {
                delete data[dataKey];
              }

            });

            dataKeys = Object.keys(data);
            dataKeys.map(function(dataKey) {
              aggregationKeys.map(function(aggregationKey) {
                var deleteIt = aggregation[aggregationKey](query[aggregationKey], data, dataKey);
                if(deleteIt) {
                  delete data[dataKey]
                }
              });
            });

            self.data = data;

            if(!callback) {
              self.queue.flush(self);
            } else {
              callback(self.data);
            }

          })
        }

      });

      if(callback) {
        self.queue.flush(self);
      }

      return this;
    };

    fireQuery.prototype.find = function (query, callback, sync) {
      var self = this;

      self.queue.add(function(self) {
        if(query) {
          //TODO could be a function
          var dataRef = determineTypeOfDataRef(self);

          var useIndex;

          var asArray;

          if(query.hasOwnProperty('$id')) {
            if(self.sync || sync) {
              dataRef = (asArray) ? $firebaseArray(self.ref.child(query.$id)) : $firebaseObject(self.ref.child(query.$id));
              dataRef.$loaded(function(snapshot) {
                self.data = parsers.findByIdParser(self, query, snapshot);
                //self.data = snapshot;
                if(!callback) {
                  self.queue.flush(self);
                } else {
                  callback(self.data);
                }
              });
            } else {
              dataRef = self.ref.child(query.$id);
              dataRef.on('value', function(snapshot) {
                self.data = parsers.findByIdParser(self, query, snapshot.val());
                if(!callback) {
                  self.queue.flush(self);
                } else {
                  callback(self.data);
                }
              });
            }

          }  else {

            asArray = self.willCallAsArray || false;
            dataRef = (asArray) ? $firebaseArray(self.ref) : $firebaseObject(self.ref);

            var queryKeys = Object.keys(query);

            if(queryKeys.length === 1 && (queryKeys[0] === '$or' || queryKeys[0] === '$and')) {
              var aggregate;

              for(var i = 0; aggregationKeys.length > i; i++) {
                if(queryKeys[0] === aggregationKeys[i]) {
                  aggregate = aggregationKeys[i];
                  break;
                }
              }

              //retrive all and start the comparisions
              dataRef.$loaded(function(collectionSnapshot) {
                self.data = collectionSnapshot;
                var dataKeys = Object.keys(self.data);

                dataKeys.map(function(dataKey) {
                  if(dataKey.indexOf('$') === -1) {
                    var deleteIt = aggregation[aggregate](query[aggregate], self.data , dataKey);
                    if(deleteIt) {
                      delete self.data[dataKey];
                    }
                  }
                });

                if(!callback) {
                  self.queue.flush(self);
                } else {
                  callback(self.data);
                }

              });
            } else {
              queryKeys.some(function(key) {
                if(self.indexes[key] && !self.indexes[key].hasOwnProperty('$in') && key.indexOf('$') === -1) {
                  useIndex = key;
                  return true;
                }
              });

              if(!useIndex) {
                queryKeys.some(function(key) {
                  if(!query[key].hasOwnProperty('$in') && key.indexOf('$') === -1) {
                    useIndex = key;
                    return true;
                  }
                });
              }

              if(useIndex) {
                asArray = self.willCallAsArray || false;
                dataRef = (asArray) ? $firebaseArray(self.ref.orderByChild(useIndex).equalTo(query[useIndex])) : $firebaseObject(self.ref.orderByChild(useIndex).equalTo(query[useIndex]));

                dataRef.$loaded(function(obtainedData) {
                  self.data  = obtainedData;

                  if(self.data ) {
                    queryKeys.splice(queryKeys.indexOf(useIndex));
                    find.findPipeline(self.data , query, queryKeys, self);
                  }

                  if(!callback) {
                    self.queue.flush(self);
                  } else {
                    callback(self.data);
                  }
                });
              } else {
                dataRef.$loaded(function(obtainedData) {
                  self.data = obtainedData;

                  if(self.data) {
                    find.findPipeline(self.data , query, queryKeys, self);
                  }

                  if(!callback) {
                    self.queue.flush(self);
                  } else {
                    callback(self.data);
                  }

                });
              }
            }
          }
        } else {
          asArray = self.willCallAsArray || false;
          dataRef = (asArray) ? $firebaseArray(self.ref) : $firebaseObject(self.ref);
          dataRef.$loaded(function(collectionSnapshot) {
            self.data = collectionSnapshot;
            if(!callback) {
              self.queue.flush(self);
            } else {
              callback(self.data);
            }

          });
        }

      });

      if(callback) {
        self.queue.flush(self);
      }

      return this;
    };

    fireQuery.prototype.asObject = function() {
      return self.ref.$asObject();
    };

    fireQuery.prototype.$asArray= function (callback) {
      var self = this;
      self.willCallAsArray = true;
      self.queue.add(function asArray(self){
        self.data = _.compact(self.data);
        if(self.skipElements) {
          self.data = self.data.slice(self.skipElements);
        }

        if(self.limitTo) {
          self.data = _.take(self.data, self.limitTo);
        }

        if (callback) {
          callback(self.data)
        } else {
          self.queue.flush(self);
        }


      });

      if(callback) {
        self.queue.flush(self)
      }

      return this;

    };

    var populationProcess = function(promisesArray,self, key, objectKey) {

      var keyPromise = $q.defer();
      var query = (objectKey) ? self.data[objectKey][key] : self.data[key];
      var ref = self.internalSchema[key].ref;

      if (self.discriminator) {
        var findAndPopulate = new fireQuery(self.baseUrl.replace(self.collectionKey, ""));
      } else {
        var findAndPopulate = new fireQuery(self.baseUrl);
      }

      if(Object.prototype.toString.call(query) === '[object Array]') {
        findAndPopulate.model(ref, {});

        query.forEach(function(queryElement) {
          var elementPromise = $q.defer();
          promisesArray.push(elementPromise.promise);

          findAndPopulate.find({"$id": queryElement}, function (data) {
            data.$id = queryElement;
            if(self.data[objectKey] && self.data[objectKey][key]) {
              self.data[objectKey][key][(self.data[objectKey][key].indexOf(queryElement))] = data;
            }
            elementPromise.resolve();
          })
        })


      } else {
        promisesArray.push(keyPromise.promise);
        findAndPopulate.model(ref, {});
        if(query) {
          findAndPopulate.find({"$id": query}, function (data) {
            if(self.data[objectKey] && self.data[objectKey][key]) {
              self.data[objectKey][key] = data;

            } else if(self.data[key]){
              self.data[key] = data;
            }

            keyPromise.resolve();
          })


        } else {
          keyPromise.resolve();
        }

      }

    }

    fireQuery.prototype.populate = function(params, callback, sync) {

      var self = this;
      self.sync = sync;

      self.queue.add(function(self) {

        if(self.data && params) {
          var populatePromise = $q.defer();
          var Q = $q;
          var promisesArray = [];

          var populationKeys = params.split(" ");
          var dataObjKeys = Object.keys(self.data);

          populationKeys.map(function (key) {
            if(!self.data[key]) {
              dataObjKeys.map(function (objectKey) {
                if(objectKey.indexOf("$") == -1) {
                  populationProcess(promisesArray, self, key, objectKey)
                }
              })
            } else {
              populationProcess(promisesArray,self, key)
            }
          });

          Q.all(promisesArray)
            .then(function (results) {
              if (callback) {
                callback(self.data)
              } else {
                self.queue.flush(self);
              }
            })
          ;
          return populatePromise.promise
        } else {
          if (callback) {
            callback(self.data)
          } else {
            self.queue.flush(self);
          }
        }
      });

      if(callback) {
        self.queue.flush(self);
      }

      return this;

    };

    fireQuery.prototype.save = function(callback) {

      var self = this;

      var dataRef = $firebaseArray(self.ref);

      saveOrNotSaveDefaults(self.data, self.internalSchema);

      if(self.data.$id) {
        if(self.data.$save) {
          self.data.$save().then(function() {
            callback(self.data);
          });
        } else {
          var updateRef = self.ref.child(self.data.$id);
          var dataKeys = Object.keys(self.data);
          dataKeys.forEach(function(key) {
            if(key.indexOf("$") != -1) {
              delete(self.data[key])
            }
          });

          updateRef.update(self.data, function(error) {
            //!error = true ---> success
            //!error = false ---> error
            callback(!error)
          })
        }

      } else {

        dataKeys.forEach(function(key) {
          if(key.indexOf("$") != -1) {
            delete(self.data[key])
          }
        });

        dataRef.$add(self.data).then(function(ref) {
          self.data.id = ref.key();
          callback(self.data);
        });
      }
    };

    fireQuery.prototype.update = function(callback) {

      var self = this;

      var dataKeys = Object.keys(self.data);

      saveOrNotSaveDefaults(self.data, self.internalSchema);
      if(self.data.$save) {
        self.data.$save().then(function() {
          callback(self.data);
        });
      } else {
        //TODO detect id, could be different.
        var updateRef = self.ref.child(self.data.id);

        dataKeys.forEach(function(key) {
          if(key.indexOf("$") != -1) {
            delete(self.data[key])
          }
        });

        updateRef.update(self.data, function(error) {
          //!error = true ---> success
          //!error = false ---> error
          callback(!error)
        })
      }
    };

    fireQuery.prototype.create = function(callback) {

      var self = this;

      var dataRef = $firebaseArray(self.ref);

      var dataKeys = Object.keys(self.data);

      dataKeys.forEach(function(key) {
        if(key.indexOf("$") != -1) {
          delete(self.data[key])
        }
      });

      dataRef.$add(self.data).then(function(ref) {
        self.data.id = ref.key();
        callback(self.data);
      });

    };


    fireQuery.prototype.select = function(properties, callback) {
      var keys = properties.split(" ");
      var dataObjKeys = Object.keys(self.data);

      keys.map(function(key) {
        dataObjKeys.map(function(dataObjKey) {

          //self.data[dataObjKey][key]
        })
      });

      return this
    };

    fireQuery.prototype.limit = function(limitNumber, callback) {

      var self = this;

      self.queue.add(function(self) {

        if (callback) {
          if(self.data && limitNumber) {
            self.data= _.compact(self.data);
            self.data = _.take(self.data, limitNumber);
          }

          callback(self.data)
        } else {
          self.limitTo = limitNumber;
          self.queue.flush(self);
        }
      });

      if(callback) {
        self.queue.flush(self);
      }

      return this;

    };

    fireQuery.prototype.scroll = function(scrollCriteria, callback) {

      var self = this;

      self.queue.add(function(self) {

        var scrollRef = new Firebase.util.Scroll(self.ref, scrollCriteria);

        self.data = $firebaseArray(scrollRef);

        if(callback) {
          callback(self.data)
        }

      });

      if(callback) {
        self.queue.flush(self);
      }

      return this;
    };

    fireQuery.prototype.skip= function(skipNumber, callback) {

      var self = this;

      self.queue.add(function(self) {

        if (callback) {
          if(self.data && skipNumber) {
            self.data = self.data.slice(skipNumber);
          }

          callback(self.data)
        } else {
          self.skipElements = skipNumber;
          self.queue.flush(self);
        }
      });

      if(callback) {
        self.queue.flush(self);
      }

      return this;

    };

    fireQuery.prototype.remove = function(query, callback) {

      var self = this;

      self.queue.add(function(self) {

        var dataRef = self.ref.child(query.$id);

        dataRef.remove(function(error) {
          callback(!error);
        })

      });

      if(callback) {
        self.queue.flush(self);
      }
      return this;
    };

    fireQuery.prototype.sort = function(byProperties, callback) {

      var self = this;

      self.queue.add(function(self) {

        var propertiesKeys = Object.keys(byProperties);
        self.data = _.sortByOrder(self.data, propertiesKeys, determineOrders(byProperties, propertiesKeys));

        if(callback) {
          callback(self.data)
        } else {
          self.queue.flush(self);
        }

      });

      if(callback) {
        self.queue.flush(self);
      }

      return this;

    };

    var determineOrders = function(properties, keys) {
      var booleans = [];
      _.forEach(keys, function(key) {
        //sort descending = -1 sor ascending = 1
        booleans.push(( properties[key] == 1));
      });

      return booleans

    };

    var saveOrNotSaveDefaults = function(data, schema) {
      var schemaKeys = Object.keys(schema);

      _.forEach(schemaKeys, function(key) {
        if(!data[key] && schema[key] && schema[key].default) {
          data[key] = schema[key].default
        }
      })

    }


    fireQuery.prototype.promise = function() {
      //Todo implement a kind of promise, should we?
      var self = this;
      var Promise = $q.defer();
      return Promise.promise;
    };

    //TODO implement fireQuery,aggregate

    return fireQuery;

  });



