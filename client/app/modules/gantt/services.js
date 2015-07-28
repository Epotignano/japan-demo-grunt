
'use strict';

var ganttService = function(fireRef, Kutral, $q, $firebaseArray) {

  var service = this;

  var kutral  = new Kutral(fireRef);

  var ganttSchema = new Kutral.Schema({
        // ????
  });

  var ganttDirectory = kutral.model('gantt', ganttSchema);

  service.showGantt = function(){
    var ganttPromise = $q.defer();

    var ganttRef = $firebaseArray(new Firebase(fireRef + '/gantt'));

    ganttRef.$loaded(function(data) {
      ganttPromise.resolve(data);
    });


    return ganttPromise.promise;
  }

  service.getGanttById = function(id){
    var getGanttByIdPromise = $q.defer();

    ganttDirectory.find({$id:id}, function(data) {
      getGanttByIdPromise.resolve(data);
    });

    return getGanttByIdPromise.promise;
  }

  service.createGantt = function(gantt) {
    var ganttCreationPromise = $q.defer();
    ganttDirectory.data = gantt;
    ganttDirectory.create(function(createdGantt) {
      ganttCreationPromise.resolve(createdGantt);
    });

    return ganttCreationPromise.promise;
  };

  service.updateGantt = function(dataToUpdate) {
    var updateArticlePromise = $q.defer();
    ganttDirectory.data = dataToUpdate;

    ganttDirectory.update(function(success) {
      updateArticlePromise.resolve(ganttDirectory.data);
    });

    return updateArticlePromise.promise;

  };

  service.saveGanttData = function(dataToUpdate){
    var saveGanttDataPromise = $q.defer();
      var promisesArray = [];

    function _isFunctionA(object) {
      return object && getClass.call(object) == '[object Function]';
    }

      dataToUpdate.forEach(function(data) {
        var loopPromise = $q.defer();
            console.log(data);

            if(data.tasks && data.tasks.length) {

              data.tasks.forEach(function(task) {
                if(_isFunctionA(task.from)) {
                  task.from = task.from.format();
                }

                if(_isFunctionA(task.to)) {
                  task.to= task.to.format();
                }
              });

              console.log(data);
            }

            service.updateGantt(data).then(function(ganttUpdate){
                loopPromise.resolve(ganttUpdate)
            });

        promisesArray.push(loopPromise.promise);
      });


      $q.all(promisesArray).then(function(results) {
        saveGanttDataPromise.resolve(results);
      })

      return saveGanttDataPromise.promise
  }

};

angular.module('ganttModule')
  .service('ganttService', ganttService)
