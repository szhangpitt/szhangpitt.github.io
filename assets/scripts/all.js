function loadData() {
    angular.element(document.getElementById("appBody")).scope().$apply(
        function($scope) {
            $scope.getLinkedInData();
        });
}

function onLinkedInJSLoad() {
    angular.element(document.getElementById("appBody")).scope().$apply(
        function($scope) {
            $scope.onLinkedInJSLoad();
        });
}
$(document).ready(function(){
    setTimeout(function(){
        $('html,body').animate({scrollTop: 0}, 800);
    }, 400);
    
});
// var SHAOPENG_LINKIEDIN_ID = 'qC72fmJGlB';
var appModule = angular.module('tagdemo', ['ngRoute']);

appModule.controller('AppController', ['$scope', '$rootScope', 'TagService', '$location',
    function ($scope, $rootScope, TagService, $location) {
        $scope.$location = $location;
        var linkedInId = getUrlVars()['view'] === 'shaopeng' && 'shaopeng' || 'me';
        var publicProfileUrl = encodeURIComponent('www.linkedin.com/in/shaopengzhang/');

        if(linkedInId === 'me') {
            $scope.staticApp = false;
            //$scope.getLinkedInData() will be called by loadData onAuth linkedIn handler
        }
        else if(linkedInId === 'shaopeng'){
            $scope.staticApp = true;
            getStaticData();
        } 

        //iphone: landspace 568x212, vertical 320x460
        $scope.possiblyOnMobile = window.innerWidth <= 568 || window.innerWidth === 1024;

        $scope.onLinkedInJSLoad = function() {
            $scope.lnkedInJSLoad = true;
        }

        $scope.getLinkedInData = function() {
            IN.API.Profile()
            .ids(linkedInId)
            .fields(['id', 'firstName', 'lastName', 'summary', 'educations', 'pictureUrls::(original)','headline','publicProfileUrl', 'skills', 'positions', 'projects'])
            .result(function(result) {
                console.log(result);
                profile = result.values[0];
                TagService.loadProfile(profile);
            });
        }

        function getStaticData() {
            TagService.loadProfile(null);
        }

        $scope.getPeopleData = function() {
            var rawUrl = '/people/id=' + linkedInId + ':(id,first-name,last-name,headline,picture-urls::(original),summary,educations,skills,positions,public-profile-url)';
            IN.API.Raw()
            .result(function(results) {
                console.log(results);
            });
        }

        $scope.linkedInLoaded = function() {
            return IN;
        }

        $scope.linkedInAuthenticated = function() {
            return IN && IN.ENV && IN.ENV.auth && IN.ENV.auth.oauth_token;
        }

        $scope.signOut = function() {
            IN.User.logout(function(){
                location.reload();
            });
        }


    // Read a page's GET URL variables and return them as an associative array.
    function getUrlVars()
    {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }
}]);

appModule.controller('UIController', ['$scope', '$rootScope', 'TagService', 
    function ($scope, $rootScope, TagService) {
        $scope.SHAOPENG_LINKIEDIN_ID = TagService.SHAOPENG_LINKIEDIN_ID;
        $scope.loadPercentage = {
            linkedIn:   0,
            summary:    0,
            educations: 0,
            skills:     0,
            positions:  0,
        };

        var imgLoadInterval, tagLoadInterval, advLoadInterval;

        $scope.$on('PROFILE', function(event, data) {
                $scope.loadPercentage.linkedIn = 100;
                $scope.completeSection(0);

                $scope.profile = TagService.profile;   
                $scope.summary = TagService.profile.summary || ' ';  
                $scope.educations = TagService.educations || [];   
                $scope.skills = TagService.skills || [];
                $scope.positions = TagService.positions || [];    
    });

        $scope.$on('PROFILE_ALL', function(event, data) {
            $scope.linkedInLoadPercentage = 100;
            $scope.completeSection(0);
            //$scope.$apply();
        });

        $scope.findSchoolLogoUrlFromCompay = function(schoolName) {
            var companyUrlMap = TagService.companyUrlMap;
            for (key in companyUrlMap) {
                var company = companyUrlMap[key];
                console.log('look for: ', companyUrlMap[key]);
                if(company.name && company.logoUrl && company.name === schoolName) {
                    return company.logoUrl;
                }
            }
            return false;
        }

        $scope.displaySectionContent = function(section, contentProperty) {
            $scope.loadPercentage[contentProperty] = 0;
            
            if($scope[contentProperty]) {
                $scope.loadPercentage[contentProperty] = 100;
                $scope.completeSection(section);
                // $scope.$apply();
            }
        }

        $scope.maxValue = function(tags) {
            if(tags.length && tags.length > 0) {
                var max = -999;
                for (var i = 0, len = tags.length; i < len; i++) {
                    if (tags[i].value > max) {
                        max = tags[i].value;
                    }
                }
                return max;
            }
            return 100;
        }
        
        $scope.twinkleStyle = function(value, loadPercentage) {
            var transitionString = 'top 0.4s ease ' +  (value * 3).toFixed(2) + 's' + ',' + 'opacity 0.4s ease ' +  value * 3 + 's' + ';';// + ',' + 'transform 0.4s ease ' + ';';
            var animationDelayString = (10 + value * 6) + 's' + ';'; 
            var styleString = 'font-size: ' + (16 + value * 12) + 'px' + ';' +
            'line-height: ' + '1.5' + ';' +
            /*'top: ' + (loadPercentage === 100) && '0' || '10px' + ';' +*/
            '-webkit-transition: ' + transitionString +
            '-moz-transition: ' + transitionString +
            'transition: ' + transitionString +
            '-webkit-animation-delay: ' + animationDelayString +
            '-moz-animation-delay: ' + animationDelayString +
            'animation-delay: ' + animationDelayString;

            return styleString;

        }

        // $scope.tagBaseHeight = function(value) {
        //     return Math.min(28, 8 + value * 32);
        // }

        $scope.completeSection = function(step) {
            $scope.completedSection = step;
        }


        $scope.scrollToSection = function(step) {
            //$('#step' + step).height(window.innerHeight);
            $('html,body').animate({
                scrollTop: $('#step' + step).offset().top
            }, 400);
        }

        $scope.visible = function(identifier) {
            if (identifier === 'linkedIn') {
                return  $scope.loadPercentage[identifier] > 0;
            }

            else {
                return $scope.loadPercentage[identifier] === 100;
            }
        }


    }]);



