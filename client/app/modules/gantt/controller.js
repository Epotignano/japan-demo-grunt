
'use strict';

var ganttCtrl = function(showGantt, ganttService, $modal, $state) {

    var gantt = this;

    gantt.modalAddGanttTask = function () {
        var modalInstance = $modal.open({
            templateUrl: 'app/modules/gantt/views/modalAddGanttTask.html',
            controller: 'modalAddGanttTaskCtrl',
            controllerAs: 'modal',
            backdrop: 'static',
            resolve: {
                data: function() {
                    return gantt.data;
                }
            }
        });
    };

    gantt.modalAddGanttGroup = function () {
        var modalInstance = $modal.open({
            templateUrl: 'app/modules/gantt/views/modalAddGanttGroup.html',
            controller: 'modalAddGanttGroupCtrl',
            controllerAs: 'modal',
            backdrop: 'static',
            resolve: {
                data: function() {
                    return gantt.data;
                }
            }
        });
    };

   /* gantt.data2 = [
        {name: 'Wall', savedColor: '#2ecc71', children: ['Prepare the mixture', 'Laying bricks']},
            {name: 'Prepare the mixture', worker: 'Akio', tasks: [
                {name: '', color: '#2ecc71', from: String(moment("2015-9-17 8:00", "YYYY-MM-DD HH:mm")), to: String(moment("2015-9-19 7:00", "YYYY-MM-DD HH:mm")), progress: 5}
            ]},
            {name: 'Laying bricks', worker: 'Makoto', tasks: [
                {name: '', color: '#2ecc71', from: String(moment("2015-9-19 8:00", "YYYY-MM-DD HH:mm")), to: String(moment("2015-9-22 7:00", "YYYY-MM-DD HH:mm")), progress: 70}
            ]},
        {name: 'Spouts', savedColor: '#3498db', children: ['Gas', 'Water']},
            {name: 'Gas', worker: 'Jin', tasks: [
                {name: '', color: '#3498db', from: String(moment("2015-9-22 8:00", "YYYY-MM-DD HH:mm")), to: String(moment("2015-9-25 15:00", "YYYY-MM-DD HH:mm")), progress: 25}
            ]},
            {name: 'Water', worker: 'Itsuki', tasks: [
                {name: '', color: '#3498db', from: String(moment("2015-9-25 16:00", "YYYY-MM-DD HH:mm")), to: String(moment("2015-10-1 15:00", "YYYY-MM-DD HH:mm")), progress: 10}
            ]},
        {name: 'Painting', savedColor: '#e74c3c', children: ['Sand', 'Buy paint', 'Painting']},
            {name: 'Sand', worker: 'Akio', tasks: [
                {name: '', color: '#e74c3c', from: String(moment("2015-10-1 16:00", "YYYY-MM-DD HH:mm")), to: String(moment("2015-10-5 7:00", "YYYY-MM-DD HH:mm")), progress: 25}
            ]},
            {name: 'Buy paint', worker: 'Shizen', tasks: [
                {name: '', color: '#e74c3c', from: String(moment("2015-10-5 8:00", "YYYY-MM-DD HH:mm")), to: String(moment("2015-10-7 15:00", "YYYY-MM-DD HH:mm")), progress: 10}
            ]},
            {name: 'Painting', worker: 'Toru', tasks: [
                {name: '', color: '#e74c3c', from: String(moment("2015-10-7 16:00", "YYYY-MM-DD HH:mm")), to: String(moment("2015-10-14 15:00", "YYYY-MM-DD HH:mm")), progress: 10}
            ]},
    ];*/

    gantt.data = showGantt;
    gantt.data.forEach(function(data){
        data.id = data.$id;
    })
    console.log(gantt.data)


    gantt.options = {
        // gantt
        width: 30,
        headers: ['month', 'week', 'day'], // 'second', 'minute', 'hour', 'day','week', 'month', 'quarter', 'year'
        fromDate: null, // new Date(2015, 9, 25, 16, 0, 0)
        toDate: null, // new Date(2015, 9, 25, 16, 0, 0)
        currentDate: 'column', // 'none', 'line', 'column'
        currentDateValue: new Date(), // new Date(2015, 9, 25, 16, 0, 0)
        columnMagnet: '1 day', // 'column', '1 second', '1 minute', '5 minutes', '15 minutes', '1 hour', '1 day', '5 days'
        labelsEnabled: {
            "value": true, // true, false
            "true": "Showing side",
            "false": "Hiding side",
        },
        allowSideResizing: false, // true, false
        editGraph: {
            "value": false, // true, false
            "true": "Can edit graph",
            "false": "Can't edit graph"
        },
        // gantt-table
        columns: ['model.worker', 'from', 'to' ],
        columnsHeaders: {
         // 'model.name' : 'Name',
          'model.worker': 'Worker',
          'from': 'From',
          'to': 'To'
        },
        columnsClasses: {
            //'model.name' : 'gantt-column-name',
            'from': 'gantt-column-from',
            'to': 'gantt-column-to',
            'model.worker': 'gantt-column-worker'
        },
        columnsFormatters: {
            'from': function(from) {
                return from !== undefined ? from.format('ll') : undefined; // 'lll'
            },
            'to': function(to) {
                return to !== undefined ? to.format('ll') : undefined; // 'lll'
            },
        },
        columnsContents: {
            'model.worker': '{{getValue()}}'
        },
        columnsHeaderContents: {
            //'model.name': '<i class="fa fa-align-justify"></i> {{getHeader()}}',
            'from': '<i class="fa fa-calendar"></i> {{getHeader()}}',
            'to': '<i class="fa fa-calendar"></i> {{getHeader()}}',
            'model.worker': '<i class="fa fa-user"></i> {{getHeader()}}'
        },
    };

    gantt.maxWidth = 100;
    gantt.minWidth = 10;

    gantt.createGanttData = function() {
        gantt.data2.forEach(function(data){
            ganttService.createGantt(data).then(function(ganttUpdate){
                console.log("DATA TO SAVE: ", ganttUpdate);
            })
        })
    }
//gantt.createGanttData(gantt.data2)
    gantt.saveGanttData = function(ganttData) {
            ganttData.forEach(function(data){
                if(data.tasks){
                    data.tasks.forEach(function(task){
                        /*task.to =
                        task.from = */
                    })
                }
            })

            ganttService.saveGanttData(ganttData).then(function(ganttUpdate){
            })

    }

    function init() {
        console.log("gantt controller");
    };

    //INITIALIZING
    init()
};

angular
    .module('ganttModule', [
    'gantt',
    'gantt.movable',
    'gantt.drawtask',
    'gantt.tooltips',
    'gantt.bounds',
    'gantt.progress',
    'gantt.table',
    'gantt.tree',
    'gantt.groups',
    'gantt.resizeSensor',
    'gantt.sortable',
    'rzModule',
    'mp.colorPicker',
  ])
    .controller('ganttCtrl', ganttCtrl)

