
angular
  .module('musicFirstApplicationCloud', [
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
    'ganttModule',
    'landingModule',
    'homeModule'
  ])

  .constant('fireRef', 'https://japan-demo.firebaseio.com/')

  .run(function ($state, $rootScope) {
    $rootScope.$state = $state;
  })
