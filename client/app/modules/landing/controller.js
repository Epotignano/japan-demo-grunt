
'use strict';

var landingCtrl = function($rootScope, $state) { //saque regionsService
	var landing = this;

	landing.state = $state;

	function init() {
		console.log("landing controller");

		//regionsService.createRegion({name_en: 'Hello Kutral'});
	}

	//INITIALIZING
	init()

}

var navBarCtrl = function($state, $rootScope) {

	var nav = this;

	function init() {

	};

	init();
};


angular
	.module('landingModule', [])
	.controller('landingCtrl', landingCtrl)
	.controller('navBarCtrl', navBarCtrl);

