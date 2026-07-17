angular.module('beamng.apps')
.controller('ctrl', function ($scope, $mdSidenav) {
  const CONFIG_PATH = '/settings/beamshock/config.json';
  const DEFAULT_KEY = "your_token_here"
  
  const DEFAULT_LANG = 'en';
  const SUPPORT_LANGS = ['en'];
  let currentLanguage = DEFAULT_LANG;
  
  $scope.config = {
    modEnabled: false,
    api: {
      token: DEFAULT_KEY,
      userAgent: "BeamShock/0.0.1",
      shockerId: "your_shocker_id_here"
    },
    minShock: 5,
    maxShock: 30,
    minDamage: 10,
    maxDamage: 100000,
  }
  
  bngApi.engineLua("extensions.load('beamshock_main')");
  
  bngApi.engineLua(`jsonReadFile(${bngApi.serializeToLua(CONFIG_PATH)})`, 
  (config) => {
    if (config != null) {
      $scope.config = config;
    }
    bngApi.engineLua(
      `beamshock_main.onUpdateConfig(${bngApi.serializeToLua($scope.config)})`
    );
  })
  
  $scope.openSettings = openSettings();
  $scope.closeSettings = closeSettings();
  
  function openSettings() {
    return function() {
      $mdSidenav('settings').open();
    }
  }
  
  function closeSettings() {
    return function() {
      let v = validateSettings();
      if (!v.valid) {
        console.warn('Invalid settings: ' + v.reason);
        $scope.invalidReason = v.reason;
      }
      else {
        $scope.invalidReason = '';
        $mdSidenav('settings').close();
        bngApi.engineLua('jsonWriteFile(' 
          + bngApi.serializeToLua(CONFIG_PATH) + ', ' 
          + bngApi.serializeToLua($scope.config) + ', ' 
          + bngApi.serializeToLua(true) + ')');
        bngApi.engineLua('beamshock_main.onUpdateConfig(' 
          + bngApi.serializeToLua($scope.config) + ')');
      }
    }
  }
  
  // Only checks against basic input mistakes. Doesn't validate with API.
  function validateSettings() {
    s = $scope.config;
    valid = false
    reason = ''
    if (!s.api.key) {
      reason = 'Missing API key';
    }
    else if (s.api.key == DEFAULT_KEY || s.api.key == '') {
      reason = 'Missing API key';
    }
    else if (!s.api.shockerId) {
      reason = 'Missing shocker ID';
    }
    else if (s.api.shockerId == '') {
      reason = 'Missing shocker ID';
    }
    else if (s.minShock > s.maxShock) {
      reason = 'Max shock must be greater or equal to min shock';
    }
    else if (s.minShock < 1 || s.minShock > 100) {
      reason = 'Min shock must be 1-100';
    }
    else if (s.maxShock < 1 || s.maxShock > 100) {
      reason = 'Max shock must be 1-100';
    }
    else if (s.minDamage > s.maxDamage) {
      reason = 'Max damage must be greater or equal to min damage';
    }
    else if (!s.minDamage) {
      reason = 'Invalid min damage';
    }
    else if (!s.maxDamage) {
      reason = 'Invalid max damage';
    }
    else {
      valid = true
    }
    return {valid: valid, reason: reason};
  }
  
  $scope.unit = function(...args) { return UiUnits.buildString(...args); }
  
  // Get user language settings. ('<lang>_<country>')
  // ref: 0.25\lua\common\utils\languageMap.lua
  bngApi.engineLua('Lua:getSelectedLanguage()', (userLang) => {
    let _lang = userLang.split('_')[0];
    currentLanguage = (SUPPORT_LANGS.includes(_lang)) ? _lang : DEFAULT_LANG;
    console.log('set language: ' + currentLanguage);
    
    $scope.ui = getLocale(currentLanguage).UI;
    $scope.ui.speedUnit =  UiUnits.speed(0).unit;
    $scope.ui.lengthUnit =  UiUnits.length(10).unit;
  });
  
  function getLocale(localeName){
    return new EnLocale();
  };
  
  class LocalInfoBase {
    UI = {
      closeButtonText: 'Apply and Close',
      
      settingsTitle: 'BeamShock Settings',
      modEnabled: {
        title: 'Mod enabled',
      },
      minShock: {
        title: 'Min shock: ',
        unit: '%'
      },
      maxShock: {
        title: 'Max shock: ',
        unit: '%'
      },
      minDamage: {
        title: 'Min damage: ',
        description: 'Minimum damage required to trigger the minimum shock',
        unit: 'J'
      },
      maxDamage: {
        title: 'Max damage: ',
        description: 'Any damage equal or greater to this value will result in the maximum shock',
        unit: 'J'
      },
      api: {
        key: {
          title: 'API key'
        },
        shockerId: {
          title: 'Shocker ID'
        }
      }
    }
  };
  
  class EnLocale extends LocalInfoBase {};
  
})
.directive('beamshock', [function () {
  return {
    templateUrl: '/ui/modules/apps/beamshock/app.html',
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
      'use strict';
    }
  }
}])
