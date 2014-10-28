function loadData() {
    angular.element(document.getElementById("appBody")).scope().$apply(
        function($scope) {
            $scope.getLinkedInData();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpbmtlZGluLmpzIiwiYXBwLmpzIiwic2VydmljZS5qcyIsImhlbHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhbGwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBsb2FkRGF0YSgpIHtcbiAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcHBCb2R5XCIpKS5zY29wZSgpLiRhcHBseShcbiAgICAgICAgZnVuY3Rpb24oJHNjb3BlKSB7XG4gICAgICAgICAgICAkc2NvcGUuZ2V0TGlua2VkSW5EYXRhKCk7XG4gICAgICAgIH0pO1xufSIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAkKCdodG1sLGJvZHknKS5hbmltYXRlKHtzY3JvbGxUb3A6IDB9LCA4MDApO1xuICAgIH0sIDQwMCk7XG4gICAgXG59KTtcbi8vIHZhciBTSEFPUEVOR19MSU5LSUVESU5fSUQgPSAncUM3MmZtSkdsQic7XG52YXIgYXBwTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3RhZ2RlbW8nLCBbJ25nUm91dGUnXSk7XG5cbmFwcE1vZHVsZS5jb250cm9sbGVyKCdBcHBDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICdUYWdTZXJ2aWNlJywgJyRsb2NhdGlvbicsXG4gICAgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgVGFnU2VydmljZSwgJGxvY2F0aW9uKSB7XG4gICAgICAgICRzY29wZS4kbG9jYXRpb24gPSAkbG9jYXRpb247XG4gICAgICAgIHZhciBsaW5rZWRJbklkID0gZ2V0VXJsVmFycygpWyd2aWV3J10gPT09ICdzaGFvcGVuZycgJiYgJ3NoYW9wZW5nJyB8fCAnbWUnO1xuICAgICAgICB2YXIgcHVibGljUHJvZmlsZVVybCA9IGVuY29kZVVSSUNvbXBvbmVudCgnd3d3LmxpbmtlZGluLmNvbS9pbi9zaGFvcGVuZ3poYW5nLycpO1xuXG4gICAgICAgIGlmKGxpbmtlZEluSWQgPT09ICdtZScpIHtcbiAgICAgICAgICAgICRzY29wZS5zdGF0aWNBcHAgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vJHNjb3BlLmdldExpbmtlZEluRGF0YSgpIHdpbGwgYmUgY2FsbGVkIGJ5IGxvYWREYXRhIG9uQXV0aCBsaW5rZWRJbiBoYW5kbGVyXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihsaW5rZWRJbklkID09PSAnc2hhb3BlbmcnKXtcbiAgICAgICAgICAgICRzY29wZS5zdGF0aWNBcHAgPSB0cnVlO1xuICAgICAgICAgICAgZ2V0U3RhdGljRGF0YSgpO1xuICAgICAgICB9IFxuXG4gICAgICAgIC8vaXBob25lOiBsYW5kc3BhY2UgNTY4eDIxMiwgdmVydGljYWwgMzIweDQ2MFxuICAgICAgICAkc2NvcGUucG9zc2libHlPbk1vYmlsZSA9IHdpbmRvdy5pbm5lcldpZHRoIDw9IDU2OCB8fCB3aW5kb3cuaW5uZXJXaWR0aCA9PT0gMTAyNDtcblxuICAgICAgICAkc2NvcGUuZ2V0TGlua2VkSW5EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBJTi5BUEkuUHJvZmlsZSgpXG4gICAgICAgICAgICAuaWRzKGxpbmtlZEluSWQpXG4gICAgICAgICAgICAuZmllbGRzKFsnaWQnLCAnZmlyc3ROYW1lJywgJ2xhc3ROYW1lJywgJ3N1bW1hcnknLCAnZWR1Y2F0aW9ucycsICdwaWN0dXJlVXJsczo6KG9yaWdpbmFsKScsJ2hlYWRsaW5lJywncHVibGljUHJvZmlsZVVybCcsICdza2lsbHMnLCAncG9zaXRpb25zJywgJ3Byb2plY3RzJ10pXG4gICAgICAgICAgICAucmVzdWx0KGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgcHJvZmlsZSA9IHJlc3VsdC52YWx1ZXNbMF07XG4gICAgICAgICAgICAgICAgVGFnU2VydmljZS5sb2FkUHJvZmlsZShwcm9maWxlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0U3RhdGljRGF0YSgpIHtcbiAgICAgICAgICAgIFRhZ1NlcnZpY2UubG9hZFByb2ZpbGUobnVsbCk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuZ2V0UGVvcGxlRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHJhd1VybCA9ICcvcGVvcGxlL2lkPScgKyBsaW5rZWRJbklkICsgJzooaWQsZmlyc3QtbmFtZSxsYXN0LW5hbWUsaGVhZGxpbmUscGljdHVyZS11cmxzOjoob3JpZ2luYWwpLHN1bW1hcnksZWR1Y2F0aW9ucyxza2lsbHMscG9zaXRpb25zLHB1YmxpYy1wcm9maWxlLXVybCknO1xuICAgICAgICAgICAgSU4uQVBJLlJhdygpXG4gICAgICAgICAgICAucmVzdWx0KGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHRzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLmxpbmtlZEluTG9hZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gSU47XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUubGlua2VkSW5BdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gSU4gJiYgSU4uRU5WICYmIElOLkVOVi5hdXRoICYmIElOLkVOVi5hdXRoLm9hdXRoX3Rva2VuO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLnNpZ25PdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIElOLlVzZXIubG9nb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG5cbiAgICAvLyBSZWFkIGEgcGFnZSdzIEdFVCBVUkwgdmFyaWFibGVzIGFuZCByZXR1cm4gdGhlbSBhcyBhbiBhc3NvY2lhdGl2ZSBhcnJheS5cbiAgICBmdW5jdGlvbiBnZXRVcmxWYXJzKClcbiAgICB7XG4gICAgICAgIHZhciB2YXJzID0gW10sIGhhc2g7XG4gICAgICAgIHZhciBoYXNoZXMgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zbGljZSh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCc/JykgKyAxKS5zcGxpdCgnJicpO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgaGFzaGVzLmxlbmd0aDsgaSsrKVxuICAgICAgICB7XG4gICAgICAgICAgICBoYXNoID0gaGFzaGVzW2ldLnNwbGl0KCc9Jyk7XG4gICAgICAgICAgICB2YXJzLnB1c2goaGFzaFswXSk7XG4gICAgICAgICAgICB2YXJzW2hhc2hbMF1dID0gaGFzaFsxXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFycztcbiAgICB9XG59XSk7XG5cbmFwcE1vZHVsZS5jb250cm9sbGVyKCdVSUNvbnRyb2xsZXInLCBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ1RhZ1NlcnZpY2UnLCBcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCBUYWdTZXJ2aWNlKSB7XG4gICAgICAgICRzY29wZS5TSEFPUEVOR19MSU5LSUVESU5fSUQgPSBUYWdTZXJ2aWNlLlNIQU9QRU5HX0xJTktJRURJTl9JRDtcbiAgICAgICAgJHNjb3BlLmxvYWRQZXJjZW50YWdlID0ge1xuICAgICAgICAgICAgbGlua2VkSW46ICAgMCxcbiAgICAgICAgICAgIHN1bW1hcnk6ICAgIDAsXG4gICAgICAgICAgICBlZHVjYXRpb25zOiAwLFxuICAgICAgICAgICAgc2tpbGxzOiAgICAgMCxcbiAgICAgICAgICAgIHBvc2l0aW9uczogIDAsXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGltZ0xvYWRJbnRlcnZhbCwgdGFnTG9hZEludGVydmFsLCBhZHZMb2FkSW50ZXJ2YWw7XG5cbiAgICAgICAgJHNjb3BlLiRvbignUFJPRklMRScsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmxvYWRQZXJjZW50YWdlLmxpbmtlZEluID0gMTAwO1xuICAgICAgICAgICAgICAgICRzY29wZS5jb21wbGV0ZVNlY3Rpb24oMCk7XG5cbiAgICAgICAgICAgICAgICAkc2NvcGUucHJvZmlsZSA9IFRhZ1NlcnZpY2UucHJvZmlsZTsgICBcbiAgICAgICAgICAgICAgICAkc2NvcGUuc3VtbWFyeSA9IFRhZ1NlcnZpY2UucHJvZmlsZS5zdW1tYXJ5IHx8ICcgJzsgIFxuICAgICAgICAgICAgICAgICRzY29wZS5lZHVjYXRpb25zID0gVGFnU2VydmljZS5lZHVjYXRpb25zIHx8IFtdOyAgIFxuICAgICAgICAgICAgICAgICRzY29wZS5za2lsbHMgPSBUYWdTZXJ2aWNlLnNraWxscyB8fCBbXTtcbiAgICAgICAgICAgICAgICAkc2NvcGUucG9zaXRpb25zID0gVGFnU2VydmljZS5wb3NpdGlvbnMgfHwgW107ICAgIFxuICAgIH0pO1xuXG4gICAgICAgICRzY29wZS4kb24oJ1BST0ZJTEVfQUxMJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgICRzY29wZS5saW5rZWRJbkxvYWRQZXJjZW50YWdlID0gMTAwO1xuICAgICAgICAgICAgJHNjb3BlLmNvbXBsZXRlU2VjdGlvbigwKTtcbiAgICAgICAgICAgIC8vJHNjb3BlLiRhcHBseSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuZmluZFNjaG9vbExvZ29VcmxGcm9tQ29tcGF5ID0gZnVuY3Rpb24oc2Nob29sTmFtZSkge1xuICAgICAgICAgICAgdmFyIGNvbXBhbnlVcmxNYXAgPSBUYWdTZXJ2aWNlLmNvbXBhbnlVcmxNYXA7XG4gICAgICAgICAgICBmb3IgKGtleSBpbiBjb21wYW55VXJsTWFwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbXBhbnkgPSBjb21wYW55VXJsTWFwW2tleV07XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2xvb2sgZm9yOiAnLCBjb21wYW55VXJsTWFwW2tleV0pO1xuICAgICAgICAgICAgICAgIGlmKGNvbXBhbnkubmFtZSAmJiBjb21wYW55LmxvZ29VcmwgJiYgY29tcGFueS5uYW1lID09PSBzY2hvb2xOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21wYW55LmxvZ29Vcmw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLmRpc3BsYXlTZWN0aW9uQ29udGVudCA9IGZ1bmN0aW9uKHNlY3Rpb24sIGNvbnRlbnRQcm9wZXJ0eSkge1xuICAgICAgICAgICAgJHNjb3BlLmxvYWRQZXJjZW50YWdlW2NvbnRlbnRQcm9wZXJ0eV0gPSAwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZigkc2NvcGVbY29udGVudFByb3BlcnR5XSkge1xuICAgICAgICAgICAgICAgICRzY29wZS5sb2FkUGVyY2VudGFnZVtjb250ZW50UHJvcGVydHldID0gMTAwO1xuICAgICAgICAgICAgICAgICRzY29wZS5jb21wbGV0ZVNlY3Rpb24oc2VjdGlvbik7XG4gICAgICAgICAgICAgICAgLy8gJHNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLm1heFZhbHVlID0gZnVuY3Rpb24odGFncykge1xuICAgICAgICAgICAgaWYodGFncy5sZW5ndGggJiYgdGFncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1heCA9IC05OTk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRhZ3MubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhZ3NbaV0udmFsdWUgPiBtYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heCA9IHRhZ3NbaV0udmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1heDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAxMDA7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICRzY29wZS50d2lua2xlU3R5bGUgPSBmdW5jdGlvbih2YWx1ZSwgbG9hZFBlcmNlbnRhZ2UpIHtcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uU3RyaW5nID0gJ3RvcCAwLjRzIGVhc2UgJyArICAodmFsdWUgKiAzKS50b0ZpeGVkKDIpICsgJ3MnICsgJywnICsgJ29wYWNpdHkgMC40cyBlYXNlICcgKyAgdmFsdWUgKiAzICsgJ3MnICsgJzsnOy8vICsgJywnICsgJ3RyYW5zZm9ybSAwLjRzIGVhc2UgJyArICc7JztcbiAgICAgICAgICAgIHZhciBhbmltYXRpb25EZWxheVN0cmluZyA9ICgxMCArIHZhbHVlICogNikgKyAncycgKyAnOyc7IFxuICAgICAgICAgICAgdmFyIHN0eWxlU3RyaW5nID0gJ2ZvbnQtc2l6ZTogJyArICgxNiArIHZhbHVlICogMTIpICsgJ3B4JyArICc7JyArXG4gICAgICAgICAgICAnbGluZS1oZWlnaHQ6ICcgKyAnMS41JyArICc7JyArXG4gICAgICAgICAgICAvKid0b3A6ICcgKyAobG9hZFBlcmNlbnRhZ2UgPT09IDEwMCkgJiYgJzAnIHx8ICcxMHB4JyArICc7JyArKi9cbiAgICAgICAgICAgICctd2Via2l0LXRyYW5zaXRpb246ICcgKyB0cmFuc2l0aW9uU3RyaW5nICtcbiAgICAgICAgICAgICctbW96LXRyYW5zaXRpb246ICcgKyB0cmFuc2l0aW9uU3RyaW5nICtcbiAgICAgICAgICAgICd0cmFuc2l0aW9uOiAnICsgdHJhbnNpdGlvblN0cmluZyArXG4gICAgICAgICAgICAnLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6ICcgKyBhbmltYXRpb25EZWxheVN0cmluZyArXG4gICAgICAgICAgICAnLW1vei1hbmltYXRpb24tZGVsYXk6ICcgKyBhbmltYXRpb25EZWxheVN0cmluZyArXG4gICAgICAgICAgICAnYW5pbWF0aW9uLWRlbGF5OiAnICsgYW5pbWF0aW9uRGVsYXlTdHJpbmc7XG5cbiAgICAgICAgICAgIHJldHVybiBzdHlsZVN0cmluZztcblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gJHNjb3BlLnRhZ0Jhc2VIZWlnaHQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAvLyAgICAgcmV0dXJuIE1hdGgubWluKDI4LCA4ICsgdmFsdWUgKiAzMik7XG4gICAgICAgIC8vIH1cblxuICAgICAgICAkc2NvcGUuY29tcGxldGVTZWN0aW9uID0gZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICAgICAgJHNjb3BlLmNvbXBsZXRlZFNlY3Rpb24gPSBzdGVwO1xuICAgICAgICB9XG5cblxuICAgICAgICAkc2NvcGUuc2Nyb2xsVG9TZWN0aW9uID0gZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICAgICAgLy8kKCcjc3RlcCcgKyBzdGVwKS5oZWlnaHQod2luZG93LmlubmVySGVpZ2h0KTtcbiAgICAgICAgICAgICQoJ2h0bWwsYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIHNjcm9sbFRvcDogJCgnI3N0ZXAnICsgc3RlcCkub2Zmc2V0KCkudG9wXG4gICAgICAgICAgICB9LCA0MDApO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLnZpc2libGUgPSBmdW5jdGlvbihpZGVudGlmaWVyKSB7XG4gICAgICAgICAgICBpZiAoaWRlbnRpZmllciA9PT0gJ2xpbmtlZEluJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAgJHNjb3BlLmxvYWRQZXJjZW50YWdlW2lkZW50aWZpZXJdID4gMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5sb2FkUGVyY2VudGFnZVtpZGVudGlmaWVyXSA9PT0gMTAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgIH1dKTtcblxuXG4iLCJhcHBNb2R1bGUuc2VydmljZSgnVGFnU2VydmljZScsIFsnJGh0dHAnLCAnJHJvb3RTY29wZScsICckcScsIGZ1bmN0aW9uICgkaHR0cCwgJHJvb3RTY29wZSwgJHEpIHtcbiAgICBcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAvLyB0aGlzLlNIQU9QRU5HX0xJTktJRURJTl9JRCA9ICdxQzcyZm1KR2xCJztcblxuICAgIHRoaXMuY29tcGFueVVybE1hcCA9IHt9O1xuICAgIHRoaXMuY29tcGFueVVybE1hcFsxMDQzXSA9ICB7aWQ6IDEwNDMsIGxvZ29Vcmw6IFwiaHR0cHM6Ly9tZWRpYS5saWNkbi5jb20vbXByL21wci9wLzMvMDA1LzA3Yi8wMGEvMDVkZWY0Mi5wbmdcIiwgbmFtZTogXCJTaWVtZW5zXCJ9O1xuICAgIHRoaXMuY29tcGFueVVybE1hcFs1MDc3MjBdID0ge2lkOiA1MDc3MjAsIGxvZ29Vcmw6IFwiaHR0cHM6Ly9tZWRpYS5saWNkbi5jb20vbXByL21wci9wLzMvMDAwLzAzMi8xNGMvMGZhZDYzOC5wbmdcIiwgbmFtZTogXCJCZWlqaW5nIEppYW90b25nIFVuaXZlcnNpdHlcIn0gO1xuICAgIHRoaXMuY29tcGFueVVybE1hcFszNDYxXSA9IHtpZDogMzQ2MSwgbG9nb1VybDogXCJodHRwczovL21lZGlhLmxpY2RuLmNvbS9tcHIvbXByL3AvNy8wMDAvMmI1LzFiMy8zN2FlZWZlLnBuZ1wiLCBuYW1lOiBcIlVuaXZlcnNpdHkgb2YgUGl0dHNidXJnaFwifTtcbiAgICBcbiAgICB0aGlzLmdldFRhZ3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHByb21pc2UgPSAkaHR0cC5nZXQoJ2FwaS90YWdzLmpzb24nKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIHRoaXMuZ2V0U3RhdGljQWR2cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJvbWlzZSA9ICRodHRwLmdldCgnYXBpL2FkdnMuanNvbicpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgdGhpcy5sb2FkUHJvZmlsZSA9IGZ1bmN0aW9uKElOUHJvZmlsZSkge1xuICAgICAgICBpZihJTlByb2ZpbGUpIHtcbiAgICAgICAgICAgIHRoYXQucHJvZmlsZSA9IElOUHJvZmlsZTtcbiAgICAgICAgICAgIHRoYXQucG9zaXRpb25zID0gZ3JvdXBQb3NpdGlvbkJ5WWVhcihJTlByb2ZpbGUucG9zaXRpb25zKTsgIFxuXG4gICAgICAgICAgICB0aGF0LnNraWxscyA9IGZsYXR0ZW5Ta2lsbHMoSU5Qcm9maWxlLnNraWxscyk7XG4gICAgICAgICAgICB0aGF0LmVkdWNhdGlvbnMgPSBJTlByb2ZpbGUuZWR1Y2F0aW9ucy52YWx1ZXM7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoYXQucHJvZmlsZSk7XG4gICAgICAgICAgICBnZXRDb21wYW55TG9nb3MoSU5Qcm9maWxlLnBvc2l0aW9ucykudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgdGhhdC5wb3NpdGlvbnMgPSBncm91cFBvc2l0aW9uQnlZZWFyKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhhdC5wb3NpdGlvbnMpO1xuICAgICAgICAgICAgICAgIC8vICRyb290U2NvcGUuJGJyb2FkY2FzdCgnUFJPRklMRV9BTEwnLCBudWxsKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ1BST0ZJTEUnLCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKElOUHJvZmlsZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgJGh0dHAuZ2V0KCdhcGkvc2hhb3BlbmdfbGlua2VkaW5fcHJvZmlsZS5qc29uJykuc3VjY2VzcyhmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICB2YXIgSU5Qcm9maWxlID0gZGF0YTtcbiAgICAgICAgICAgICAgICB0aGF0LnByb2ZpbGUgPSBJTlByb2ZpbGU7XG4gICAgICAgICAgICAgICAgdGhhdC5wb3NpdGlvbnMgPSBncm91cFBvc2l0aW9uQnlZZWFyKElOUHJvZmlsZS5wb3NpdGlvbnMpOyAgXG5cbiAgICAgICAgICAgICAgICB0aGF0LnNraWxscyA9IGZsYXR0ZW5Ta2lsbHMoSU5Qcm9maWxlLnNraWxscyk7XG4gICAgICAgICAgICAgICAgdGhhdC5lZHVjYXRpb25zID0gSU5Qcm9maWxlLmVkdWNhdGlvbnMudmFsdWVzO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoYXQucHJvZmlsZSk7XG4gICAgICAgICAgICAgICAgdGhhdC5wb3NpdGlvbnMgPSBnZXRTdGF0aWNDb21wYW55TG9nb3MoSU5Qcm9maWxlLnBvc2l0aW9ucyk7XG4gICAgICAgICAgICAgICAgdGhhdC5wb3NpdGlvbnMgPSBncm91cFBvc2l0aW9uQnlZZWFyKHRoYXQucG9zaXRpb25zKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGF0LnBvc2l0aW9ucyk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdQUk9GSUxFJywgbnVsbCk7XG5cbiAgICAgICAgICAgICAgICAvLyAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ1BST0ZJTEUnLCBudWxsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZsYXR0ZW5Ta2lsbHMoSU5Ta2lsbHMpIHtcbiAgICAgICAgdmFyIHNraWxscyA9IElOU2tpbGxzICYmIChJTlNraWxscy52YWx1ZXMgfHwgW10pIHx8IFtdO1xuICAgICAgICB2YXIgYSA9IFtdO1xuXG4gICAgICAgIGlmKGFuZ3VsYXIuaXNBcnJheShza2lsbHMpKXtcbiAgICAgICAgICAgIHNraWxscy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGluZGV4LCBhcnJheSkge1xuICAgICAgICAgICAgICAgIGlmKGVsZW1lbnQuc2tpbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgYS5wdXNoKHtuYW1lOiBlbGVtZW50LnNraWxsLm5hbWUsIHZhbHVlOiBNYXRoLnJhbmRvbSgpfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTdGF0aWNDb21wYW55TG9nb3MoSU5Qb3NpdGlvbnMpIHtcbiAgICAgICAgaWYoSU5Qb3NpdGlvbnMudmFsdWVzICYmIGFuZ3VsYXIuaXNBcnJheShJTlBvc2l0aW9ucy52YWx1ZXMpKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IElOUG9zaXRpb25zLnZhbHVlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICBJTlBvc2l0aW9ucy52YWx1ZXNbaV0ubG9nb1VybCA9IHRoYXQuY29tcGFueVVybE1hcFtJTlBvc2l0aW9ucy52YWx1ZXNbaV0uY29tcGFueS5pZF0ubG9nb1VybDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gSU5Qb3NpdGlvbnM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXN5bmNMb2dvVXJsKGlkKSB7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgaWYodGhhdC5jb21wYW55VXJsTWFwW2lkXSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSB0aGF0LmNvbXBhbnlVcmxNYXBbaWRdO1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHRzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdZYXkhIFNhdmVkIG9uZSBBUEkgY2FsbCwgZm91bmQgY29tcGFueSBvYmplY3QgaW4gY2FjaGU6ICcsIHJlc3VsdHMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgSU4uQVBJLlJhdygnL2NvbXBhbmllcy9pZD0nICsgaWQgKyAnOihpZCxuYW1lLGxvZ28tdXJsKScpXG4gICAgICAgICAgICAucmVzdWx0KGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0cy5sb2dvVXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHBvc2l0aW9uLmxvZ29VcmwgPSByZXN1bHRzLmxvZ29Vcmw7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhc3luY0xvZ29VcmwnLCByZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wYW55VXJsTWFwW2lkXSA9IHJlc3VsdHM7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVzdWx0cyk7ICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZXJyb3IoZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICAgICAgICAgIC8vaW4gY2FzZSBvZiBuZXR3b3JrIGVycm9yLCB0aHJvdHRsZSwgZXRjLlxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2FzeW5jTG9nb1VybCBlcnJvcjogJywgYW5ndWxhci50b0pzb24oZXJyb3IsIHRydWUpKVxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgICAgICAgICB9KTsgICAgICAgICAgICBcbiAgICAgICAgfVxuXG5cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Q29tcGFueUxvZ29zKElOUG9zaXRpb25zKSB7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IElOUG9zaXRpb25zLnZhbHVlcyB8fCBbXTtcbiAgICAgICAgdmFyIGIgPSBbXTtcbiAgICAgICAgcG9zaXRpb25zLmZvckVhY2goZnVuY3Rpb24ocG9zaXRpb24sIGluZGV4LCBhcnJheSkge1xuICAgICAgICAgICAgaWYocG9zaXRpb24uY29tcGFueSAmJiBwb3NpdGlvbi5jb21wYW55LmlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIHByb21pc2UgPSBhc3luY0xvZ29VcmwocG9zaXRpb24uY29tcGFueS5pZCk7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1Byb21pc2UgPSBwcm9taXNlLnRoZW4oZnVuY3Rpb24oc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbi5sb2dvVXJsID0gc3VjY2Vzcy5sb2dvVXJsO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYi5wdXNoKG5ld1Byb21pc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkcS5hbGwoYikudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCctLS1hbGwtLS0nLCByZXN1bHQpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJy0tLWFsbC0tLScsIGFuZ3VsYXIudG9Kc29uKHJlc3VsdCwgdHJ1ZSkpO1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBncm91cFBvc2l0aW9uQnlZZWFyKHBvc2l0aW9uc0FycmF5KSB7XG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBbXTtcblxuICAgICAgICBpZihhbmd1bGFyLmlzQXJyYXkocG9zaXRpb25zQXJyYXkpKSB7XG4gICAgICAgICAgICBwb3NpdGlvbnMgPSBwb3NpdGlvbnNBcnJheTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHBvc2l0aW9uc0FycmF5LnZhbHVlcyAmJiBhbmd1bGFyLmlzQXJyYXkocG9zaXRpb25zQXJyYXkudmFsdWVzKSkge1xuICAgICAgICAgICAgcG9zaXRpb25zID0gcG9zaXRpb25zQXJyYXkudmFsdWVzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgYSA9IFtdO1xuXG4gICAgICAgIGlmKHBvc2l0aW9ucy5sZW5ndGggPT09IDAgfHwgKHBvc2l0aW9uc1swXSAmJiAhcG9zaXRpb25zWzBdLnN0YXJ0RGF0ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGFuZ3VsYXIuaXNBcnJheShwb3NpdGlvbnMpKSB7XG5cbiAgICAgICAgICAgIHZhciBldmVuID0gMDtcbiAgICAgICAgICAgIHBvc2l0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHBvc2l0aW9uLCBpbmRleCwgYXJyYXkpIHtcblxuICAgICAgICAgICAgICAgIGlmIChhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvL3B1c2ggdGhpcyB5ZWFyIGZpcnN0XG4gICAgICAgICAgICAgICAgICAgIGlmKCFwb3NpdGlvbi5zdGFydERhdGUgfHwgcG9zaXRpb24uc3RhcnREYXRlLnllYXIgIT09IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYS5wdXNoKHttYXJrOiBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCl9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLnN0YXJ0RGF0ZSA9IHBvc2l0aW9uLnN0YXJ0RGF0ZSB8fCB7eWVhcjogbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpLCBtb250aDogMH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvL29uIHRoZSBmaXJzdCBwb3NpdGlvbiwgcHVzaCBhIHllYXIgbWFyayBmaXJzdFxuXG4gICAgICAgICAgICAgICAgICAgIGEucHVzaCh7bWFyazogcG9zaXRpb24uc3RhcnREYXRlLnllYXJ9KTtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24uZXZlbiA9IGV2ZW47XG4gICAgICAgICAgICAgICAgICAgIGEucHVzaChwb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW4gPSAxIC0gZXZlbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vc2Vjb25kIG9uZSBhbmQgb24sIGNvbXBhcmUgd2l0aCB0aGUgcHJldmlvdXMgb25lLCAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciBsYXN0UG9zaXRpb24gPSBhW2EubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIC8vaWYgaXQgc3RhcnRzIGluIHRoZSBuZXcgeWVhciwgdGhlbiBwdXNoIGEgeWVhciBtYXJrIGZpcnN0XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0UG9zaXRpb24uc3RhcnREYXRlLnllYXIgIT09IHBvc2l0aW9uLnN0YXJ0RGF0ZS55ZWFyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhLnB1c2goe21hcms6IHBvc2l0aW9uLnN0YXJ0RGF0ZS55ZWFyfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy9pZiBpdCBpcyBpbiB0aGUgc2FtZSB5ZWFyLCBqdXN0IHB1c2ggdGhlIHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLmV2ZW4gPSBldmVuO1xuICAgICAgICAgICAgICAgICAgICBhLnB1c2gocG9zaXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZXZlbiA9IDEgLSBldmVuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xufVxucmV0dXJuIGE7XG59XG5cbn1dKTsiLCJcblxuYXBwTW9kdWxlLmRpcmVjdGl2ZSgnbG9hZFByb2dyZXNzSWNvbicsIFtmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIGljb25jbGFzczogJ0AnLCBcbiAgICAgICAgICAgIHByb2dyZXNzOiAnQCcsIFxuICAgICAgICAgICAgcmV2ZXJzZTogJ0AnXG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImdseXBoLXByb2dyZXNzXCIgbmctY2xhc3M9XCJ7XFwncmV2ZXJzZVxcJzogcmV2ZXJzZX1cIj4gXFxcbiAgICAgICAgPGRpdiBjbGFzcz1cIiB2aWV3LXBvcnRcIiBuZy1jbGFzcz1cIntcXCdmZ1xcJzogcmV2ZXJzZSwgXFwnYmdcXCc6ICFyZXZlcnNlfVwiPjxzcGFuIGNsYXNzPVwie3tpY29uY2xhc3N9fVwiPjwvc3Bhbj48L2Rpdj4gICAgXFxcbiAgICAgICAgPGRpdiBjbGFzcz1cIiB2aWV3LXBvcnRcIiBuZy1jbGFzcz1cIntcXCdiZ1xcJzogcmV2ZXJzZSwgXFwnZmdcXCc6ICFyZXZlcnNlfVwiPjxzcGFuIGNsYXNzPVwie3tpY29uY2xhc3N9fVwiPjwvc3Bhbj48L2Rpdj4gICBcXFxuICAgICAgICA8L2Rpdj4nLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICBzY29wZS4kd2F0Y2goJ3Byb2dyZXNzJywgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2xvYWRQcm9ncmVzc0ljb24ucHJvZ3Jlc3MgPSAnLCBuZXdWYWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmKHBhcnNlSW50KG5ld1ZhbHVlKSA9PT0gMTAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2xvYWRlZCcpO1xuICAgICAgICAgICAgICAgICAgICB9LDEwMClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYocGFyc2VJbnQobmV3VmFsdWUpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2xvYWRlZCcpO1xuICAgICAgICAgICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfTtcbn1dKTtcblxuIC8qdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiZ2x5cGgtcHJvZ3Jlc3NcIj4gXFxcbiAgICAgICAgPGRpdiBjbGFzcz1cIiB2aWV3LXBvcnRcIiBuZy1jbGFzcz1cIntcXCdmZ1xcJzogcmV2ZXJzZSwgXFwnYmdcXCc6ICFyZXZlcnNlfVwiPjxzcGFuIGNsYXNzPVwie3tpY29uY2xhc3N9fVwiPjwvc3Bhbj48L2Rpdj4gICAgXFxcbiAgICAgICAgPGRpdiBjbGFzcz1cIiB2aWV3LXBvcnRcIiBuZy1jbGFzcz1cIntcXCdiZ1xcJzogcmV2ZXJzZSwgXFwnZmdcXCc6ICFyZXZlcnNlfVwiIHN0eWxlPVwiaGVpZ2h0OiB7e3JldmVyc2UgJiYgcHJvZ3Jlc3MgfHwgKDEwMCAtIHByb2dyZXNzKX19JVwiPjxzcGFuIGNsYXNzPVwie3tpY29uY2xhc3N9fVwiPjwvc3Bhbj48L2Rpdj4gICBcXFxuICAgICAgICA8L2Rpdj4nLCovXG5cblxuYXBwTW9kdWxlLmZpbHRlcignaW50VG9Nb250aCcsIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHZhciBtYXAgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ107XG4gICAgICAgIGlucHV0ID0gcGFyc2VJbnQoaW5wdXQpO1xuICAgICAgICBpZiAoaW5wdXQgPiAwICYmIGlucHV0IDwgMTMpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXBbaW5wdXQgLSAxXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxufSk7XG5cbmFwcE1vZHVsZS5maWx0ZXIoJ2Zvckhvd0xvbmcnLCBmdW5jdGlvbigpe1xuICAgIHJldHVybiBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICBpZiAocG9zaXRpb24uaXNDdXJyZW50KSB7XG4gICAgICAgICAgICAvLyByZXR1cm4gJ3RpbGwgbm93J1xuICAgICAgICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgICAgIHBvc2l0aW9uLmVuZERhdGUgPSB7XG4gICAgICAgICAgICAgICAgeWVhcjogbm93LmdldEZ1bGxZZWFyKCksXG4gICAgICAgICAgICAgICAgbW9udGg6IG5vdy5nZXRNb250aCgpICsgMVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAocG9zaXRpb24uc3RhcnREYXRlICYmIHBvc2l0aW9uLmVuZERhdGUpIHtcbiAgICAgICAgICAgIHZhciB5ZWFyTG9uZyA9IHBvc2l0aW9uLmVuZERhdGUueWVhciAtIHBvc2l0aW9uLnN0YXJ0RGF0ZS55ZWFyLFxuICAgICAgICAgICAgbW9udGhMb25nID0gcG9zaXRpb24uZW5kRGF0ZS5tb250aCAtIHBvc2l0aW9uLnN0YXJ0RGF0ZS5tb250aDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKG1vbnRoTG9uZyA8IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgdG90YWxMb25nSW5Nb250aCA9IHllYXJMb25nICogMTIgKyBtb250aExvbmc7XG4gICAgICAgICAgICAgICAgeWVhckxvbmcgPSBNYXRoLmZsb29yKHRvdGFsTG9uZ0luTW9udGggLyAxMik7XG4gICAgICAgICAgICAgICAgbW9udGhMb25nID0gMTIgKyBtb250aExvbmc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB5ZWFyVW5pdCA9IHllYXJMb25nID4gMSA/ICd5ZWFycycgOiAneWVhcicsXG4gICAgICAgICAgICBtb250aFVuaXQgPSBtb250aExvbmcgPiAxID8gJ21vbnRocycgOiAnbW9udGgnO1xuXG4gICAgICAgICAgICB2YXIgeWVhclN0cmluZyA9IHllYXJMb25nID4gMCA/IHllYXJMb25nICsgJyAnICsgeWVhclVuaXQgKyAnICcgOiAnJyxcbiAgICAgICAgICAgIG1vbnRoU3RyaW5nID0gbW9udGhMb25nID4gMD8gbW9udGhMb25nICsgJyAnICsgbW9udGhVbml0IDogJyc7XG5cbiAgICAgICAgICAgIHZhciB3aG9sZVN0cmluZyA9IHllYXJTdHJpbmcgKyBtb250aFN0cmluZyArIChwb3NpdGlvbi5pc0N1cnJlbnQgPyAnIHRpbGwgbm93JyA6ICcnKTtcblxuICAgICAgICAgICAgcmV0dXJuIHdob2xlU3RyaW5nO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbn0pO1xuXG5hcHBNb2R1bGUuZGlyZWN0aXZlKCdicmVha0F0TicsIFtmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIGNvbnRlbnQ6ICdAJ1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG5cbiAgICAgICAgICAgIC8vbGlua2VkaW4gQVBJIHdpbGwgcmVtb3ZlIGxpbmUgYnJlYWtzLCBoZXJlIHdlIGFkZCB0aGVtIGJhY2sgaW4gYmVmb3JlIFwiLi4uKG4pXCIgd2hlcmUgbiA+IDFcbiAgICAgICAgICAgIGF0dHJzLiRvYnNlcnZlKCdjb250ZW50JywgZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgICAgICAgIC8vIHZhciBodG1sU3RyaW5nID0gdmFsdWUucmVwbGFjZSgvXFxzK1xcKFxcZCpcXCkvZywgZnVuY3Rpb24odikge1xuICAgICAgICAgICAgICAgIC8vICAgICByZXR1cm4gJyA8YnI+JyArIHY7XG4gICAgICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICB2YXIgaHRtbFN0cmluZyA9IHZhbHVlLnJlcGxhY2UoL1xcbi9nLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcgPGJyPic7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZWxlbWVudC5odG1sKGh0bWxTdHJpbmcpO1xuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQoJzxkaXYgY2xhc3M9XCJtYXNrXCI+PC9kaXY+Jyk7XG4gICAgICAgIH0pOyAgICAgXG5cbiAgICAgICAgfVxuICAgIH07XG59XSk7XG5cbmFwcE1vZHVsZS5kaXJlY3RpdmUoJ2NsaWNrQWRkQ2xhc3MnLCBbZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICB0b2dnbGVjbGFzczogJ0AnXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIGVsZW1lbnQub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnZXhwYW5kZWQnKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9O1xufV0pO1xuXG5hcHBNb2R1bGUuZGlyZWN0aXZlKCd2aXNpYmxlT25NYXJrJywgW2Z1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgbWFyazogJ0AnXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3RyYW5zcGFyZW50LWZpcnN0Jyk7XG4gICAgICAgICAgICBzY29wZS4kd2F0Y2goJ21hcmsnLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZihuZXdWYWx1ZSA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCd2aXNpYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygndmlzaWJsZScpO1xuICAgICAgICAgICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn1dKTtcblxuYXBwTW9kdWxlLmRpcmVjdGl2ZSgndmlzaWJsZU9uVGltZScsIFtmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHRpbWU6ICdAJ1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCd0cmFuc3BhcmVudC1maXJzdCcpO1xuICAgICAgICAgICAgdmFyIHRpbWUgPSBwYXJzZUludChzY29wZS50aW1lIHx8IDQwMCk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygndmlzaWJsZScpO1xuICAgICAgICAgICAgfSwgdGltZSk7XG4gICAgICAgIH1cbiAgICB9O1xufV0pXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=