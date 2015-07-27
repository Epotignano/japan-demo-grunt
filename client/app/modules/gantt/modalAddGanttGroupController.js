
'use strict';

var modalAddGanttGroupCtrl = function(ganttService, $modalInstance, data) {
console.log("modal register gantt group controller");

    var modal = this;

    modal.data = data;

    // gantt group creation
    modal.addGanttGroup = function() {
        var newData = {name: modal.groupName, savedColor: modal.groupColor, children: []};
        data.push(newData);
        modal.groupName = "";
        modal.groupColor = "";
        console.log(newData);
    };

    // modal close
    modal.cancelar = function() {
        $modalInstance.dismiss();
    };

    function init() {

    };

    //INITIALIZING
    init()

};

angular.module('ganttModule')
  .controller('modalAddGanttGroupCtrl', modalAddGanttGroupCtrl);