appModule.service('TagService', ['$http', '$rootScope', '$q', function ($http, $rootScope, $q) {
    
    var that = this;

    // this.SHAOPENG_LINKIEDIN_ID = 'qC72fmJGlB';

    this.companyUrlMap = {};
    this.companyUrlMap[1043] =  {id: 1043, logoUrl: "https://media.licdn.com/mpr/mpr/p/3/005/07b/00a/05def42.png", name: "Siemens"};
    this.companyUrlMap[507720] = {id: 507720, logoUrl: "https://media.licdn.com/mpr/mpr/p/3/000/032/14c/0fad638.png", name: "Beijing Jiaotong University"} ;
    this.companyUrlMap[3461] = {id: 3461, logoUrl: "https://media.licdn.com/mpr/mpr/p/7/000/2b5/1b3/37aeefe.png", name: "University of Pittsburgh"};
    
    this.getTags = function() {
        var promise = $http.get('api/tags.json').then(function(response) {
            return response.data;
        });
        return promise;
    }

    this.getStaticAdvs = function() {
        var promise = $http.get('api/advs.json').then(function(response) {
            return response.data;
        });
        return promise;
    }

    this.loadProfile = function(INProfile) {
        if(INProfile) {
            that.profile = INProfile;
            that.positions = groupPositionByYear(INProfile.positions);  

            that.skills = flattenSkills(INProfile.skills);
            that.educations = INProfile.educations.values;
            
            console.log(that.profile);
            getCompanyLogos(INProfile.positions).then(function(result){
                console.log(result);
                that.positions = groupPositionByYear(result);
                console.log(that.positions);
                // $rootScope.$broadcast('PROFILE_ALL', null);
            });

            $rootScope.$broadcast('PROFILE', null);
        }
        else if(INProfile === null) {
            $http.get('api/shaopeng_linkedin_profile.json').success(function(data){
                var INProfile = data;
                that.profile = INProfile;
                that.positions = groupPositionByYear(INProfile.positions);  

                that.skills = flattenSkills(INProfile.skills);
                that.educations = INProfile.educations.values;
                
                console.log(that.profile);
                that.positions = getStaticCompanyLogos(INProfile.positions);
                that.positions = groupPositionByYear(that.positions);
                console.log(that.positions);
                $rootScope.$broadcast('PROFILE', null);

                // $rootScope.$broadcast('PROFILE', null);
            });
        }
        
    }

    function flattenSkills(INSkills) {
        var skills = INSkills && (INSkills.values || []) || [];
        var a = [];

        if(angular.isArray(skills)){
            skills.forEach(function(element, index, array) {
                if(element.skill) {
                    a.push({name: element.skill.name, value: Math.random()});
                }
            });
        }

        return a;
    }

    function getStaticCompanyLogos(INPositions) {
        if(INPositions.values && angular.isArray(INPositions.values)) {
            for (var i = 0; i < INPositions.values.length; i++ ) {
                INPositions.values[i].logoUrl = that.companyUrlMap[INPositions.values[i].company.id].logoUrl;
            }
        }
        return INPositions;
    }

    function asyncLogoUrl(id) {
        var deferred = $q.defer();

        if(that.companyUrlMap[id]) {
            var results = that.companyUrlMap[id];
            deferred.resolve(results);
            console.log('Yay! Saved one API call, found company object in cache: ', results);
        }
        else {
            IN.API.Raw('/companies/id=' + id + ':(id,name,logo-url)')
            .result(function(results) {
                if (results.logoUrl) {
                    // position.logoUrl = results.logoUrl;
                    console.log('asyncLogoUrl', results);
                    this.companyUrlMap[id] = results;
                    deferred.resolve(results);
                }
                else {
                    deferred.reject(results);    
                }
                
            })
            .error(function(error){
                //in case of network error, throttle, etc.
                console.error('asyncLogoUrl error: ', angular.toJson(error, true))
                deferred.reject(error);
            });            
        }


        return deferred.promise;
    }

    function getCompanyLogos(INPositions) {
        var deferred = $q.defer();

        var positions = INPositions.values || [];
        var b = [];
        positions.forEach(function(position, index, array) {
            if(position.company && position.company.id) {
                var promise = asyncLogoUrl(position.company.id);
                var newPromise = promise.then(function(success) {
                    position.logoUrl = success.logoUrl;
                    return position;
                });
                b.push(newPromise);
            }
        });

        $q.all(b).then(function(result) {
            // console.log('---all---', result);
            // console.log('---all---', angular.toJson(result, true));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    function groupPositionByYear(positionsArray) {
        var positions = [];

        if(angular.isArray(positionsArray)) {
            positions = positionsArray;
        }
        else if(positionsArray.values && angular.isArray(positionsArray.values)) {
            positions = positionsArray.values;
        }
        
        var a = [];

        if(positions.length === 0 || (positions[0] && !positions[0].startDate)) {
            return [];
        }

        if(angular.isArray(positions)) {

            var even = 0;
            positions.forEach(function(position, index, array) {

                if (a.length === 0) {
                    //push this year first
                    if(!position.startDate || position.startDate.year !== new Date().getFullYear()) {
                        a.push({mark: new Date().getFullYear()});
                        position.startDate = position.startDate || {year: new Date().getFullYear(), month: 0}
                    }
                    //on the first position, push a year mark first

                    a.push({mark: position.startDate.year});
                    position.even = even;
                    a.push(position);
                    even = 1 - even;
                }
                else {
                    //second one and on, compare with the previous one,                 
                    var lastPosition = a[a.length - 1];
                    //if it starts in the new year, then push a year mark first
                    if (lastPosition.startDate.year !== position.startDate.year) {
                        a.push({mark: position.startDate.year});
                    }
                    //if it is in the same year, just push the position
                    position.even = even;
                    a.push(position);
                    
                    even = 1 - even;
                }
            });
}
return a;
}

}]);


appModule.directive('loadProgressIcon', [function () {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            iconclass: '@', 
            progress: '@', 
            reverse: '@'
        },
        template: '<div class="glyph-progress" ng-class="{\'reverse\': reverse}"> \
        <div class=" view-port" ng-class="{\'fg\': reverse, \'bg\': !reverse}"><span class="{{iconclass}}"></span></div>    \
        <div class=" view-port" ng-class="{\'bg\': reverse, \'fg\': !reverse}"><span class="{{iconclass}}"></span></div>   \
        </div>',
        link: function (scope, element, attrs) {
            scope.$watch('progress', function(newValue, oldValue) {
                console.log('loadProgressIcon.progress = ', newValue, oldValue);
                if(parseInt(newValue) === 100) {
                    setTimeout(function(){
                        element.addClass('loaded');
                    },100)
                    
                }
                else if(parseInt(newValue) === 0) {
                    setTimeout(function(){
                        element.removeClass('loaded');
                    }, 100);
                    
                }
            })
        }
    };
}]);

 /*template: '<div class="glyph-progress"> \
        <div class=" view-port" ng-class="{\'fg\': reverse, \'bg\': !reverse}"><span class="{{iconclass}}"></span></div>    \
        <div class=" view-port" ng-class="{\'bg\': reverse, \'fg\': !reverse}" style="height: {{reverse && progress || (100 - progress)}}%"><span class="{{iconclass}}"></span></div>   \
        </div>',*/


appModule.filter('intToMonth', function(){
    return function(input) {
        var map = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        input = parseInt(input);
        if (input > 0 && input < 13) {
            return map[input - 1];
        }
        return '';
    }
});

