
'use strict';

var homeCtrl = function($modal) {

	var home = this;

    home.modalRegisterCompany = function () {
        var modalInstance = $modal.open({
            templateUrl: 'app/modules/companies/views/modalRegisterCompany.html',
            controller: 'modalRegisterCompanyCtrl',
            controllerAs: 'modal',
            backdrop: 'static'
        });
    };

	function init() {
		console.log("home controller");
	};

	//INITIALIZING
	init()
};

angular
	.module('homeModule', [])
	.controller('homeCtrl', homeCtrl)

