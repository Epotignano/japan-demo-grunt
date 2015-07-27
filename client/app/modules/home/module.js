
'use strict';

angular.module('homeModule')

	.config(function ($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('app.home', {
				url: '/',
				controller : 'homeCtrl as home',
        		templateUrl: 'app/modules/home/views/home.html'
			})
	})