appModule.filter('forHowLong', function(){
    return function(position) {
        if (position.isCurrent) {
            // return 'till now'
            var now = new Date();

            position.endDate = {
                year: now.getFullYear(),
                month: now.getMonth() + 1
            }
        }
        
        if (position.startDate && position.endDate) {
            var yearLong = position.endDate.year - position.startDate.year,
            monthLong = position.endDate.month - position.startDate.month;
            
            if (monthLong < 0) {
                var totalLongInMonth = yearLong * 12 + monthLong;
                yearLong = Math.floor(totalLongInMonth / 12);
                monthLong = 12 + monthLong;
            }

            var yearUnit = yearLong > 1 ? 'years' : 'year',
            monthUnit = monthLong > 1 ? 'months' : 'month';

            var yearString = yearLong > 0 ? yearLong + ' ' + yearUnit + ' ' : '',
            monthString = monthLong > 0? monthLong + ' ' + monthUnit : '';

            var wholeString = yearString + monthString + (position.isCurrent ? ' till now' : '');

            return wholeString;
        }

        return '';
    }
});

appModule.directive('breakAtN', [function () {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            content: '@'
        },
        link: function (scope, element, attrs) {

            //linkedin API will remove line breaks, here we add them back in before "...(n)" where n > 1
            attrs.$observe('content', function(value){
                // var htmlString = value.replace(/\s+\(\d*\)/g, function(v) {
                //     return ' <br>' + v;
                // });
            var htmlString = value.replace(/\n/g, function(v) {
                return ' <br>';
            });

            element.html(htmlString);
            element.append('<div class="mask"></div>');
        });     

        }
    };
}]);

appModule.directive('clickAddClass', [function () {
    return {
        restrict: 'A',
        scope: {
            toggleclass: '@'
        },
        link: function (scope, element, attrs) {
            element.on('click', function(e){
                element.addClass('expanded');
            })
        }
    };
}]);

appModule.directive('visibleOnMark', [function () {
    return {
        restrict: 'A',
        scope: {
            mark: '@'
        },
        link: function (scope, element, attrs) {
            element.addClass('transparent-first');
            scope.$watch('mark', function(newValue, oldValue) {
                if(newValue === 'true') {
                    setTimeout(function() {
                        element.addClass('visible');
                    }, 100);
                }
                else {
                    setTimeout(function() {
                        element.removeClass('visible');
                    }, 100);
                }
            });
        }
    };
}]);

