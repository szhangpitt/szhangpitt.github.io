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
        $scope.possiblyOnMobile = window.innerWidth <= 568;

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
            //$scope.$apply(function() {
                $scope.loadPercentage.linkedIn = 100;
                $scope.completeSection(0);

                $scope.profile = TagService.profile;   
                $scope.summary = TagService.profile.summary;  
                $scope.educations = TagService.educations;   
                $scope.skills = TagService.skills;
                $scope.positions = TagService.positions;    
           // });
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
        var skills = INSkills.values || [];
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
                INPositions.values[i].logoUrl = that.companyUrlMap[INPositions.values[i].id];
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

        if(angular.isArray(positions)) {

            var even = 0;
            positions.forEach(function(position, index, array) {


                if (a.length === 0) {
                    //push this year first
                    if(position.startDate.year !== new Date().getFullYear()) {
                        a.push({mark: new Date().getFullYear()});
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpbmtlZGluLmpzIiwiYXBwLmpzIiwic2VydmljZS5qcyIsImhlbHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gbG9hZERhdGEoKSB7XHJcbiAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcHBCb2R5XCIpKS5zY29wZSgpLiRhcHBseShcclxuICAgICAgICBmdW5jdGlvbigkc2NvcGUpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmdldExpbmtlZEluRGF0YSgpO1xyXG4gICAgICAgIH0pO1xyXG59IiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAkKCdodG1sLGJvZHknKS5hbmltYXRlKHtzY3JvbGxUb3A6IDB9LCA4MDApO1xyXG4gICAgfSwgNDAwKTtcclxuICAgIFxyXG59KTtcclxuLy8gdmFyIFNIQU9QRU5HX0xJTktJRURJTl9JRCA9ICdxQzcyZm1KR2xCJztcclxudmFyIGFwcE1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCd0YWdkZW1vJywgWyduZ1JvdXRlJ10pO1xyXG5cclxuYXBwTW9kdWxlLmNvbnRyb2xsZXIoJ0FwcENvbnRyb2xsZXInLCBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ1RhZ1NlcnZpY2UnLCAnJGxvY2F0aW9uJyxcclxuICAgIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsIFRhZ1NlcnZpY2UsICRsb2NhdGlvbikge1xyXG4gICAgICAgICRzY29wZS4kbG9jYXRpb24gPSAkbG9jYXRpb247XHJcbiAgICAgICAgdmFyIGxpbmtlZEluSWQgPSBnZXRVcmxWYXJzKClbJ3ZpZXcnXSA9PT0gJ3NoYW9wZW5nJyAmJiAnc2hhb3BlbmcnIHx8ICdtZSc7XHJcbiAgICAgICAgdmFyIHB1YmxpY1Byb2ZpbGVVcmwgPSBlbmNvZGVVUklDb21wb25lbnQoJ3d3dy5saW5rZWRpbi5jb20vaW4vc2hhb3Blbmd6aGFuZy8nKTtcclxuXHJcbiAgICAgICAgaWYobGlua2VkSW5JZCA9PT0gJ21lJykge1xyXG4gICAgICAgICAgICAkc2NvcGUuc3RhdGljQXBwID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vJHNjb3BlLmdldExpbmtlZEluRGF0YSgpIHdpbGwgYmUgY2FsbGVkIGJ5IGxvYWREYXRhIG9uQXV0aCBsaW5rZWRJbiBoYW5kbGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYobGlua2VkSW5JZCA9PT0gJ3NoYW9wZW5nJyl7XHJcbiAgICAgICAgICAgICRzY29wZS5zdGF0aWNBcHAgPSB0cnVlO1xyXG4gICAgICAgICAgICBnZXRTdGF0aWNEYXRhKCk7XHJcbiAgICAgICAgfSBcclxuXHJcbiAgICAgICAgLy9pcGhvbmU6IGxhbmRzcGFjZSA1Njh4MjEyLCB2ZXJ0aWNhbCAzMjB4NDYwXHJcbiAgICAgICAgJHNjb3BlLnBvc3NpYmx5T25Nb2JpbGUgPSB3aW5kb3cuaW5uZXJXaWR0aCA8PSA1Njg7XHJcblxyXG4gICAgICAgICRzY29wZS5nZXRMaW5rZWRJbkRhdGEgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgSU4uQVBJLlByb2ZpbGUoKVxyXG4gICAgICAgICAgICAuaWRzKGxpbmtlZEluSWQpXHJcbiAgICAgICAgICAgIC5maWVsZHMoWydpZCcsICdmaXJzdE5hbWUnLCAnbGFzdE5hbWUnLCAnc3VtbWFyeScsICdlZHVjYXRpb25zJywgJ3BpY3R1cmVVcmxzOjoob3JpZ2luYWwpJywnaGVhZGxpbmUnLCdwdWJsaWNQcm9maWxlVXJsJywgJ3NraWxscycsICdwb3NpdGlvbnMnLCAncHJvamVjdHMnXSlcclxuICAgICAgICAgICAgLnJlc3VsdChmdW5jdGlvbihyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICBwcm9maWxlID0gcmVzdWx0LnZhbHVlc1swXTtcclxuICAgICAgICAgICAgICAgIFRhZ1NlcnZpY2UubG9hZFByb2ZpbGUocHJvZmlsZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0U3RhdGljRGF0YSgpIHtcclxuICAgICAgICAgICAgVGFnU2VydmljZS5sb2FkUHJvZmlsZShudWxsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS5nZXRQZW9wbGVEYXRhID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciByYXdVcmwgPSAnL3Blb3BsZS9pZD0nICsgbGlua2VkSW5JZCArICc6KGlkLGZpcnN0LW5hbWUsbGFzdC1uYW1lLGhlYWRsaW5lLHBpY3R1cmUtdXJsczo6KG9yaWdpbmFsKSxzdW1tYXJ5LGVkdWNhdGlvbnMsc2tpbGxzLHBvc2l0aW9ucyxwdWJsaWMtcHJvZmlsZS11cmwpJztcclxuICAgICAgICAgICAgSU4uQVBJLlJhdygpXHJcbiAgICAgICAgICAgIC5yZXN1bHQoZnVuY3Rpb24ocmVzdWx0cykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0cyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLmxpbmtlZEluTG9hZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBJTjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS5saW5rZWRJbkF1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIElOICYmIElOLkVOViAmJiBJTi5FTlYuYXV0aCAmJiBJTi5FTlYuYXV0aC5vYXV0aF90b2tlbjtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIC8vIFJlYWQgYSBwYWdlJ3MgR0VUIFVSTCB2YXJpYWJsZXMgYW5kIHJldHVybiB0aGVtIGFzIGFuIGFzc29jaWF0aXZlIGFycmF5LlxyXG4gICAgZnVuY3Rpb24gZ2V0VXJsVmFycygpXHJcbiAgICB7XHJcbiAgICAgICAgdmFyIHZhcnMgPSBbXSwgaGFzaDtcclxuICAgICAgICB2YXIgaGFzaGVzID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc2xpY2Uod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignPycpICsgMSkuc3BsaXQoJyYnKTtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgaGFzaGVzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaGFzaCA9IGhhc2hlc1tpXS5zcGxpdCgnPScpO1xyXG4gICAgICAgICAgICB2YXJzLnB1c2goaGFzaFswXSk7XHJcbiAgICAgICAgICAgIHZhcnNbaGFzaFswXV0gPSBoYXNoWzFdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFycztcclxuICAgIH1cclxufV0pO1xyXG5cclxuYXBwTW9kdWxlLmNvbnRyb2xsZXIoJ1VJQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnVGFnU2VydmljZScsIFxyXG4gICAgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgVGFnU2VydmljZSkge1xyXG4gICAgICAgICRzY29wZS5TSEFPUEVOR19MSU5LSUVESU5fSUQgPSBUYWdTZXJ2aWNlLlNIQU9QRU5HX0xJTktJRURJTl9JRDtcclxuICAgICAgICAkc2NvcGUubG9hZFBlcmNlbnRhZ2UgPSB7XHJcbiAgICAgICAgICAgIGxpbmtlZEluOiAgIDAsXHJcbiAgICAgICAgICAgIHN1bW1hcnk6ICAgIDAsXHJcbiAgICAgICAgICAgIGVkdWNhdGlvbnM6IDAsXHJcbiAgICAgICAgICAgIHNraWxsczogICAgIDAsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uczogIDAsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGltZ0xvYWRJbnRlcnZhbCwgdGFnTG9hZEludGVydmFsLCBhZHZMb2FkSW50ZXJ2YWw7XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ1BST0ZJTEUnLCBmdW5jdGlvbihldmVudCwgZGF0YSkge1xyXG4gICAgICAgICAgICAvLyRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUubG9hZFBlcmNlbnRhZ2UubGlua2VkSW4gPSAxMDA7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuY29tcGxldGVTZWN0aW9uKDApO1xyXG5cclxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9maWxlID0gVGFnU2VydmljZS5wcm9maWxlOyAgIFxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnN1bW1hcnkgPSBUYWdTZXJ2aWNlLnByb2ZpbGUuc3VtbWFyeTsgIFxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmVkdWNhdGlvbnMgPSBUYWdTZXJ2aWNlLmVkdWNhdGlvbnM7ICAgXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2tpbGxzID0gVGFnU2VydmljZS5za2lsbHM7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUucG9zaXRpb25zID0gVGFnU2VydmljZS5wb3NpdGlvbnM7ICAgIFxyXG4gICAgICAgICAgIC8vIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ1BST0ZJTEVfQUxMJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmxpbmtlZEluTG9hZFBlcmNlbnRhZ2UgPSAxMDA7XHJcbiAgICAgICAgICAgICRzY29wZS5jb21wbGV0ZVNlY3Rpb24oMCk7XHJcbiAgICAgICAgICAgIC8vJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkc2NvcGUuZmluZFNjaG9vbExvZ29VcmxGcm9tQ29tcGF5ID0gZnVuY3Rpb24oc2Nob29sTmFtZSkge1xyXG4gICAgICAgICAgICB2YXIgY29tcGFueVVybE1hcCA9IFRhZ1NlcnZpY2UuY29tcGFueVVybE1hcDtcclxuICAgICAgICAgICAgZm9yIChrZXkgaW4gY29tcGFueVVybE1hcCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvbXBhbnkgPSBjb21wYW55VXJsTWFwW2tleV07XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbG9vayBmb3I6ICcsIGNvbXBhbnlVcmxNYXBba2V5XSk7XHJcbiAgICAgICAgICAgICAgICBpZihjb21wYW55Lm5hbWUgJiYgY29tcGFueS5sb2dvVXJsICYmIGNvbXBhbnkubmFtZSA9PT0gc2Nob29sTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21wYW55LmxvZ29Vcmw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLmRpc3BsYXlTZWN0aW9uQ29udGVudCA9IGZ1bmN0aW9uKHNlY3Rpb24sIGNvbnRlbnRQcm9wZXJ0eSkge1xyXG4gICAgICAgICAgICAkc2NvcGUubG9hZFBlcmNlbnRhZ2VbY29udGVudFByb3BlcnR5XSA9IDA7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZigkc2NvcGVbY29udGVudFByb3BlcnR5XSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmxvYWRQZXJjZW50YWdlW2NvbnRlbnRQcm9wZXJ0eV0gPSAxMDA7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuY29tcGxldGVTZWN0aW9uKHNlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgLy8gJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUubWF4VmFsdWUgPSBmdW5jdGlvbih0YWdzKSB7XHJcbiAgICAgICAgICAgIGlmKHRhZ3MubGVuZ3RoICYmIHRhZ3MubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1heCA9IC05OTk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGFncy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0YWdzW2ldLnZhbHVlID4gbWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heCA9IHRhZ3NbaV0udmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1heDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gMTAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAkc2NvcGUudHdpbmtsZVN0eWxlID0gZnVuY3Rpb24odmFsdWUsIGxvYWRQZXJjZW50YWdlKSB7XHJcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uU3RyaW5nID0gJ3RvcCAwLjRzIGVhc2UgJyArICAodmFsdWUgKiAzKS50b0ZpeGVkKDIpICsgJ3MnICsgJywnICsgJ29wYWNpdHkgMC40cyBlYXNlICcgKyAgdmFsdWUgKiAzICsgJ3MnICsgJzsnOy8vICsgJywnICsgJ3RyYW5zZm9ybSAwLjRzIGVhc2UgJyArICc7JztcclxuICAgICAgICAgICAgdmFyIGFuaW1hdGlvbkRlbGF5U3RyaW5nID0gKDEwICsgdmFsdWUgKiA2KSArICdzJyArICc7JzsgXHJcbiAgICAgICAgICAgIHZhciBzdHlsZVN0cmluZyA9ICdmb250LXNpemU6ICcgKyAoMTYgKyB2YWx1ZSAqIDEyKSArICdweCcgKyAnOycgK1xyXG4gICAgICAgICAgICAnbGluZS1oZWlnaHQ6ICcgKyAnMS41JyArICc7JyArXHJcbiAgICAgICAgICAgIC8qJ3RvcDogJyArIChsb2FkUGVyY2VudGFnZSA9PT0gMTAwKSAmJiAnMCcgfHwgJzEwcHgnICsgJzsnICsqL1xyXG4gICAgICAgICAgICAnLXdlYmtpdC10cmFuc2l0aW9uOiAnICsgdHJhbnNpdGlvblN0cmluZyArXHJcbiAgICAgICAgICAgICctbW96LXRyYW5zaXRpb246ICcgKyB0cmFuc2l0aW9uU3RyaW5nICtcclxuICAgICAgICAgICAgJ3RyYW5zaXRpb246ICcgKyB0cmFuc2l0aW9uU3RyaW5nICtcclxuICAgICAgICAgICAgJy13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAnICsgYW5pbWF0aW9uRGVsYXlTdHJpbmcgK1xyXG4gICAgICAgICAgICAnLW1vei1hbmltYXRpb24tZGVsYXk6ICcgKyBhbmltYXRpb25EZWxheVN0cmluZyArXHJcbiAgICAgICAgICAgICdhbmltYXRpb24tZGVsYXk6ICcgKyBhbmltYXRpb25EZWxheVN0cmluZztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdHlsZVN0cmluZztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyAkc2NvcGUudGFnQmFzZUhlaWdodCA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgLy8gICAgIHJldHVybiBNYXRoLm1pbigyOCwgOCArIHZhbHVlICogMzIpO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLmNvbXBsZXRlU2VjdGlvbiA9IGZ1bmN0aW9uKHN0ZXApIHtcclxuICAgICAgICAgICAgJHNjb3BlLmNvbXBsZXRlZFNlY3Rpb24gPSBzdGVwO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICRzY29wZS5zY3JvbGxUb1NlY3Rpb24gPSBmdW5jdGlvbihzdGVwKSB7XHJcbiAgICAgICAgICAgIC8vJCgnI3N0ZXAnICsgc3RlcCkuaGVpZ2h0KHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICAgICAgICAgICQoJ2h0bWwsYm9keScpLmFuaW1hdGUoe1xyXG4gICAgICAgICAgICAgICAgc2Nyb2xsVG9wOiAkKCcjc3RlcCcgKyBzdGVwKS5vZmZzZXQoKS50b3BcclxuICAgICAgICAgICAgfSwgNDAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS52aXNpYmxlID0gZnVuY3Rpb24oaWRlbnRpZmllcikge1xyXG4gICAgICAgICAgICBpZiAoaWRlbnRpZmllciA9PT0gJ2xpbmtlZEluJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICAkc2NvcGUubG9hZFBlcmNlbnRhZ2VbaWRlbnRpZmllcl0gPiAwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUubG9hZFBlcmNlbnRhZ2VbaWRlbnRpZmllcl0gPT09IDEwMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfV0pO1xyXG5cclxuXHJcbiIsImFwcE1vZHVsZS5zZXJ2aWNlKCdUYWdTZXJ2aWNlJywgWyckaHR0cCcsICckcm9vdFNjb3BlJywgJyRxJywgZnVuY3Rpb24gKCRodHRwLCAkcm9vdFNjb3BlLCAkcSkge1xyXG4gICAgXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgLy8gdGhpcy5TSEFPUEVOR19MSU5LSUVESU5fSUQgPSAncUM3MmZtSkdsQic7XHJcblxyXG4gICAgdGhpcy5jb21wYW55VXJsTWFwID0ge307XHJcbiAgICB0aGlzLmNvbXBhbnlVcmxNYXBbMTA0M10gPSAge2lkOiAxMDQzLCBsb2dvVXJsOiBcImh0dHBzOi8vbWVkaWEubGljZG4uY29tL21wci9tcHIvcC8zLzAwNS8wN2IvMDBhLzA1ZGVmNDIucG5nXCIsIG5hbWU6IFwiU2llbWVuc1wifTtcclxuICAgIHRoaXMuY29tcGFueVVybE1hcFs1MDc3MjBdID0ge2lkOiA1MDc3MjAsIGxvZ29Vcmw6IFwiaHR0cHM6Ly9tZWRpYS5saWNkbi5jb20vbXByL21wci9wLzMvMDAwLzAzMi8xNGMvMGZhZDYzOC5wbmdcIiwgbmFtZTogXCJCZWlqaW5nIEppYW90b25nIFVuaXZlcnNpdHlcIn0gO1xyXG4gICAgdGhpcy5jb21wYW55VXJsTWFwWzM0NjFdID0ge2lkOiAzNDYxLCBsb2dvVXJsOiBcImh0dHBzOi8vbWVkaWEubGljZG4uY29tL21wci9tcHIvcC83LzAwMC8yYjUvMWIzLzM3YWVlZmUucG5nXCIsIG5hbWU6IFwiVW5pdmVyc2l0eSBvZiBQaXR0c2J1cmdoXCJ9O1xyXG4gICAgXHJcbiAgICB0aGlzLmdldFRhZ3MgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcHJvbWlzZSA9ICRodHRwLmdldCgnYXBpL3RhZ3MuanNvbicpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5nZXRTdGF0aWNBZHZzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHByb21pc2UgPSAkaHR0cC5nZXQoJ2FwaS9hZHZzLmpzb24nKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBwcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubG9hZFByb2ZpbGUgPSBmdW5jdGlvbihJTlByb2ZpbGUpIHtcclxuICAgICAgICBpZihJTlByb2ZpbGUpIHtcclxuICAgICAgICAgICAgdGhhdC5wcm9maWxlID0gSU5Qcm9maWxlO1xyXG4gICAgICAgICAgICB0aGF0LnBvc2l0aW9ucyA9IGdyb3VwUG9zaXRpb25CeVllYXIoSU5Qcm9maWxlLnBvc2l0aW9ucyk7ICBcclxuXHJcbiAgICAgICAgICAgIHRoYXQuc2tpbGxzID0gZmxhdHRlblNraWxscyhJTlByb2ZpbGUuc2tpbGxzKTtcclxuICAgICAgICAgICAgdGhhdC5lZHVjYXRpb25zID0gSU5Qcm9maWxlLmVkdWNhdGlvbnMudmFsdWVzO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhhdC5wcm9maWxlKTtcclxuICAgICAgICAgICAgZ2V0Q29tcGFueUxvZ29zKElOUHJvZmlsZS5wb3NpdGlvbnMpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnBvc2l0aW9ucyA9IGdyb3VwUG9zaXRpb25CeVllYXIocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoYXQucG9zaXRpb25zKTtcclxuICAgICAgICAgICAgICAgIC8vICRyb290U2NvcGUuJGJyb2FkY2FzdCgnUFJPRklMRV9BTEwnLCBudWxsKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ1BST0ZJTEUnLCBudWxsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZihJTlByb2ZpbGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgJGh0dHAuZ2V0KCdhcGkvc2hhb3BlbmdfbGlua2VkaW5fcHJvZmlsZS5qc29uJykuc3VjY2VzcyhmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgICAgIHZhciBJTlByb2ZpbGUgPSBkYXRhO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5wcm9maWxlID0gSU5Qcm9maWxlO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5wb3NpdGlvbnMgPSBncm91cFBvc2l0aW9uQnlZZWFyKElOUHJvZmlsZS5wb3NpdGlvbnMpOyAgXHJcblxyXG4gICAgICAgICAgICAgICAgdGhhdC5za2lsbHMgPSBmbGF0dGVuU2tpbGxzKElOUHJvZmlsZS5za2lsbHMpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5lZHVjYXRpb25zID0gSU5Qcm9maWxlLmVkdWNhdGlvbnMudmFsdWVzO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGF0LnByb2ZpbGUpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5wb3NpdGlvbnMgPSBnZXRTdGF0aWNDb21wYW55TG9nb3MoSU5Qcm9maWxlLnBvc2l0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnBvc2l0aW9ucyA9IGdyb3VwUG9zaXRpb25CeVllYXIodGhhdC5wb3NpdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhhdC5wb3NpdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdQUk9GSUxFJywgbnVsbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdQUk9GSUxFJywgbnVsbCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBmbGF0dGVuU2tpbGxzKElOU2tpbGxzKSB7XHJcbiAgICAgICAgdmFyIHNraWxscyA9IElOU2tpbGxzLnZhbHVlcyB8fCBbXTtcclxuICAgICAgICB2YXIgYSA9IFtdO1xyXG5cclxuICAgICAgICBpZihhbmd1bGFyLmlzQXJyYXkoc2tpbGxzKSl7XHJcbiAgICAgICAgICAgIHNraWxscy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGluZGV4LCBhcnJheSkge1xyXG4gICAgICAgICAgICAgICAgaWYoZWxlbWVudC5za2lsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGEucHVzaCh7bmFtZTogZWxlbWVudC5za2lsbC5uYW1lLCB2YWx1ZTogTWF0aC5yYW5kb20oKX0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBhO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFN0YXRpY0NvbXBhbnlMb2dvcyhJTlBvc2l0aW9ucykge1xyXG4gICAgICAgIGlmKElOUG9zaXRpb25zLnZhbHVlcyAmJiBhbmd1bGFyLmlzQXJyYXkoSU5Qb3NpdGlvbnMudmFsdWVzKSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IElOUG9zaXRpb25zLnZhbHVlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAgICAgICAgIElOUG9zaXRpb25zLnZhbHVlc1tpXS5sb2dvVXJsID0gdGhhdC5jb21wYW55VXJsTWFwW0lOUG9zaXRpb25zLnZhbHVlc1tpXS5pZF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIElOUG9zaXRpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFzeW5jTG9nb1VybChpZCkge1xyXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgIGlmKHRoYXQuY29tcGFueVVybE1hcFtpZF0pIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSB0aGF0LmNvbXBhbnlVcmxNYXBbaWRdO1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdHMpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnWWF5ISBTYXZlZCBvbmUgQVBJIGNhbGwsIGZvdW5kIGNvbXBhbnkgb2JqZWN0IGluIGNhY2hlOiAnLCByZXN1bHRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIElOLkFQSS5SYXcoJy9jb21wYW5pZXMvaWQ9JyArIGlkICsgJzooaWQsbmFtZSxsb2dvLXVybCknKVxyXG4gICAgICAgICAgICAucmVzdWx0KGZ1bmN0aW9uKHJlc3VsdHMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHRzLmxvZ29VcmwpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBwb3NpdGlvbi5sb2dvVXJsID0gcmVzdWx0cy5sb2dvVXJsO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhc3luY0xvZ29VcmwnLCByZXN1bHRzKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXBhbnlVcmxNYXBbaWRdID0gcmVzdWx0cztcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdHMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHJlc3VsdHMpOyAgICBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZXJyb3IoZnVuY3Rpb24oZXJyb3Ipe1xyXG4gICAgICAgICAgICAgICAgLy9pbiBjYXNlIG9mIG5ldHdvcmsgZXJyb3IsIHRocm90dGxlLCBldGMuXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdhc3luY0xvZ29VcmwgZXJyb3I6ICcsIGFuZ3VsYXIudG9Kc29uKGVycm9yLCB0cnVlKSlcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH0pOyAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldENvbXBhbnlMb2dvcyhJTlBvc2l0aW9ucykge1xyXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBJTlBvc2l0aW9ucy52YWx1ZXMgfHwgW107XHJcbiAgICAgICAgdmFyIGIgPSBbXTtcclxuICAgICAgICBwb3NpdGlvbnMuZm9yRWFjaChmdW5jdGlvbihwb3NpdGlvbiwgaW5kZXgsIGFycmF5KSB7XHJcbiAgICAgICAgICAgIGlmKHBvc2l0aW9uLmNvbXBhbnkgJiYgcG9zaXRpb24uY29tcGFueS5pZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHByb21pc2UgPSBhc3luY0xvZ29VcmwocG9zaXRpb24uY29tcGFueS5pZCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3UHJvbWlzZSA9IHByb21pc2UudGhlbihmdW5jdGlvbihzdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24ubG9nb1VybCA9IHN1Y2Nlc3MubG9nb1VybDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGIucHVzaChuZXdQcm9taXNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkcS5hbGwoYikudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJy0tLWFsbC0tLScsIHJlc3VsdCk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCctLS1hbGwtLS0nLCBhbmd1bGFyLnRvSnNvbihyZXN1bHQsIHRydWUpKTtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBncm91cFBvc2l0aW9uQnlZZWFyKHBvc2l0aW9uc0FycmF5KSB7XHJcbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IFtdO1xyXG5cclxuICAgICAgICBpZihhbmd1bGFyLmlzQXJyYXkocG9zaXRpb25zQXJyYXkpKSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9ucyA9IHBvc2l0aW9uc0FycmF5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKHBvc2l0aW9uc0FycmF5LnZhbHVlcyAmJiBhbmd1bGFyLmlzQXJyYXkocG9zaXRpb25zQXJyYXkudmFsdWVzKSkge1xyXG4gICAgICAgICAgICBwb3NpdGlvbnMgPSBwb3NpdGlvbnNBcnJheS52YWx1ZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBhID0gW107XHJcblxyXG4gICAgICAgIGlmKGFuZ3VsYXIuaXNBcnJheShwb3NpdGlvbnMpKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgZXZlbiA9IDA7XHJcbiAgICAgICAgICAgIHBvc2l0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHBvc2l0aW9uLCBpbmRleCwgYXJyYXkpIHtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGEubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9wdXNoIHRoaXMgeWVhciBmaXJzdFxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHBvc2l0aW9uLnN0YXJ0RGF0ZS55ZWFyICE9PSBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYS5wdXNoKHttYXJrOiBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCl9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy9vbiB0aGUgZmlyc3QgcG9zaXRpb24sIHB1c2ggYSB5ZWFyIG1hcmsgZmlyc3RcclxuICAgICAgICAgICAgICAgICAgICBhLnB1c2goe21hcms6IHBvc2l0aW9uLnN0YXJ0RGF0ZS55ZWFyfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24uZXZlbiA9IGV2ZW47XHJcbiAgICAgICAgICAgICAgICAgICAgYS5wdXNoKHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICBldmVuID0gMSAtIGV2ZW47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3NlY29uZCBvbmUgYW5kIG9uLCBjb21wYXJlIHdpdGggdGhlIHByZXZpb3VzIG9uZSwgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBsYXN0UG9zaXRpb24gPSBhW2EubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiBpdCBzdGFydHMgaW4gdGhlIG5ldyB5ZWFyLCB0aGVuIHB1c2ggYSB5ZWFyIG1hcmsgZmlyc3RcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdFBvc2l0aW9uLnN0YXJ0RGF0ZS55ZWFyICE9PSBwb3NpdGlvbi5zdGFydERhdGUueWVhcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhLnB1c2goe21hcms6IHBvc2l0aW9uLnN0YXJ0RGF0ZS55ZWFyfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgaXQgaXMgaW4gdGhlIHNhbWUgeWVhciwganVzdCBwdXNoIHRoZSBwb3NpdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLmV2ZW4gPSBldmVuO1xyXG4gICAgICAgICAgICAgICAgICAgIGEucHVzaChwb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbiA9IDEgLSBldmVuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxufVxyXG5yZXR1cm4gYTtcclxufVxyXG5cclxufV0pOyIsIlxyXG5cclxuYXBwTW9kdWxlLmRpcmVjdGl2ZSgnbG9hZFByb2dyZXNzSWNvbicsIFtmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICBpY29uY2xhc3M6ICdAJywgXHJcbiAgICAgICAgICAgIHByb2dyZXNzOiAnQCcsIFxyXG4gICAgICAgICAgICByZXZlcnNlOiAnQCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImdseXBoLXByb2dyZXNzXCIgbmctY2xhc3M9XCJ7XFwncmV2ZXJzZVxcJzogcmV2ZXJzZX1cIj4gXFxcclxuICAgICAgICA8ZGl2IGNsYXNzPVwiIHZpZXctcG9ydFwiIG5nLWNsYXNzPVwie1xcJ2ZnXFwnOiByZXZlcnNlLCBcXCdiZ1xcJzogIXJldmVyc2V9XCI+PHNwYW4gY2xhc3M9XCJ7e2ljb25jbGFzc319XCI+PC9zcGFuPjwvZGl2PiAgICBcXFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCIgdmlldy1wb3J0XCIgbmctY2xhc3M9XCJ7XFwnYmdcXCc6IHJldmVyc2UsIFxcJ2ZnXFwnOiAhcmV2ZXJzZX1cIj48c3BhbiBjbGFzcz1cInt7aWNvbmNsYXNzfX1cIj48L3NwYW4+PC9kaXY+ICAgXFxcclxuICAgICAgICA8L2Rpdj4nLFxyXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICAgICAgc2NvcGUuJHdhdGNoKCdwcm9ncmVzcycsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2xvYWRQcm9ncmVzc0ljb24ucHJvZ3Jlc3MgPSAnLCBuZXdWYWx1ZSwgb2xkVmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgaWYocGFyc2VJbnQobmV3VmFsdWUpID09PSAxMDApIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2xvYWRlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sMTAwKVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZihwYXJzZUludChuZXdWYWx1ZSkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2xvYWRlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufV0pO1xyXG5cclxuIC8qdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiZ2x5cGgtcHJvZ3Jlc3NcIj4gXFxcclxuICAgICAgICA8ZGl2IGNsYXNzPVwiIHZpZXctcG9ydFwiIG5nLWNsYXNzPVwie1xcJ2ZnXFwnOiByZXZlcnNlLCBcXCdiZ1xcJzogIXJldmVyc2V9XCI+PHNwYW4gY2xhc3M9XCJ7e2ljb25jbGFzc319XCI+PC9zcGFuPjwvZGl2PiAgICBcXFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCIgdmlldy1wb3J0XCIgbmctY2xhc3M9XCJ7XFwnYmdcXCc6IHJldmVyc2UsIFxcJ2ZnXFwnOiAhcmV2ZXJzZX1cIiBzdHlsZT1cImhlaWdodDoge3tyZXZlcnNlICYmIHByb2dyZXNzIHx8ICgxMDAgLSBwcm9ncmVzcyl9fSVcIj48c3BhbiBjbGFzcz1cInt7aWNvbmNsYXNzfX1cIj48L3NwYW4+PC9kaXY+ICAgXFxcclxuICAgICAgICA8L2Rpdj4nLCovXHJcblxyXG5cclxuYXBwTW9kdWxlLmZpbHRlcignaW50VG9Nb250aCcsIGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oaW5wdXQpIHtcclxuICAgICAgICB2YXIgbWFwID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYyddO1xyXG4gICAgICAgIGlucHV0ID0gcGFyc2VJbnQoaW5wdXQpO1xyXG4gICAgICAgIGlmIChpbnB1dCA+IDAgJiYgaW5wdXQgPCAxMykge1xyXG4gICAgICAgICAgICByZXR1cm4gbWFwW2lucHV0IC0gMV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxufSk7XHJcblxyXG5hcHBNb2R1bGUuZmlsdGVyKCdmb3JIb3dMb25nJywgZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiBmdW5jdGlvbihwb3NpdGlvbikge1xyXG4gICAgICAgIGlmIChwb3NpdGlvbi5pc0N1cnJlbnQpIHtcclxuICAgICAgICAgICAgLy8gcmV0dXJuICd0aWxsIG5vdydcclxuICAgICAgICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XHJcblxyXG4gICAgICAgICAgICBwb3NpdGlvbi5lbmREYXRlID0ge1xyXG4gICAgICAgICAgICAgICAgeWVhcjogbm93LmdldEZ1bGxZZWFyKCksXHJcbiAgICAgICAgICAgICAgICBtb250aDogbm93LmdldE1vbnRoKCkgKyAxXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHBvc2l0aW9uLnN0YXJ0RGF0ZSAmJiBwb3NpdGlvbi5lbmREYXRlKSB7XHJcbiAgICAgICAgICAgIHZhciB5ZWFyTG9uZyA9IHBvc2l0aW9uLmVuZERhdGUueWVhciAtIHBvc2l0aW9uLnN0YXJ0RGF0ZS55ZWFyLFxyXG4gICAgICAgICAgICBtb250aExvbmcgPSBwb3NpdGlvbi5lbmREYXRlLm1vbnRoIC0gcG9zaXRpb24uc3RhcnREYXRlLm1vbnRoO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKG1vbnRoTG9uZyA8IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciB0b3RhbExvbmdJbk1vbnRoID0geWVhckxvbmcgKiAxMiArIG1vbnRoTG9uZztcclxuICAgICAgICAgICAgICAgIHllYXJMb25nID0gTWF0aC5mbG9vcih0b3RhbExvbmdJbk1vbnRoIC8gMTIpO1xyXG4gICAgICAgICAgICAgICAgbW9udGhMb25nID0gMTIgKyBtb250aExvbmc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciB5ZWFyVW5pdCA9IHllYXJMb25nID4gMSA/ICd5ZWFycycgOiAneWVhcicsXHJcbiAgICAgICAgICAgIG1vbnRoVW5pdCA9IG1vbnRoTG9uZyA+IDEgPyAnbW9udGhzJyA6ICdtb250aCc7XHJcblxyXG4gICAgICAgICAgICB2YXIgeWVhclN0cmluZyA9IHllYXJMb25nID4gMCA/IHllYXJMb25nICsgJyAnICsgeWVhclVuaXQgKyAnICcgOiAnJyxcclxuICAgICAgICAgICAgbW9udGhTdHJpbmcgPSBtb250aExvbmcgPiAwPyBtb250aExvbmcgKyAnICcgKyBtb250aFVuaXQgOiAnJztcclxuXHJcbiAgICAgICAgICAgIHZhciB3aG9sZVN0cmluZyA9IHllYXJTdHJpbmcgKyBtb250aFN0cmluZyArIChwb3NpdGlvbi5pc0N1cnJlbnQgPyAnIHRpbGwgbm93JyA6ICcnKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB3aG9sZVN0cmluZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxufSk7XHJcblxyXG5hcHBNb2R1bGUuZGlyZWN0aXZlKCdicmVha0F0TicsIFtmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICBjb250ZW50OiAnQCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuXHJcbiAgICAgICAgICAgIC8vbGlua2VkaW4gQVBJIHdpbGwgcmVtb3ZlIGxpbmUgYnJlYWtzLCBoZXJlIHdlIGFkZCB0aGVtIGJhY2sgaW4gYmVmb3JlIFwiLi4uKG4pXCIgd2hlcmUgbiA+IDFcclxuICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUoJ2NvbnRlbnQnLCBmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgICAgICAgICAgICAvLyB2YXIgaHRtbFN0cmluZyA9IHZhbHVlLnJlcGxhY2UoL1xccytcXChcXGQqXFwpL2csIGZ1bmN0aW9uKHYpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICByZXR1cm4gJyA8YnI+JyArIHY7XHJcbiAgICAgICAgICAgICAgICAvLyB9KTtcclxuICAgICAgICAgICAgdmFyIGh0bWxTdHJpbmcgPSB2YWx1ZS5yZXBsYWNlKC9cXG4vZywgZnVuY3Rpb24odikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICcgPGJyPic7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZWxlbWVudC5odG1sKGh0bWxTdHJpbmcpO1xyXG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZCgnPGRpdiBjbGFzcz1cIm1hc2tcIj48L2Rpdj4nKTtcclxuICAgICAgICB9KTsgICAgIFxyXG5cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XSk7XHJcblxyXG5hcHBNb2R1bGUuZGlyZWN0aXZlKCdjbGlja0FkZENsYXNzJywgW2Z1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICB0b2dnbGVjbGFzczogJ0AnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdleHBhbmRlZCcpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1dKTtcclxuXHJcbmFwcE1vZHVsZS5kaXJlY3RpdmUoJ3Zpc2libGVPbk1hcmsnLCBbZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgIG1hcms6ICdAJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xyXG4gICAgICAgICAgICBzY29wZS4kd2F0Y2goJ21hcmsnLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGlmKG5ld1ZhbHVlID09PSAndHJ1ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCd2aXNpYmxlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ3Zpc2libGUnKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XSk7XHJcblxyXG5hcHBNb2R1bGUuZGlyZWN0aXZlKCd2aXNpYmxlT25UaW1lJywgW2Z1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICB0aW1lOiAnQCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygndHJhbnNwYXJlbnQtZmlyc3QnKTtcclxuICAgICAgICAgICAgdmFyIHRpbWUgPSBwYXJzZUludChzY29wZS50aW1lIHx8IDQwMCk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3Zpc2libGUnKTtcclxuICAgICAgICAgICAgfSwgdGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufV0pXHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==