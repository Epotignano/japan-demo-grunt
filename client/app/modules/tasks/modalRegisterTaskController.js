
'use strict';

var modalRegisterTaskCtrl = function(tasksService, worksService, $modalInstance, param1) {
console.log("modal register task controller");

	var modal = this;

	modal.work = param1;

    modal.createTask = function(task) {
        task.createPromise = tasksService.createTask(task)
            .then(function(data) {
				//console.log("task: ", data);
				if (param1.tasks) {
					param1.tasks.push(data.id);
				} else {
					param1.tasks = [];
					param1.tasks.push(data.id);
				}
				worksService.updateWork(param1);
				$modalInstance.dismiss();
				window.location.reload();
            }, function(error) {
                task.error = error;
                //console.log("error creating task", task.error);
            });
    };

    modal.addStep = function () {
        if (modal.task.steps == undefined) {
            modal.task.steps = [];
            modal.task.steps.push(modal.step);
        } else {
            modal.task.steps.push(modal.step);
        }
        modal.step = "";
    };

    modal.cancelar = function () {
        $modalInstance.dismiss();
    };

	function init() {

	};

	//INITIALIZING
	init()

};

angular.module('tasksModule')
  .controller('modalRegisterTaskCtrl', modalRegisterTaskCtrl);