appModule.directive('visibleOnTime', [function () {
    return {
        restrict: 'A',
        scope: {
            time: '@'
        },
        link: function (scope, element, attrs) {
            element.addClass('transparent-first');
            var time = parseInt(scope.time || 400);
            setTimeout(function(){
                element.addClass('visible');
            }, time);
        }
    };
}])

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpbmtlZGluLmpzIiwiYXBwLmpzIiwic2VydmljZS5qcyIsImhlbHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gbG9hZERhdGEoKSB7XG4gICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXBwQm9keVwiKSkuc2NvcGUoKS4kYXBwbHkoXG4gICAgICAgIGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICAgICAgICAgJHNjb3BlLmdldExpbmtlZEluRGF0YSgpO1xuICAgICAgICB9KTtcbn1cblxuZnVuY3Rpb24gb25MaW5rZWRJbkpTTG9hZCgpIHtcbiAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcHBCb2R5XCIpKS5zY29wZSgpLiRhcHBseShcbiAgICAgICAgZnVuY3Rpb24oJHNjb3BlKSB7XG4gICAgICAgICAgICAkc2NvcGUub25MaW5rZWRJbkpTTG9hZCgpO1xuICAgICAgICB9KTtcbn0iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgJCgnaHRtbCxib2R5JykuYW5pbWF0ZSh7c2Nyb2xsVG9wOiAwfSwgODAwKTtcbiAgICB9LCA0MDApO1xuICAgIFxufSk7XG4vLyB2YXIgU0hBT1BFTkdfTElOS0lFRElOX0lEID0gJ3FDNzJmbUpHbEInO1xudmFyIGFwcE1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCd0YWdkZW1vJywgWyduZ1JvdXRlJ10pO1xuXG5hcHBNb2R1bGUuY29udHJvbGxlcignQXBwQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnVGFnU2VydmljZScsICckbG9jYXRpb24nLFxuICAgIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsIFRhZ1NlcnZpY2UsICRsb2NhdGlvbikge1xuICAgICAgICAkc2NvcGUuJGxvY2F0aW9uID0gJGxvY2F0aW9uO1xuICAgICAgICB2YXIgbGlua2VkSW5JZCA9IGdldFVybFZhcnMoKVsndmlldyddID09PSAnc2hhb3BlbmcnICYmICdzaGFvcGVuZycgfHwgJ21lJztcbiAgICAgICAgdmFyIHB1YmxpY1Byb2ZpbGVVcmwgPSBlbmNvZGVVUklDb21wb25lbnQoJ3d3dy5saW5rZWRpbi5jb20vaW4vc2hhb3Blbmd6aGFuZy8nKTtcblxuICAgICAgICBpZihsaW5rZWRJbklkID09PSAnbWUnKSB7XG4gICAgICAgICAgICAkc2NvcGUuc3RhdGljQXBwID0gZmFsc2U7XG4gICAgICAgICAgICAvLyRzY29wZS5nZXRMaW5rZWRJbkRhdGEoKSB3aWxsIGJlIGNhbGxlZCBieSBsb2FkRGF0YSBvbkF1dGggbGlua2VkSW4gaGFuZGxlclxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYobGlua2VkSW5JZCA9PT0gJ3NoYW9wZW5nJyl7XG4gICAgICAgICAgICAkc2NvcGUuc3RhdGljQXBwID0gdHJ1ZTtcbiAgICAgICAgICAgIGdldFN0YXRpY0RhdGEoKTtcbiAgICAgICAgfSBcblxuICAgICAgICAvL2lwaG9uZTogbGFuZHNwYWNlIDU2OHgyMTIsIHZlcnRpY2FsIDMyMHg0NjBcbiAgICAgICAgJHNjb3BlLnBvc3NpYmx5T25Nb2JpbGUgPSB3aW5kb3cuaW5uZXJXaWR0aCA8PSA1NjggfHwgd2luZG93LmlubmVyV2lkdGggPT09IDEwMjQ7XG5cbiAgICAgICAgJHNjb3BlLm9uTGlua2VkSW5KU0xvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRzY29wZS5sbmtlZEluSlNMb2FkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5nZXRMaW5rZWRJbkRhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIElOLkFQSS5Qcm9maWxlKClcbiAgICAgICAgICAgIC5pZHMobGlua2VkSW5JZClcbiAgICAgICAgICAgIC5maWVsZHMoWydpZCcsICdmaXJzdE5hbWUnLCAnbGFzdE5hbWUnLCAnc3VtbWFyeScsICdlZHVjYXRpb25zJywgJ3BpY3R1cmVVcmxzOjoob3JpZ2luYWwpJywnaGVhZGxpbmUnLCdwdWJsaWNQcm9maWxlVXJsJywgJ3NraWxscycsICdwb3NpdGlvbnMnLCAncHJvamVjdHMnXSlcbiAgICAgICAgICAgIC5yZXN1bHQoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0KTtcbiAgICAgICAgICAgICAgICBwcm9maWxlID0gcmVzdWx0LnZhbHVlc1swXTtcbiAgICAgICAgICAgICAgICBUYWdTZXJ2aWNlLmxvYWRQcm9maWxlKHByb2ZpbGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRTdGF0aWNEYXRhKCkge1xuICAgICAgICAgICAgVGFnU2VydmljZS5sb2FkUHJvZmlsZShudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5nZXRQZW9wbGVEYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgcmF3VXJsID0gJy9wZW9wbGUvaWQ9JyArIGxpbmtlZEluSWQgKyAnOihpZCxmaXJzdC1uYW1lLGxhc3QtbmFtZSxoZWFkbGluZSxwaWN0dXJlLXVybHM6OihvcmlnaW5hbCksc3VtbWFyeSxlZHVjYXRpb25zLHNraWxscyxwb3NpdGlvbnMscHVibGljLXByb2ZpbGUtdXJsKSc7XG4gICAgICAgICAgICBJTi5BUEkuUmF3KClcbiAgICAgICAgICAgIC5yZXN1bHQoZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdHMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUubGlua2VkSW5Mb2FkZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBJTjtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5saW5rZWRJbkF1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBJTiAmJiBJTi5FTlYgJiYgSU4uRU5WLmF1dGggJiYgSU4uRU5WLmF1dGgub2F1dGhfdG9rZW47XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuc2lnbk91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgSU4uVXNlci5sb2dvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cblxuICAgIC8vIFJlYWQgYSBwYWdlJ3MgR0VUIFVSTCB2YXJpYWJsZXMgYW5kIHJldHVybiB0aGVtIGFzIGFuIGFzc29jaWF0aXZlIGFycmF5LlxuICAgIGZ1bmN0aW9uIGdldFVybFZhcnMoKVxuICAgIHtcbiAgICAgICAgdmFyIHZhcnMgPSBbXSwgaGFzaDtcbiAgICAgICAgdmFyIGhhc2hlcyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNsaWNlKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJz8nKSArIDEpLnNwbGl0KCcmJyk7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBoYXNoZXMubGVuZ3RoOyBpKyspXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhhc2ggPSBoYXNoZXNbaV0uc3BsaXQoJz0nKTtcbiAgICAgICAgICAgIHZhcnMucHVzaChoYXNoWzBdKTtcbiAgICAgICAgICAgIHZhcnNbaGFzaFswXV0gPSBoYXNoWzFdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YXJzO1xuICAgIH1cbn1dKTtcblxuYXBwTW9kdWxlLmNvbnRyb2xsZXIoJ1VJQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnVGFnU2VydmljZScsIFxuICAgIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsIFRhZ1NlcnZpY2UpIHtcbiAgICAgICAgJHNjb3BlLlNIQU9QRU5HX0xJTktJRURJTl9JRCA9IFRhZ1NlcnZpY2UuU0hBT1BFTkdfTElOS0lFRElOX0lEO1xuICAgICAgICAkc2NvcGUubG9hZFBlcmNlbnRhZ2UgPSB7XG4gICAgICAgICAgICBsaW5rZWRJbjogICAwLFxuICAgICAgICAgICAgc3VtbWFyeTogICAgMCxcbiAgICAgICAgICAgIGVkdWNhdGlvbnM6IDAsXG4gICAgICAgICAgICBza2lsbHM6ICAgICAwLFxuICAgICAgICAgICAgcG9zaXRpb25zOiAgMCxcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgaW1nTG9hZEludGVydmFsLCB0YWdMb2FkSW50ZXJ2YWwsIGFkdkxvYWRJbnRlcnZhbDtcblxuICAgICAgICAkc2NvcGUuJG9uKCdQUk9GSUxFJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUubG9hZFBlcmNlbnRhZ2UubGlua2VkSW4gPSAxMDA7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbXBsZXRlU2VjdGlvbigwKTtcblxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9maWxlID0gVGFnU2VydmljZS5wcm9maWxlOyAgIFxuICAgICAgICAgICAgICAgICRzY29wZS5zdW1tYXJ5ID0gVGFnU2VydmljZS5wcm9maWxlLnN1bW1hcnkgfHwgJyAnOyAgXG4gICAgICAgICAgICAgICAgJHNjb3BlLmVkdWNhdGlvbnMgPSBUYWdTZXJ2aWNlLmVkdWNhdGlvbnMgfHwgW107ICAgXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNraWxscyA9IFRhZ1NlcnZpY2Uuc2tpbGxzIHx8IFtdO1xuICAgICAgICAgICAgICAgICRzY29wZS5wb3NpdGlvbnMgPSBUYWdTZXJ2aWNlLnBvc2l0aW9ucyB8fCBbXTsgICAgXG4gICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLiRvbignUFJPRklMRV9BTEwnLCBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgJHNjb3BlLmxpbmtlZEluTG9hZFBlcmNlbnRhZ2UgPSAxMDA7XG4gICAgICAgICAgICAkc2NvcGUuY29tcGxldGVTZWN0aW9uKDApO1xuICAgICAgICAgICAgLy8kc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS5maW5kU2Nob29sTG9nb1VybEZyb21Db21wYXkgPSBmdW5jdGlvbihzY2hvb2xOYW1lKSB7XG4gICAgICAgICAgICB2YXIgY29tcGFueVVybE1hcCA9IFRhZ1NlcnZpY2UuY29tcGFueVVybE1hcDtcbiAgICAgICAgICAgIGZvciAoa2V5IGluIGNvbXBhbnlVcmxNYXApIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tcGFueSA9IGNvbXBhbnlVcmxNYXBba2V5XTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbG9vayBmb3I6ICcsIGNvbXBhbnlVcmxNYXBba2V5XSk7XG4gICAgICAgICAgICAgICAgaWYoY29tcGFueS5uYW1lICYmIGNvbXBhbnkubG9nb1VybCAmJiBjb21wYW55Lm5hbWUgPT09IHNjaG9vbE5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBhbnkubG9nb1VybDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuZGlzcGxheVNlY3Rpb25Db250ZW50ID0gZnVuY3Rpb24oc2VjdGlvbiwgY29udGVudFByb3BlcnR5KSB7XG4gICAgICAgICAgICAkc2NvcGUubG9hZFBlcmNlbnRhZ2VbY29udGVudFByb3BlcnR5XSA9IDA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCRzY29wZVtjb250ZW50UHJvcGVydHldKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmxvYWRQZXJjZW50YWdlW2NvbnRlbnRQcm9wZXJ0eV0gPSAxMDA7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbXBsZXRlU2VjdGlvbihzZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAvLyAkc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUubWF4VmFsdWUgPSBmdW5jdGlvbih0YWdzKSB7XG4gICAgICAgICAgICBpZih0YWdzLmxlbmd0aCAmJiB0YWdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgbWF4ID0gLTk5OTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGFncy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFnc1tpXS52YWx1ZSA+IG1heCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF4ID0gdGFnc1tpXS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbWF4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDEwMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnR3aW5rbGVTdHlsZSA9IGZ1bmN0aW9uKHZhbHVlLCBsb2FkUGVyY2VudGFnZSkge1xuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb25TdHJpbmcgPSAndG9wIDAuNHMgZWFzZSAnICsgICh2YWx1ZSAqIDMpLnRvRml4ZWQoMikgKyAncycgKyAnLCcgKyAnb3BhY2l0eSAwLjRzIGVhc2UgJyArICB2YWx1ZSAqIDMgKyAncycgKyAnOyc7Ly8gKyAnLCcgKyAndHJhbnNmb3JtIDAuNHMgZWFzZSAnICsgJzsnO1xuICAgICAgICAgICAgdmFyIGFuaW1hdGlvbkRlbGF5U3RyaW5nID0gKDEwICsgdmFsdWUgKiA2KSArICdzJyArICc7JzsgXG4gICAgICAgICAgICB2YXIgc3R5bGVTdHJpbmcgPSAnZm9udC1zaXplOiAnICsgKDE2ICsgdmFsdWUgKiAxMikgKyAncHgnICsgJzsnICtcbiAgICAgICAgICAgICdsaW5lLWhlaWdodDogJyArICcxLjUnICsgJzsnICtcbiAgICAgICAgICAgIC8qJ3RvcDogJyArIChsb2FkUGVyY2VudGFnZSA9PT0gMTAwKSAmJiAnMCcgfHwgJzEwcHgnICsgJzsnICsqL1xuICAgICAgICAgICAgJy13ZWJraXQtdHJhbnNpdGlvbjogJyArIHRyYW5zaXRpb25TdHJpbmcgK1xuICAgICAgICAgICAgJy1tb3otdHJhbnNpdGlvbjogJyArIHRyYW5zaXRpb25TdHJpbmcgK1xuICAgICAgICAgICAgJ3RyYW5zaXRpb246ICcgKyB0cmFuc2l0aW9uU3RyaW5nICtcbiAgICAgICAgICAgICctd2Via2l0LWFuaW1hdGlvbi1kZWxheTogJyArIGFuaW1hdGlvbkRlbGF5U3RyaW5nICtcbiAgICAgICAgICAgICctbW96LWFuaW1hdGlvbi1kZWxheTogJyArIGFuaW1hdGlvbkRlbGF5U3RyaW5nICtcbiAgICAgICAgICAgICdhbmltYXRpb24tZGVsYXk6ICcgKyBhbmltYXRpb25EZWxheVN0cmluZztcblxuICAgICAgICAgICAgcmV0dXJuIHN0eWxlU3RyaW5nO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvLyAkc2NvcGUudGFnQmFzZUhlaWdodCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIC8vICAgICByZXR1cm4gTWF0aC5taW4oMjgsIDggKyB2YWx1ZSAqIDMyKTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgICRzY29wZS5jb21wbGV0ZVNlY3Rpb24gPSBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICAkc2NvcGUuY29tcGxldGVkU2VjdGlvbiA9IHN0ZXA7XG4gICAgICAgIH1cblxuXG4gICAgICAgICRzY29wZS5zY3JvbGxUb1NlY3Rpb24gPSBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICAvLyQoJyNzdGVwJyArIHN0ZXApLmhlaWdodCh3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgICAgICAgICAgJCgnaHRtbCxib2R5JykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgc2Nyb2xsVG9wOiAkKCcjc3RlcCcgKyBzdGVwKS5vZmZzZXQoKS50b3BcbiAgICAgICAgICAgIH0sIDQwMCk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUudmlzaWJsZSA9IGZ1bmN0aW9uKGlkZW50aWZpZXIpIHtcbiAgICAgICAgICAgIGlmIChpZGVudGlmaWVyID09PSAnbGlua2VkSW4nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICAkc2NvcGUubG9hZFBlcmNlbnRhZ2VbaWRlbnRpZmllcl0gPiAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmxvYWRQZXJjZW50YWdlW2lkZW50aWZpZXJdID09PSAxMDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgfV0pO1xuXG5cbiIsImFwcE1vZHVsZS5zZXJ2aWNlKCdUYWdTZXJ2aWNlJywgWyckaHR0cCcsICckcm9vdFNjb3BlJywgJyRxJywgZnVuY3Rpb24gKCRodHRwLCAkcm9vdFNjb3BlLCAkcSkge1xuICAgIFxuICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgIC8vIHRoaXMuU0hBT1BFTkdfTElOS0lFRElOX0lEID0gJ3FDNzJmbUpHbEInO1xuXG4gICAgdGhpcy5jb21wYW55VXJsTWFwID0ge307XG4gICAgdGhpcy5jb21wYW55VXJsTWFwWzEwNDNdID0gIHtpZDogMTA0MywgbG9nb1VybDogXCJodHRwczovL21lZGlhLmxpY2RuLmNvbS9tcHIvbXByL3AvMy8wMDUvMDdiLzAwYS8wNWRlZjQyLnBuZ1wiLCBuYW1lOiBcIlNpZW1lbnNcIn07XG4gICAgdGhpcy5jb21wYW55VXJsTWFwWzUwNzcyMF0gPSB7aWQ6IDUwNzcyMCwgbG9nb1VybDogXCJodHRwczovL21lZGlhLmxpY2RuLmNvbS9tcHIvbXByL3AvMy8wMDAvMDMyLzE0Yy8wZmFkNjM4LnBuZ1wiLCBuYW1lOiBcIkJlaWppbmcgSmlhb3RvbmcgVW5pdmVyc2l0eVwifSA7XG4gICAgdGhpcy5jb21wYW55VXJsTWFwWzM0NjFdID0ge2lkOiAzNDYxLCBsb2dvVXJsOiBcImh0dHBzOi8vbWVkaWEubGljZG4uY29tL21wci9tcHIvcC83LzAwMC8yYjUvMWIzLzM3YWVlZmUucG5nXCIsIG5hbWU6IFwiVW5pdmVyc2l0eSBvZiBQaXR0c2J1cmdoXCJ9O1xuICAgIFxuICAgIHRoaXMuZ2V0VGFncyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJvbWlzZSA9ICRodHRwLmdldCgnYXBpL3RhZ3MuanNvbicpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgdGhpcy5nZXRTdGF0aWNBZHZzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwcm9taXNlID0gJGh0dHAuZ2V0KCdhcGkvYWR2cy5qc29uJykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICB0aGlzLmxvYWRQcm9maWxlID0gZnVuY3Rpb24oSU5Qcm9maWxlKSB7XG4gICAgICAgIGlmKElOUHJvZmlsZSkge1xuICAgICAgICAgICAgdGhhdC5wcm9maWxlID0gSU5Qcm9maWxlO1xuICAgICAgICAgICAgdGhhdC5wb3NpdGlvbnMgPSBncm91cFBvc2l0aW9uQnlZZWFyKElOUHJvZmlsZS5wb3NpdGlvbnMpOyAgXG5cbiAgICAgICAgICAgIHRoYXQuc2tpbGxzID0gZmxhdHRlblNraWxscyhJTlByb2ZpbGUuc2tpbGxzKTtcbiAgICAgICAgICAgIHRoYXQuZWR1Y2F0aW9ucyA9IElOUHJvZmlsZS5lZHVjYXRpb25zLnZhbHVlcztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2codGhhdC5wcm9maWxlKTtcbiAgICAgICAgICAgIGdldENvbXBhbnlMb2dvcyhJTlByb2ZpbGUucG9zaXRpb25zKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB0aGF0LnBvc2l0aW9ucyA9IGdyb3VwUG9zaXRpb25CeVllYXIocmVzdWx0KTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGF0LnBvc2l0aW9ucyk7XG4gICAgICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdQUk9GSUxFX0FMTCcsIG51bGwpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnUFJPRklMRScsIG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoSU5Qcm9maWxlID09PSBudWxsKSB7XG4gICAgICAgICAgICAkaHR0cC5nZXQoJ2FwaS9zaGFvcGVuZ19saW5rZWRpbl9wcm9maWxlLmpzb24nKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICAgIHZhciBJTlByb2ZpbGUgPSBkYXRhO1xuICAgICAgICAgICAgICAgIHRoYXQucHJvZmlsZSA9IElOUHJvZmlsZTtcbiAgICAgICAgICAgICAgICB0aGF0LnBvc2l0aW9ucyA9IGdyb3VwUG9zaXRpb25CeVllYXIoSU5Qcm9maWxlLnBvc2l0aW9ucyk7ICBcblxuICAgICAgICAgICAgICAgIHRoYXQuc2tpbGxzID0gZmxhdHRlblNraWxscyhJTlByb2ZpbGUuc2tpbGxzKTtcbiAgICAgICAgICAgICAgICB0aGF0LmVkdWNhdGlvbnMgPSBJTlByb2ZpbGUuZWR1Y2F0aW9ucy52YWx1ZXM7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhhdC5wcm9maWxlKTtcbiAgICAgICAgICAgICAgICB0aGF0LnBvc2l0aW9ucyA9IGdldFN0YXRpY0NvbXBhbnlMb2dvcyhJTlByb2ZpbGUucG9zaXRpb25zKTtcbiAgICAgICAgICAgICAgICB0aGF0LnBvc2l0aW9ucyA9IGdyb3VwUG9zaXRpb25CeVllYXIodGhhdC5wb3NpdGlvbnMpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoYXQucG9zaXRpb25zKTtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ1BST0ZJTEUnLCBudWxsKTtcblxuICAgICAgICAgICAgICAgIC8vICRyb290U2NvcGUuJGJyb2FkY2FzdCgnUFJPRklMRScsIG51bGwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmxhdHRlblNraWxscyhJTlNraWxscykge1xuICAgICAgICB2YXIgc2tpbGxzID0gSU5Ta2lsbHMgJiYgKElOU2tpbGxzLnZhbHVlcyB8fCBbXSkgfHwgW107XG4gICAgICAgIHZhciBhID0gW107XG5cbiAgICAgICAgaWYoYW5ndWxhci5pc0FycmF5KHNraWxscykpe1xuICAgICAgICAgICAgc2tpbGxzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaW5kZXgsIGFycmF5KSB7XG4gICAgICAgICAgICAgICAgaWYoZWxlbWVudC5za2lsbCkge1xuICAgICAgICAgICAgICAgICAgICBhLnB1c2goe25hbWU6IGVsZW1lbnQuc2tpbGwubmFtZSwgdmFsdWU6IE1hdGgucmFuZG9tKCl9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFN0YXRpY0NvbXBhbnlMb2dvcyhJTlBvc2l0aW9ucykge1xuICAgICAgICBpZihJTlBvc2l0aW9ucy52YWx1ZXMgJiYgYW5ndWxhci5pc0FycmF5KElOUG9zaXRpb25zLnZhbHVlcykpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgSU5Qb3NpdGlvbnMudmFsdWVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgIElOUG9zaXRpb25zLnZhbHVlc1tpXS5sb2dvVXJsID0gdGhhdC5jb21wYW55VXJsTWFwW0lOUG9zaXRpb25zLnZhbHVlc1tpXS5jb21wYW55LmlkXS5sb2dvVXJsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBJTlBvc2l0aW9ucztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhc3luY0xvZ29VcmwoaWQpIHtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICBpZih0aGF0LmNvbXBhbnlVcmxNYXBbaWRdKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0cyA9IHRoYXQuY29tcGFueVVybE1hcFtpZF07XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdHMpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1lheSEgU2F2ZWQgb25lIEFQSSBjYWxsLCBmb3VuZCBjb21wYW55IG9iamVjdCBpbiBjYWNoZTogJywgcmVzdWx0cyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBJTi5BUEkuUmF3KCcvY29tcGFuaWVzL2lkPScgKyBpZCArICc6KGlkLG5hbWUsbG9nby11cmwpJylcbiAgICAgICAgICAgIC5yZXN1bHQoZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHRzLmxvZ29VcmwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcG9zaXRpb24ubG9nb1VybCA9IHJlc3VsdHMubG9nb1VybDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FzeW5jTG9nb1VybCcsIHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXBhbnlVcmxNYXBbaWRdID0gcmVzdWx0cztcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChyZXN1bHRzKTsgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5lcnJvcihmdW5jdGlvbihlcnJvcil7XG4gICAgICAgICAgICAgICAgLy9pbiBjYXNlIG9mIG5ldHdvcmsgZXJyb3IsIHRocm90dGxlLCBldGMuXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignYXN5bmNMb2dvVXJsIGVycm9yOiAnLCBhbmd1bGFyLnRvSnNvbihlcnJvciwgdHJ1ZSkpXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgIH0pOyAgICAgICAgICAgIFxuICAgICAgICB9XG5cblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDb21wYW55TG9nb3MoSU5Qb3NpdGlvbnMpIHtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICB2YXIgcG9zaXRpb25zID0gSU5Qb3NpdGlvbnMudmFsdWVzIHx8IFtdO1xuICAgICAgICB2YXIgYiA9IFtdO1xuICAgICAgICBwb3NpdGlvbnMuZm9yRWFjaChmdW5jdGlvbihwb3NpdGlvbiwgaW5kZXgsIGFycmF5KSB7XG4gICAgICAgICAgICBpZihwb3NpdGlvbi5jb21wYW55ICYmIHBvc2l0aW9uLmNvbXBhbnkuaWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvbWlzZSA9IGFzeW5jTG9nb1VybChwb3NpdGlvbi5jb21wYW55LmlkKTtcbiAgICAgICAgICAgICAgICB2YXIgbmV3UHJvbWlzZSA9IHByb21pc2UudGhlbihmdW5jdGlvbihzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLmxvZ29VcmwgPSBzdWNjZXNzLmxvZ29Vcmw7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBiLnB1c2gobmV3UHJvbWlzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRxLmFsbChiKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJy0tLWFsbC0tLScsIHJlc3VsdCk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnLS0tYWxsLS0tJywgYW5ndWxhci50b0pzb24ocmVzdWx0LCB0cnVlKSk7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdyb3VwUG9zaXRpb25CeVllYXIocG9zaXRpb25zQXJyYXkpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IFtdO1xuXG4gICAgICAgIGlmKGFuZ3VsYXIuaXNBcnJheShwb3NpdGlvbnNBcnJheSkpIHtcbiAgICAgICAgICAgIHBvc2l0aW9ucyA9IHBvc2l0aW9uc0FycmF5O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYocG9zaXRpb25zQXJyYXkudmFsdWVzICYmIGFuZ3VsYXIuaXNBcnJheShwb3NpdGlvbnNBcnJheS52YWx1ZXMpKSB7XG4gICAgICAgICAgICBwb3NpdGlvbnMgPSBwb3NpdGlvbnNBcnJheS52YWx1ZXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBhID0gW107XG5cbiAgICAgICAgaWYocG9zaXRpb25zLmxlbmd0aCA9PT0gMCB8fCAocG9zaXRpb25zWzBdICYmICFwb3NpdGlvbnNbMF0uc3RhcnREYXRlKSkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoYW5ndWxhci5pc0FycmF5KHBvc2l0aW9ucykpIHtcblxuICAgICAgICAgICAgdmFyIGV2ZW4gPSAwO1xuICAgICAgICAgICAgcG9zaXRpb25zLmZvckVhY2goZnVuY3Rpb24ocG9zaXRpb24sIGluZGV4LCBhcnJheSkge1xuXG4gICAgICAgICAgICAgICAgaWYgKGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vcHVzaCB0aGlzIHllYXIgZmlyc3RcbiAgICAgICAgICAgICAgICAgICAgaWYoIXBvc2l0aW9uLnN0YXJ0RGF0ZSB8fCBwb3NpdGlvbi5zdGFydERhdGUueWVhciAhPT0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhLnB1c2goe21hcms6IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24uc3RhcnREYXRlID0gcG9zaXRpb24uc3RhcnREYXRlIHx8IHt5ZWFyOiBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCksIG1vbnRoOiAwfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vb24gdGhlIGZpcnN0IHBvc2l0aW9uLCBwdXNoIGEgeWVhciBtYXJrIGZpcnN0XG5cbiAgICAgICAgICAgICAgICAgICAgYS5wdXNoKHttYXJrOiBwb3NpdGlvbi5zdGFydERhdGUueWVhcn0pO1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbi5ldmVuID0gZXZlbjtcbiAgICAgICAgICAgICAgICAgICAgYS5wdXNoKHBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbiA9IDEgLSBldmVuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy9zZWNvbmQgb25lIGFuZCBvbiwgY29tcGFyZSB3aXRoIHRoZSBwcmV2aW91cyBvbmUsICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3RQb3NpdGlvbiA9IGFbYS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgLy9pZiBpdCBzdGFydHMgaW4gdGhlIG5ldyB5ZWFyLCB0aGVuIHB1c2ggYSB5ZWFyIG1hcmsgZmlyc3RcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RQb3NpdGlvbi5zdGFydERhdGUueWVhciAhPT0gcG9zaXRpb24uc3RhcnREYXRlLnllYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGEucHVzaCh7bWFyazogcG9zaXRpb24uc3RhcnREYXRlLnllYXJ9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvL2lmIGl0IGlzIGluIHRoZSBzYW1lIHllYXIsIGp1c3QgcHVzaCB0aGUgcG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24uZXZlbiA9IGV2ZW47XG4gICAgICAgICAgICAgICAgICAgIGEucHVzaChwb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBldmVuID0gMSAtIGV2ZW47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG59XG5yZXR1cm4gYTtcbn1cblxufV0pOyIsIlxuXG5hcHBNb2R1bGUuZGlyZWN0aXZlKCdsb2FkUHJvZ3Jlc3NJY29uJywgW2Z1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgaWNvbmNsYXNzOiAnQCcsIFxuICAgICAgICAgICAgcHJvZ3Jlc3M6ICdAJywgXG4gICAgICAgICAgICByZXZlcnNlOiAnQCdcbiAgICAgICAgfSxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiZ2x5cGgtcHJvZ3Jlc3NcIiBuZy1jbGFzcz1cIntcXCdyZXZlcnNlXFwnOiByZXZlcnNlfVwiPiBcXFxuICAgICAgICA8ZGl2IGNsYXNzPVwiIHZpZXctcG9ydFwiIG5nLWNsYXNzPVwie1xcJ2ZnXFwnOiByZXZlcnNlLCBcXCdiZ1xcJzogIXJldmVyc2V9XCI+PHNwYW4gY2xhc3M9XCJ7e2ljb25jbGFzc319XCI+PC9zcGFuPjwvZGl2PiAgICBcXFxuICAgICAgICA8ZGl2IGNsYXNzPVwiIHZpZXctcG9ydFwiIG5nLWNsYXNzPVwie1xcJ2JnXFwnOiByZXZlcnNlLCBcXCdmZ1xcJzogIXJldmVyc2V9XCI+PHNwYW4gY2xhc3M9XCJ7e2ljb25jbGFzc319XCI+PC9zcGFuPjwvZGl2PiAgIFxcXG4gICAgICAgIDwvZGl2PicsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIHNjb3BlLiR3YXRjaCgncHJvZ3Jlc3MnLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbG9hZFByb2dyZXNzSWNvbi5wcm9ncmVzcyA9ICcsIG5ld1ZhbHVlLCBvbGRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYocGFyc2VJbnQobmV3VmFsdWUpID09PSAxMDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnbG9hZGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIH0sMTAwKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZihwYXJzZUludChuZXdWYWx1ZSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnbG9hZGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9O1xufV0pO1xuXG4gLyp0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJnbHlwaC1wcm9ncmVzc1wiPiBcXFxuICAgICAgICA8ZGl2IGNsYXNzPVwiIHZpZXctcG9ydFwiIG5nLWNsYXNzPVwie1xcJ2ZnXFwnOiByZXZlcnNlLCBcXCdiZ1xcJzogIXJldmVyc2V9XCI+PHNwYW4gY2xhc3M9XCJ7e2ljb25jbGFzc319XCI+PC9zcGFuPjwvZGl2PiAgICBcXFxuICAgICAgICA8ZGl2IGNsYXNzPVwiIHZpZXctcG9ydFwiIG5nLWNsYXNzPVwie1xcJ2JnXFwnOiByZXZlcnNlLCBcXCdmZ1xcJzogIXJldmVyc2V9XCIgc3R5bGU9XCJoZWlnaHQ6IHt7cmV2ZXJzZSAmJiBwcm9ncmVzcyB8fCAoMTAwIC0gcHJvZ3Jlc3MpfX0lXCI+PHNwYW4gY2xhc3M9XCJ7e2ljb25jbGFzc319XCI+PC9zcGFuPjwvZGl2PiAgIFxcXG4gICAgICAgIDwvZGl2PicsKi9cblxuXG5hcHBNb2R1bGUuZmlsdGVyKCdpbnRUb01vbnRoJywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgdmFyIG1hcCA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnXTtcbiAgICAgICAgaW5wdXQgPSBwYXJzZUludChpbnB1dCk7XG4gICAgICAgIGlmIChpbnB1dCA+IDAgJiYgaW5wdXQgPCAxMykge1xuICAgICAgICAgICAgcmV0dXJuIG1hcFtpbnB1dCAtIDFdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG59KTtcblxuYXBwTW9kdWxlLmZpbHRlcignZm9ySG93TG9uZycsIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgIGlmIChwb3NpdGlvbi5pc0N1cnJlbnQpIHtcbiAgICAgICAgICAgIC8vIHJldHVybiAndGlsbCBub3cnXG4gICAgICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcblxuICAgICAgICAgICAgcG9zaXRpb24uZW5kRGF0ZSA9IHtcbiAgICAgICAgICAgICAgICB5ZWFyOiBub3cuZ2V0RnVsbFllYXIoKSxcbiAgICAgICAgICAgICAgICBtb250aDogbm93LmdldE1vbnRoKCkgKyAxXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChwb3NpdGlvbi5zdGFydERhdGUgJiYgcG9zaXRpb24uZW5kRGF0ZSkge1xuICAgICAgICAgICAgdmFyIHllYXJMb25nID0gcG9zaXRpb24uZW5kRGF0ZS55ZWFyIC0gcG9zaXRpb24uc3RhcnREYXRlLnllYXIsXG4gICAgICAgICAgICBtb250aExvbmcgPSBwb3NpdGlvbi5lbmREYXRlLm1vbnRoIC0gcG9zaXRpb24uc3RhcnREYXRlLm1vbnRoO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAobW9udGhMb25nIDwgMCkge1xuICAgICAgICAgICAgICAgIHZhciB0b3RhbExvbmdJbk1vbnRoID0geWVhckxvbmcgKiAxMiArIG1vbnRoTG9uZztcbiAgICAgICAgICAgICAgICB5ZWFyTG9uZyA9IE1hdGguZmxvb3IodG90YWxMb25nSW5Nb250aCAvIDEyKTtcbiAgICAgICAgICAgICAgICBtb250aExvbmcgPSAxMiArIG1vbnRoTG9uZztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHllYXJVbml0ID0geWVhckxvbmcgPiAxID8gJ3llYXJzJyA6ICd5ZWFyJyxcbiAgICAgICAgICAgIG1vbnRoVW5pdCA9IG1vbnRoTG9uZyA+IDEgPyAnbW9udGhzJyA6ICdtb250aCc7XG5cbiAgICAgICAgICAgIHZhciB5ZWFyU3RyaW5nID0geWVhckxvbmcgPiAwID8geWVhckxvbmcgKyAnICcgKyB5ZWFyVW5pdCArICcgJyA6ICcnLFxuICAgICAgICAgICAgbW9udGhTdHJpbmcgPSBtb250aExvbmcgPiAwPyBtb250aExvbmcgKyAnICcgKyBtb250aFVuaXQgOiAnJztcblxuICAgICAgICAgICAgdmFyIHdob2xlU3RyaW5nID0geWVhclN0cmluZyArIG1vbnRoU3RyaW5nICsgKHBvc2l0aW9uLmlzQ3VycmVudCA/ICcgdGlsbCBub3cnIDogJycpO1xuXG4gICAgICAgICAgICByZXR1cm4gd2hvbGVTdHJpbmc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxufSk7XG5cbmFwcE1vZHVsZS5kaXJlY3RpdmUoJ2JyZWFrQXROJywgW2Z1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgY29udGVudDogJ0AnXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcblxuICAgICAgICAgICAgLy9saW5rZWRpbiBBUEkgd2lsbCByZW1vdmUgbGluZSBicmVha3MsIGhlcmUgd2UgYWRkIHRoZW0gYmFjayBpbiBiZWZvcmUgXCIuLi4obilcIiB3aGVyZSBuID4gMVxuICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUoJ2NvbnRlbnQnLCBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgICAgICAgICAgLy8gdmFyIGh0bWxTdHJpbmcgPSB2YWx1ZS5yZXBsYWNlKC9cXHMrXFwoXFxkKlxcKS9nLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHJldHVybiAnIDxicj4nICsgdjtcbiAgICAgICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgIHZhciBodG1sU3RyaW5nID0gdmFsdWUucmVwbGFjZSgvXFxuL2csIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyA8YnI+JztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBlbGVtZW50Lmh0bWwoaHRtbFN0cmluZyk7XG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZCgnPGRpdiBjbGFzcz1cIm1hc2tcIj48L2Rpdj4nKTtcbiAgICAgICAgfSk7ICAgICBcblxuICAgICAgICB9XG4gICAgfTtcbn1dKTtcblxuYXBwTW9kdWxlLmRpcmVjdGl2ZSgnY2xpY2tBZGRDbGFzcycsIFtmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHRvZ2dsZWNsYXNzOiAnQCdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgZWxlbWVudC5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdleHBhbmRlZCcpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH07XG59XSk7XG5cbmFwcE1vZHVsZS5kaXJlY3RpdmUoJ3Zpc2libGVPbk1hcmsnLCBbZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBtYXJrOiAnQCdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygndHJhbnNwYXJlbnQtZmlyc3QnKTtcbiAgICAgICAgICAgIHNjb3BlLiR3YXRjaCgnbWFyaycsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmKG5ld1ZhbHVlID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3Zpc2libGUnKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCd2aXNpYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufV0pO1xuXG5hcHBNb2R1bGUuZGlyZWN0aXZlKCd2aXNpYmxlT25UaW1lJywgW2Z1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgdGltZTogJ0AnXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3RyYW5zcGFyZW50LWZpcnN0Jyk7XG4gICAgICAgICAgICB2YXIgdGltZSA9IHBhcnNlSW50KHNjb3BlLnRpbWUgfHwgNDAwKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCd2aXNpYmxlJyk7XG4gICAgICAgICAgICB9LCB0aW1lKTtcbiAgICAgICAgfVxuICAgIH07XG59XSlcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==