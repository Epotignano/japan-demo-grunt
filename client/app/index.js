'use strict';

angular
  .module('jpndemo', [
	// third party modules
	'ngAnimate',
	'ngCookies',
	'ngTouch',
	'ngSanitize',
	'ngResource',
	'ngStorage',
	'ui.router',
	'ui.bootstrap',
	'ngMaterial',
	'firebase',
	'fireQuery',
	'ngAutocomplete',
	'angularFileUpload',
	'ngFileUpload',
	'bootstrapLightbox',
	// our modules
	'config',
	'ceibo.ui.material.side-menu',
	'lixil.ui.list-photo',
	'ganttModule',
	'landingModule',
	'homeModule',
	'companiesModule',
	'worksModule',
	'tasksModule',
	'authModule',
  ])

	.constant('fireRef', 'https://japan-demo.firebaseio.com/')

	.run(function ($state, $rootScope) {
		$rootScope.$state = $state;
	})

	.config(function ($httpProvider, LightboxProvider) {
		$httpProvider.interceptors.push('AuthInterceptor');
		LightboxProvider.templateUrl = 'lightbox-modal.html';
	})
