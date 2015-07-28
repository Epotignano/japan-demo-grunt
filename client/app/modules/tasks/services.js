
'use strict';


var tasksService = function(fireRef, Kutral, $q, $firebaseArray) {

  var service = this;

  var kutral  = new Kutral(fireRef);

  var taskSchema = new Kutral.Schema({
      'title': {type: String, indexOn: true},
      'description': {type: String},
      'status': {type: String},
      'members': [{type: 'ObjectId', ref:'users'}],
      'images': [{type: String}],
  });

  var tasksDirectory = kutral.model('tasks', taskSchema);

  service.showTasks = function(){
    var tasksPromise = $q.defer();

    tasksDirectory.find().$asArray(function(data) {
      tasksPromise.resolve(data);
    });

    return tasksPromise.promise;
  }

  service.getTaskById = function(id){
    var getTaskByIdPromise = $q.defer();
 
    tasksDirectory.find({$id:id}, function(data) {
      getTaskByIdPromise.resolve(data);
    });
 
    return getTaskByIdPromise.promise;
  }

  service.createTask = function(task) {
    var taskCreationPromise = $q.defer();
    task.status = "pending";
    tasksDirectory.data = task;
    tasksDirectory.create(function(createdTask) {
      taskCreationPromise.resolve(createdTask);
    });

    return taskCreationPromise.promise;
  };

  service.updateTask = function(dataToUpdate) {
    console.log(dataToUpdate)
    var updateArticlePromise = $q.defer();
    tasksDirectory.data = dataToUpdate;

    tasksDirectory.update(function(success) {
      updateArticlePromise.resolve(tasksDirectory.data);
    });

    return updateArticlePromise.promise;

  };

  service.checkTaskTitleAvailability = function(name) {
      var titleAvailabilityPromise = $q.defer();
      tasksDirectory.find({"name" : name}, function(taskData) {
        titleAvailabilityPromise.resolve(!taskData)
      });

      return titleAvailabilityPromise.promise;
  };


};


angular.module('tasksModule')
  .service('tasksService', tasksService)
