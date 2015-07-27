
'use strict';

angular.module('ganttModule')

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('app.gantt', {
                url: '/gantt',
                controller : 'ganttCtrl as gantt',
                templateUrl: 'app/modules/gantt/views/gantt.html',
                resolve : {
                    showGantt : function(ganttService) {
                        return ganttService.showGantt()
                    }
                }
            })
    })
