
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

    ganttDirectory.find().$asArray(function(data) {
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

      dataToUpdate.forEach(function(data) {
        var loopPromise = $q.defer();
            console.log(data);

            if(data.tasks && data.tasks.length) {

              data.tasks.forEach(function(task) {
                task.from = task.from.format();
                task.to= task.to.format();
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
