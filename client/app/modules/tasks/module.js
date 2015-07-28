
'use strict';

angular.module('tasksModule')

	.config(function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('app.listTasks', {
				url: '/task/list/:workId',
				controller : 'tasksCtrl as list',
	        	templateUrl: 'app/modules/tasks/views/listTasks.html',
				resolve: {
					param1 : function(worksService, $stateParams) {
						var workId = $stateParams.workId;
						return worksService.getWorkById(workId)
					},
					param2 : function(tasksService) {
                        return tasksService.showTasks()
					}
				}
			})
			.state('app.updateTask', {
				url: '/task/update/:taskId',
				controller : 'tasksCtrl as update',
				templateUrl: 'app/modules/tasks/views/updateTask.html',
				resolve: {
					param1 : function(tasksService, $stateParams) {
						var taskId = $stateParams.taskId;
						return tasksService.getTaskById(taskId)
					},
					param2 : function(){
						return null
					}
				}
			})
	})
