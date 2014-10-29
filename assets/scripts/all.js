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
        var linkedInId = getUrlVars()['view'] === 'me' && 'me' || 'shaopeng';
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
        $scope.possiblyOnMobile = window.innerWidth <= 568 || window.innerWidth === 1024 || window.innerWidth === 768;

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
        
        $scope.twinkleStyle = function(value, index, length) {
            var transitionString = 'color 0.5s ease, text-shadow 0.5s ease, ' + 'top 0.4s ease ' +  (value * 3).toFixed(2) + 's' + ',' + 'opacity 0.4s ease ' +  value * 3 + 's' + ';';// + ',' + 'transform 0.4s ease ' + ';';
            var animationDelayString = (10 + value * 6) + 's' + ';'; 
            var fontSizeWeight = 1.0 * index / length < 0.06 ? 32 : (1.0 * index / length < 0.36 ? 24 : 16); 
            var styleString = 'font-size: ' + (fontSizeWeight + value * 8) + 'px' + ';' +
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


        $scope.blurringSkills = false;
        $scope.highlightingCategoryId = -1;
        $scope.highlightSkills = function(categoryId) {

            if(categoryId === -1) {
                $scope.blurringSkills = false;
                $scope.highlightingCategoryId = -1;
            }
            else {
                $scope.blurringSkills = true;
                $scope.highlightingCategoryId = categoryId;
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
                    a.push({name: element.skill.name, value: Math.random(), categoryId: element.categoryId });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpbmtlZGluLmpzIiwiYXBwLmpzIiwic2VydmljZS5qcyIsImhlbHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDck5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFsbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIGxvYWREYXRhKCkge1xuICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFwcEJvZHlcIikpLnNjb3BlKCkuJGFwcGx5KFxuICAgICAgICBmdW5jdGlvbigkc2NvcGUpIHtcbiAgICAgICAgICAgICRzY29wZS5nZXRMaW5rZWRJbkRhdGEoKTtcbiAgICAgICAgfSk7XG59XG5cbmZ1bmN0aW9uIG9uTGlua2VkSW5KU0xvYWQoKSB7XG4gICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXBwQm9keVwiKSkuc2NvcGUoKS4kYXBwbHkoXG4gICAgICAgIGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICAgICAgICAgJHNjb3BlLm9uTGlua2VkSW5KU0xvYWQoKTtcbiAgICAgICAgfSk7XG59IiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICQoJ2h0bWwsYm9keScpLmFuaW1hdGUoe3Njcm9sbFRvcDogMH0sIDgwMCk7XG4gICAgfSwgNDAwKTtcbiAgICBcbn0pO1xuLy8gdmFyIFNIQU9QRU5HX0xJTktJRURJTl9JRCA9ICdxQzcyZm1KR2xCJztcbnZhciBhcHBNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgndGFnZGVtbycsIFsnbmdSb3V0ZSddKTtcblxuYXBwTW9kdWxlLmNvbnRyb2xsZXIoJ0FwcENvbnRyb2xsZXInLCBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ1RhZ1NlcnZpY2UnLCAnJGxvY2F0aW9uJyxcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCBUYWdTZXJ2aWNlLCAkbG9jYXRpb24pIHtcbiAgICAgICAgJHNjb3BlLiRsb2NhdGlvbiA9ICRsb2NhdGlvbjtcbiAgICAgICAgdmFyIGxpbmtlZEluSWQgPSBnZXRVcmxWYXJzKClbJ3ZpZXcnXSA9PT0gJ21lJyAmJiAnbWUnIHx8ICdzaGFvcGVuZyc7XG4gICAgICAgIHZhciBwdWJsaWNQcm9maWxlVXJsID0gZW5jb2RlVVJJQ29tcG9uZW50KCd3d3cubGlua2VkaW4uY29tL2luL3NoYW9wZW5nemhhbmcvJyk7XG5cbiAgICAgICAgaWYobGlua2VkSW5JZCA9PT0gJ21lJykge1xuICAgICAgICAgICAgJHNjb3BlLnN0YXRpY0FwcCA9IGZhbHNlO1xuICAgICAgICAgICAgLy8kc2NvcGUuZ2V0TGlua2VkSW5EYXRhKCkgd2lsbCBiZSBjYWxsZWQgYnkgbG9hZERhdGEgb25BdXRoIGxpbmtlZEluIGhhbmRsZXJcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKGxpbmtlZEluSWQgPT09ICdzaGFvcGVuZycpe1xuICAgICAgICAgICAgJHNjb3BlLnN0YXRpY0FwcCA9IHRydWU7XG4gICAgICAgICAgICBnZXRTdGF0aWNEYXRhKCk7XG4gICAgICAgIH0gXG5cbiAgICAgICAgLy9pcGhvbmU6IGxhbmRzcGFjZSA1Njh4MjEyLCB2ZXJ0aWNhbCAzMjB4NDYwXG4gICAgICAgICRzY29wZS5wb3NzaWJseU9uTW9iaWxlID0gd2luZG93LmlubmVyV2lkdGggPD0gNTY4IHx8IHdpbmRvdy5pbm5lcldpZHRoID09PSAxMDI0IHx8IHdpbmRvdy5pbm5lcldpZHRoID09PSA3Njg7XG5cbiAgICAgICAgJHNjb3BlLm9uTGlua2VkSW5KU0xvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRzY29wZS5sbmtlZEluSlNMb2FkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5nZXRMaW5rZWRJbkRhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIElOLkFQSS5Qcm9maWxlKClcbiAgICAgICAgICAgIC5pZHMobGlua2VkSW5JZClcbiAgICAgICAgICAgIC5maWVsZHMoWydpZCcsICdmaXJzdE5hbWUnLCAnbGFzdE5hbWUnLCAnc3VtbWFyeScsICdlZHVjYXRpb25zJywgJ3BpY3R1cmVVcmxzOjoob3JpZ2luYWwpJywnaGVhZGxpbmUnLCdwdWJsaWNQcm9maWxlVXJsJywgJ3NraWxscycsICdwb3NpdGlvbnMnLCAncHJvamVjdHMnXSlcbiAgICAgICAgICAgIC5yZXN1bHQoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0KTtcbiAgICAgICAgICAgICAgICBwcm9maWxlID0gcmVzdWx0LnZhbHVlc1swXTtcbiAgICAgICAgICAgICAgICBUYWdTZXJ2aWNlLmxvYWRQcm9maWxlKHByb2ZpbGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRTdGF0aWNEYXRhKCkge1xuICAgICAgICAgICAgVGFnU2VydmljZS5sb2FkUHJvZmlsZShudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5nZXRQZW9wbGVEYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgcmF3VXJsID0gJy9wZW9wbGUvaWQ9JyArIGxpbmtlZEluSWQgKyAnOihpZCxmaXJzdC1uYW1lLGxhc3QtbmFtZSxoZWFkbGluZSxwaWN0dXJlLXVybHM6OihvcmlnaW5hbCksc3VtbWFyeSxlZHVjYXRpb25zLHNraWxscyxwb3NpdGlvbnMscHVibGljLXByb2ZpbGUtdXJsKSc7XG4gICAgICAgICAgICBJTi5BUEkuUmF3KClcbiAgICAgICAgICAgIC5yZXN1bHQoZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdHMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUubGlua2VkSW5Mb2FkZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBJTjtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5saW5rZWRJbkF1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBJTiAmJiBJTi5FTlYgJiYgSU4uRU5WLmF1dGggJiYgSU4uRU5WLmF1dGgub2F1dGhfdG9rZW47XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuc2lnbk91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgSU4uVXNlci5sb2dvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cblxuICAgIC8vIFJlYWQgYSBwYWdlJ3MgR0VUIFVSTCB2YXJpYWJsZXMgYW5kIHJldHVybiB0aGVtIGFzIGFuIGFzc29jaWF0aXZlIGFycmF5LlxuICAgIGZ1bmN0aW9uIGdldFVybFZhcnMoKVxuICAgIHtcbiAgICAgICAgdmFyIHZhcnMgPSBbXSwgaGFzaDtcbiAgICAgICAgdmFyIGhhc2hlcyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNsaWNlKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJz8nKSArIDEpLnNwbGl0KCcmJyk7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBoYXNoZXMubGVuZ3RoOyBpKyspXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhhc2ggPSBoYXNoZXNbaV0uc3BsaXQoJz0nKTtcbiAgICAgICAgICAgIHZhcnMucHVzaChoYXNoWzBdKTtcbiAgICAgICAgICAgIHZhcnNbaGFzaFswXV0gPSBoYXNoWzFdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YXJzO1xuICAgIH1cbn1dKTtcblxuYXBwTW9kdWxlLmNvbnRyb2xsZXIoJ1VJQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnVGFnU2VydmljZScsIFxuICAgIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsIFRhZ1NlcnZpY2UpIHtcbiAgICAgICAgJHNjb3BlLlNIQU9QRU5HX0xJTktJRURJTl9JRCA9IFRhZ1NlcnZpY2UuU0hBT1BFTkdfTElOS0lFRElOX0lEO1xuICAgICAgICAkc2NvcGUubG9hZFBlcmNlbnRhZ2UgPSB7XG4gICAgICAgICAgICBsaW5rZWRJbjogICAwLFxuICAgICAgICAgICAgc3VtbWFyeTogICAgMCxcbiAgICAgICAgICAgIGVkdWNhdGlvbnM6IDAsXG4gICAgICAgICAgICBza2lsbHM6ICAgICAwLFxuICAgICAgICAgICAgcG9zaXRpb25zOiAgMCxcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgaW1nTG9hZEludGVydmFsLCB0YWdMb2FkSW50ZXJ2YWwsIGFkdkxvYWRJbnRlcnZhbDtcblxuICAgICAgICAkc2NvcGUuJG9uKCdQUk9GSUxFJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUubG9hZFBlcmNlbnRhZ2UubGlua2VkSW4gPSAxMDA7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbXBsZXRlU2VjdGlvbigwKTtcblxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9maWxlID0gVGFnU2VydmljZS5wcm9maWxlOyAgIFxuICAgICAgICAgICAgICAgICRzY29wZS5zdW1tYXJ5ID0gVGFnU2VydmljZS5wcm9maWxlLnN1bW1hcnkgfHwgJyAnOyAgXG4gICAgICAgICAgICAgICAgJHNjb3BlLmVkdWNhdGlvbnMgPSBUYWdTZXJ2aWNlLmVkdWNhdGlvbnMgfHwgW107ICAgXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNraWxscyA9IFRhZ1NlcnZpY2Uuc2tpbGxzIHx8IFtdO1xuICAgICAgICAgICAgICAgICRzY29wZS5wb3NpdGlvbnMgPSBUYWdTZXJ2aWNlLnBvc2l0aW9ucyB8fCBbXTsgICAgXG4gICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLiRvbignUFJPRklMRV9BTEwnLCBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgJHNjb3BlLmxpbmtlZEluTG9hZFBlcmNlbnRhZ2UgPSAxMDA7XG4gICAgICAgICAgICAkc2NvcGUuY29tcGxldGVTZWN0aW9uKDApO1xuICAgICAgICAgICAgLy8kc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS5maW5kU2Nob29sTG9nb1VybEZyb21Db21wYXkgPSBmdW5jdGlvbihzY2hvb2xOYW1lKSB7XG4gICAgICAgICAgICB2YXIgY29tcGFueVVybE1hcCA9IFRhZ1NlcnZpY2UuY29tcGFueVVybE1hcDtcbiAgICAgICAgICAgIGZvciAoa2V5IGluIGNvbXBhbnlVcmxNYXApIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tcGFueSA9IGNvbXBhbnlVcmxNYXBba2V5XTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbG9vayBmb3I6ICcsIGNvbXBhbnlVcmxNYXBba2V5XSk7XG4gICAgICAgICAgICAgICAgaWYoY29tcGFueS5uYW1lICYmIGNvbXBhbnkubG9nb1VybCAmJiBjb21wYW55Lm5hbWUgPT09IHNjaG9vbE5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBhbnkubG9nb1VybDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuZGlzcGxheVNlY3Rpb25Db250ZW50ID0gZnVuY3Rpb24oc2VjdGlvbiwgY29udGVudFByb3BlcnR5KSB7XG4gICAgICAgICAgICAkc2NvcGUubG9hZFBlcmNlbnRhZ2VbY29udGVudFByb3BlcnR5XSA9IDA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCRzY29wZVtjb250ZW50UHJvcGVydHldKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmxvYWRQZXJjZW50YWdlW2NvbnRlbnRQcm9wZXJ0eV0gPSAxMDA7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbXBsZXRlU2VjdGlvbihzZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAvLyAkc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUubWF4VmFsdWUgPSBmdW5jdGlvbih0YWdzKSB7XG4gICAgICAgICAgICBpZih0YWdzLmxlbmd0aCAmJiB0YWdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgbWF4ID0gLTk5OTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGFncy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFnc1tpXS52YWx1ZSA+IG1heCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF4ID0gdGFnc1tpXS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbWF4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDEwMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnR3aW5rbGVTdHlsZSA9IGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvblN0cmluZyA9ICdjb2xvciAwLjVzIGVhc2UsIHRleHQtc2hhZG93IDAuNXMgZWFzZSwgJyArICd0b3AgMC40cyBlYXNlICcgKyAgKHZhbHVlICogMykudG9GaXhlZCgyKSArICdzJyArICcsJyArICdvcGFjaXR5IDAuNHMgZWFzZSAnICsgIHZhbHVlICogMyArICdzJyArICc7JzsvLyArICcsJyArICd0cmFuc2Zvcm0gMC40cyBlYXNlICcgKyAnOyc7XG4gICAgICAgICAgICB2YXIgYW5pbWF0aW9uRGVsYXlTdHJpbmcgPSAoMTAgKyB2YWx1ZSAqIDYpICsgJ3MnICsgJzsnOyBcbiAgICAgICAgICAgIHZhciBmb250U2l6ZVdlaWdodCA9IDEuMCAqIGluZGV4IC8gbGVuZ3RoIDwgMC4wNiA/IDMyIDogKDEuMCAqIGluZGV4IC8gbGVuZ3RoIDwgMC4zNiA/IDI0IDogMTYpOyBcbiAgICAgICAgICAgIHZhciBzdHlsZVN0cmluZyA9ICdmb250LXNpemU6ICcgKyAoZm9udFNpemVXZWlnaHQgKyB2YWx1ZSAqIDgpICsgJ3B4JyArICc7JyArXG4gICAgICAgICAgICAnbGluZS1oZWlnaHQ6ICcgKyAnMS41JyArICc7JyArXG4gICAgICAgICAgICAvKid0b3A6ICcgKyAobG9hZFBlcmNlbnRhZ2UgPT09IDEwMCkgJiYgJzAnIHx8ICcxMHB4JyArICc7JyArKi9cbiAgICAgICAgICAgICctd2Via2l0LXRyYW5zaXRpb246ICcgKyB0cmFuc2l0aW9uU3RyaW5nICtcbiAgICAgICAgICAgICctbW96LXRyYW5zaXRpb246ICcgKyB0cmFuc2l0aW9uU3RyaW5nICtcbiAgICAgICAgICAgICd0cmFuc2l0aW9uOiAnICsgdHJhbnNpdGlvblN0cmluZyArXG4gICAgICAgICAgICAnLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6ICcgKyBhbmltYXRpb25EZWxheVN0cmluZyArXG4gICAgICAgICAgICAnLW1vei1hbmltYXRpb24tZGVsYXk6ICcgKyBhbmltYXRpb25EZWxheVN0cmluZyArXG4gICAgICAgICAgICAnYW5pbWF0aW9uLWRlbGF5OiAnICsgYW5pbWF0aW9uRGVsYXlTdHJpbmc7XG5cbiAgICAgICAgICAgIHJldHVybiBzdHlsZVN0cmluZztcblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gJHNjb3BlLnRhZ0Jhc2VIZWlnaHQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAvLyAgICAgcmV0dXJuIE1hdGgubWluKDI4LCA4ICsgdmFsdWUgKiAzMik7XG4gICAgICAgIC8vIH1cblxuICAgICAgICAkc2NvcGUuY29tcGxldGVTZWN0aW9uID0gZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICAgICAgJHNjb3BlLmNvbXBsZXRlZFNlY3Rpb24gPSBzdGVwO1xuICAgICAgICB9XG5cblxuICAgICAgICAkc2NvcGUuc2Nyb2xsVG9TZWN0aW9uID0gZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICAgICAgLy8kKCcjc3RlcCcgKyBzdGVwKS5oZWlnaHQod2luZG93LmlubmVySGVpZ2h0KTtcbiAgICAgICAgICAgICQoJ2h0bWwsYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIHNjcm9sbFRvcDogJCgnI3N0ZXAnICsgc3RlcCkub2Zmc2V0KCkudG9wXG4gICAgICAgICAgICB9LCA0MDApO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLnZpc2libGUgPSBmdW5jdGlvbihpZGVudGlmaWVyKSB7XG4gICAgICAgICAgICBpZiAoaWRlbnRpZmllciA9PT0gJ2xpbmtlZEluJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAgJHNjb3BlLmxvYWRQZXJjZW50YWdlW2lkZW50aWZpZXJdID4gMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5sb2FkUGVyY2VudGFnZVtpZGVudGlmaWVyXSA9PT0gMTAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgICAgICAkc2NvcGUuYmx1cnJpbmdTa2lsbHMgPSBmYWxzZTtcbiAgICAgICAgJHNjb3BlLmhpZ2hsaWdodGluZ0NhdGVnb3J5SWQgPSAtMTtcbiAgICAgICAgJHNjb3BlLmhpZ2hsaWdodFNraWxscyA9IGZ1bmN0aW9uKGNhdGVnb3J5SWQpIHtcblxuICAgICAgICAgICAgaWYoY2F0ZWdvcnlJZCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuYmx1cnJpbmdTa2lsbHMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuaGlnaGxpZ2h0aW5nQ2F0ZWdvcnlJZCA9IC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmJsdXJyaW5nU2tpbGxzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuaGlnaGxpZ2h0aW5nQ2F0ZWdvcnlJZCA9IGNhdGVnb3J5SWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG5cbiAgICB9XSk7XG5cblxuIiwiYXBwTW9kdWxlLnNlcnZpY2UoJ1RhZ1NlcnZpY2UnLCBbJyRodHRwJywgJyRyb290U2NvcGUnLCAnJHEnLCBmdW5jdGlvbiAoJGh0dHAsICRyb290U2NvcGUsICRxKSB7XG4gICAgXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgLy8gdGhpcy5TSEFPUEVOR19MSU5LSUVESU5fSUQgPSAncUM3MmZtSkdsQic7XG5cbiAgICB0aGlzLmNvbXBhbnlVcmxNYXAgPSB7fTtcbiAgICB0aGlzLmNvbXBhbnlVcmxNYXBbMTA0M10gPSAge2lkOiAxMDQzLCBsb2dvVXJsOiBcImh0dHBzOi8vbWVkaWEubGljZG4uY29tL21wci9tcHIvcC8zLzAwNS8wN2IvMDBhLzA1ZGVmNDIucG5nXCIsIG5hbWU6IFwiU2llbWVuc1wifTtcbiAgICB0aGlzLmNvbXBhbnlVcmxNYXBbNTA3NzIwXSA9IHtpZDogNTA3NzIwLCBsb2dvVXJsOiBcImh0dHBzOi8vbWVkaWEubGljZG4uY29tL21wci9tcHIvcC8zLzAwMC8wMzIvMTRjLzBmYWQ2MzgucG5nXCIsIG5hbWU6IFwiQmVpamluZyBKaWFvdG9uZyBVbml2ZXJzaXR5XCJ9IDtcbiAgICB0aGlzLmNvbXBhbnlVcmxNYXBbMzQ2MV0gPSB7aWQ6IDM0NjEsIGxvZ29Vcmw6IFwiaHR0cHM6Ly9tZWRpYS5saWNkbi5jb20vbXByL21wci9wLzcvMDAwLzJiNS8xYjMvMzdhZWVmZS5wbmdcIiwgbmFtZTogXCJVbml2ZXJzaXR5IG9mIFBpdHRzYnVyZ2hcIn07XG4gICAgXG4gICAgdGhpcy5nZXRUYWdzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwcm9taXNlID0gJGh0dHAuZ2V0KCdhcGkvdGFncy5qc29uJykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICB0aGlzLmdldFN0YXRpY0FkdnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHByb21pc2UgPSAkaHR0cC5nZXQoJ2FwaS9hZHZzLmpzb24nKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIHRoaXMubG9hZFByb2ZpbGUgPSBmdW5jdGlvbihJTlByb2ZpbGUpIHtcbiAgICAgICAgaWYoSU5Qcm9maWxlKSB7XG4gICAgICAgICAgICB0aGF0LnByb2ZpbGUgPSBJTlByb2ZpbGU7XG4gICAgICAgICAgICB0aGF0LnBvc2l0aW9ucyA9IGdyb3VwUG9zaXRpb25CeVllYXIoSU5Qcm9maWxlLnBvc2l0aW9ucyk7ICBcblxuICAgICAgICAgICAgdGhhdC5za2lsbHMgPSBmbGF0dGVuU2tpbGxzKElOUHJvZmlsZS5za2lsbHMpO1xuICAgICAgICAgICAgdGhhdC5lZHVjYXRpb25zID0gSU5Qcm9maWxlLmVkdWNhdGlvbnMudmFsdWVzO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGF0LnByb2ZpbGUpO1xuICAgICAgICAgICAgZ2V0Q29tcGFueUxvZ29zKElOUHJvZmlsZS5wb3NpdGlvbnMpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xuICAgICAgICAgICAgICAgIHRoYXQucG9zaXRpb25zID0gZ3JvdXBQb3NpdGlvbkJ5WWVhcihyZXN1bHQpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoYXQucG9zaXRpb25zKTtcbiAgICAgICAgICAgICAgICAvLyAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ1BST0ZJTEVfQUxMJywgbnVsbCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdQUk9GSUxFJywgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihJTlByb2ZpbGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICRodHRwLmdldCgnYXBpL3NoYW9wZW5nX2xpbmtlZGluX3Byb2ZpbGUuanNvbicpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgdmFyIElOUHJvZmlsZSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgdGhhdC5wcm9maWxlID0gSU5Qcm9maWxlO1xuICAgICAgICAgICAgICAgIHRoYXQucG9zaXRpb25zID0gZ3JvdXBQb3NpdGlvbkJ5WWVhcihJTlByb2ZpbGUucG9zaXRpb25zKTsgIFxuXG4gICAgICAgICAgICAgICAgdGhhdC5za2lsbHMgPSBmbGF0dGVuU2tpbGxzKElOUHJvZmlsZS5za2lsbHMpO1xuICAgICAgICAgICAgICAgIHRoYXQuZWR1Y2F0aW9ucyA9IElOUHJvZmlsZS5lZHVjYXRpb25zLnZhbHVlcztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGF0LnByb2ZpbGUpO1xuICAgICAgICAgICAgICAgIHRoYXQucG9zaXRpb25zID0gZ2V0U3RhdGljQ29tcGFueUxvZ29zKElOUHJvZmlsZS5wb3NpdGlvbnMpO1xuICAgICAgICAgICAgICAgIHRoYXQucG9zaXRpb25zID0gZ3JvdXBQb3NpdGlvbkJ5WWVhcih0aGF0LnBvc2l0aW9ucyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhhdC5wb3NpdGlvbnMpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnUFJPRklMRScsIG51bGwpO1xuXG4gICAgICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdQUk9GSUxFJywgbnVsbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmbGF0dGVuU2tpbGxzKElOU2tpbGxzKSB7XG4gICAgICAgIHZhciBza2lsbHMgPSBJTlNraWxscyAmJiAoSU5Ta2lsbHMudmFsdWVzIHx8IFtdKSB8fCBbXTtcbiAgICAgICAgdmFyIGEgPSBbXTtcblxuICAgICAgICBpZihhbmd1bGFyLmlzQXJyYXkoc2tpbGxzKSl7XG4gICAgICAgICAgICBza2lsbHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LCBpbmRleCwgYXJyYXkpIHtcbiAgICAgICAgICAgICAgICBpZihlbGVtZW50LnNraWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGEucHVzaCh7bmFtZTogZWxlbWVudC5za2lsbC5uYW1lLCB2YWx1ZTogTWF0aC5yYW5kb20oKSwgY2F0ZWdvcnlJZDogZWxlbWVudC5jYXRlZ29yeUlkIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U3RhdGljQ29tcGFueUxvZ29zKElOUG9zaXRpb25zKSB7XG4gICAgICAgIGlmKElOUG9zaXRpb25zLnZhbHVlcyAmJiBhbmd1bGFyLmlzQXJyYXkoSU5Qb3NpdGlvbnMudmFsdWVzKSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBJTlBvc2l0aW9ucy52YWx1ZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgSU5Qb3NpdGlvbnMudmFsdWVzW2ldLmxvZ29VcmwgPSB0aGF0LmNvbXBhbnlVcmxNYXBbSU5Qb3NpdGlvbnMudmFsdWVzW2ldLmNvbXBhbnkuaWRdLmxvZ29Vcmw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIElOUG9zaXRpb25zO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFzeW5jTG9nb1VybChpZCkge1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAgIGlmKHRoYXQuY29tcGFueVVybE1hcFtpZF0pIHtcbiAgICAgICAgICAgIHZhciByZXN1bHRzID0gdGhhdC5jb21wYW55VXJsTWFwW2lkXTtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0cyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnWWF5ISBTYXZlZCBvbmUgQVBJIGNhbGwsIGZvdW5kIGNvbXBhbnkgb2JqZWN0IGluIGNhY2hlOiAnLCByZXN1bHRzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIElOLkFQSS5SYXcoJy9jb21wYW5pZXMvaWQ9JyArIGlkICsgJzooaWQsbmFtZSxsb2dvLXVybCknKVxuICAgICAgICAgICAgLnJlc3VsdChmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdHMubG9nb1VybCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBwb3NpdGlvbi5sb2dvVXJsID0gcmVzdWx0cy5sb2dvVXJsO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYXN5bmNMb2dvVXJsJywgcmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29tcGFueVVybE1hcFtpZF0gPSByZXN1bHRzO1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHJlc3VsdHMpOyAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgICAgICAgICAvL2luIGNhc2Ugb2YgbmV0d29yayBlcnJvciwgdGhyb3R0bGUsIGV0Yy5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdhc3luY0xvZ29VcmwgZXJyb3I6ICcsIGFuZ3VsYXIudG9Kc29uKGVycm9yLCB0cnVlKSlcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgfSk7ICAgICAgICAgICAgXG4gICAgICAgIH1cblxuXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldENvbXBhbnlMb2dvcyhJTlBvc2l0aW9ucykge1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBJTlBvc2l0aW9ucy52YWx1ZXMgfHwgW107XG4gICAgICAgIHZhciBiID0gW107XG4gICAgICAgIHBvc2l0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHBvc2l0aW9uLCBpbmRleCwgYXJyYXkpIHtcbiAgICAgICAgICAgIGlmKHBvc2l0aW9uLmNvbXBhbnkgJiYgcG9zaXRpb24uY29tcGFueS5pZCkge1xuICAgICAgICAgICAgICAgIHZhciBwcm9taXNlID0gYXN5bmNMb2dvVXJsKHBvc2l0aW9uLmNvbXBhbnkuaWQpO1xuICAgICAgICAgICAgICAgIHZhciBuZXdQcm9taXNlID0gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24ubG9nb1VybCA9IHN1Y2Nlc3MubG9nb1VybDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGIucHVzaChuZXdQcm9taXNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHEuYWxsKGIpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnLS0tYWxsLS0tJywgcmVzdWx0KTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCctLS1hbGwtLS0nLCBhbmd1bGFyLnRvSnNvbihyZXN1bHQsIHRydWUpKTtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ3JvdXBQb3NpdGlvbkJ5WWVhcihwb3NpdGlvbnNBcnJheSkge1xuICAgICAgICB2YXIgcG9zaXRpb25zID0gW107XG5cbiAgICAgICAgaWYoYW5ndWxhci5pc0FycmF5KHBvc2l0aW9uc0FycmF5KSkge1xuICAgICAgICAgICAgcG9zaXRpb25zID0gcG9zaXRpb25zQXJyYXk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihwb3NpdGlvbnNBcnJheS52YWx1ZXMgJiYgYW5ndWxhci5pc0FycmF5KHBvc2l0aW9uc0FycmF5LnZhbHVlcykpIHtcbiAgICAgICAgICAgIHBvc2l0aW9ucyA9IHBvc2l0aW9uc0FycmF5LnZhbHVlcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIGEgPSBbXTtcblxuICAgICAgICBpZihwb3NpdGlvbnMubGVuZ3RoID09PSAwIHx8IChwb3NpdGlvbnNbMF0gJiYgIXBvc2l0aW9uc1swXS5zdGFydERhdGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBpZihhbmd1bGFyLmlzQXJyYXkocG9zaXRpb25zKSkge1xuXG4gICAgICAgICAgICB2YXIgZXZlbiA9IDA7XG4gICAgICAgICAgICBwb3NpdGlvbnMuZm9yRWFjaChmdW5jdGlvbihwb3NpdGlvbiwgaW5kZXgsIGFycmF5KSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoYS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy9wdXNoIHRoaXMgeWVhciBmaXJzdFxuICAgICAgICAgICAgICAgICAgICBpZighcG9zaXRpb24uc3RhcnREYXRlIHx8IHBvc2l0aW9uLnN0YXJ0RGF0ZS55ZWFyICE9PSBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGEucHVzaCh7bWFyazogbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbi5zdGFydERhdGUgPSBwb3NpdGlvbi5zdGFydERhdGUgfHwge3llYXI6IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKSwgbW9udGg6IDB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy9vbiB0aGUgZmlyc3QgcG9zaXRpb24sIHB1c2ggYSB5ZWFyIG1hcmsgZmlyc3RcblxuICAgICAgICAgICAgICAgICAgICBhLnB1c2goe21hcms6IHBvc2l0aW9uLnN0YXJ0RGF0ZS55ZWFyfSk7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLmV2ZW4gPSBldmVuO1xuICAgICAgICAgICAgICAgICAgICBhLnB1c2gocG9zaXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBldmVuID0gMSAtIGV2ZW47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvL3NlY29uZCBvbmUgYW5kIG9uLCBjb21wYXJlIHdpdGggdGhlIHByZXZpb3VzIG9uZSwgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB2YXIgbGFzdFBvc2l0aW9uID0gYVthLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAvL2lmIGl0IHN0YXJ0cyBpbiB0aGUgbmV3IHllYXIsIHRoZW4gcHVzaCBhIHllYXIgbWFyayBmaXJzdFxuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdFBvc2l0aW9uLnN0YXJ0RGF0ZS55ZWFyICE9PSBwb3NpdGlvbi5zdGFydERhdGUueWVhcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYS5wdXNoKHttYXJrOiBwb3NpdGlvbi5zdGFydERhdGUueWVhcn0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vaWYgaXQgaXMgaW4gdGhlIHNhbWUgeWVhciwganVzdCBwdXNoIHRoZSBwb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbi5ldmVuID0gZXZlbjtcbiAgICAgICAgICAgICAgICAgICAgYS5wdXNoKHBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGV2ZW4gPSAxIC0gZXZlbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbn1cbnJldHVybiBhO1xufVxuXG59XSk7IiwiXG5cbmFwcE1vZHVsZS5kaXJlY3RpdmUoJ2xvYWRQcm9ncmVzc0ljb24nLCBbZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBpY29uY2xhc3M6ICdAJywgXG4gICAgICAgICAgICBwcm9ncmVzczogJ0AnLCBcbiAgICAgICAgICAgIHJldmVyc2U6ICdAJ1xuICAgICAgICB9LFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJnbHlwaC1wcm9ncmVzc1wiIG5nLWNsYXNzPVwie1xcJ3JldmVyc2VcXCc6IHJldmVyc2V9XCI+IFxcXG4gICAgICAgIDxkaXYgY2xhc3M9XCIgdmlldy1wb3J0XCIgbmctY2xhc3M9XCJ7XFwnZmdcXCc6IHJldmVyc2UsIFxcJ2JnXFwnOiAhcmV2ZXJzZX1cIj48c3BhbiBjbGFzcz1cInt7aWNvbmNsYXNzfX1cIj48L3NwYW4+PC9kaXY+ICAgIFxcXG4gICAgICAgIDxkaXYgY2xhc3M9XCIgdmlldy1wb3J0XCIgbmctY2xhc3M9XCJ7XFwnYmdcXCc6IHJldmVyc2UsIFxcJ2ZnXFwnOiAhcmV2ZXJzZX1cIj48c3BhbiBjbGFzcz1cInt7aWNvbmNsYXNzfX1cIj48L3NwYW4+PC9kaXY+ICAgXFxcbiAgICAgICAgPC9kaXY+JyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgc2NvcGUuJHdhdGNoKCdwcm9ncmVzcycsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdsb2FkUHJvZ3Jlc3NJY29uLnByb2dyZXNzID0gJywgbmV3VmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZihwYXJzZUludChuZXdWYWx1ZSkgPT09IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdsb2FkZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfSwxMDApXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmKHBhcnNlSW50KG5ld1ZhbHVlKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdsb2FkZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH07XG59XSk7XG5cbiAvKnRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImdseXBoLXByb2dyZXNzXCI+IFxcXG4gICAgICAgIDxkaXYgY2xhc3M9XCIgdmlldy1wb3J0XCIgbmctY2xhc3M9XCJ7XFwnZmdcXCc6IHJldmVyc2UsIFxcJ2JnXFwnOiAhcmV2ZXJzZX1cIj48c3BhbiBjbGFzcz1cInt7aWNvbmNsYXNzfX1cIj48L3NwYW4+PC9kaXY+ICAgIFxcXG4gICAgICAgIDxkaXYgY2xhc3M9XCIgdmlldy1wb3J0XCIgbmctY2xhc3M9XCJ7XFwnYmdcXCc6IHJldmVyc2UsIFxcJ2ZnXFwnOiAhcmV2ZXJzZX1cIiBzdHlsZT1cImhlaWdodDoge3tyZXZlcnNlICYmIHByb2dyZXNzIHx8ICgxMDAgLSBwcm9ncmVzcyl9fSVcIj48c3BhbiBjbGFzcz1cInt7aWNvbmNsYXNzfX1cIj48L3NwYW4+PC9kaXY+ICAgXFxcbiAgICAgICAgPC9kaXY+JywqL1xuXG5cbmFwcE1vZHVsZS5maWx0ZXIoJ2ludFRvTW9udGgnLCBmdW5jdGlvbigpe1xuICAgIHJldHVybiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgbWFwID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYyddO1xuICAgICAgICBpbnB1dCA9IHBhcnNlSW50KGlucHV0KTtcbiAgICAgICAgaWYgKGlucHV0ID4gMCAmJiBpbnB1dCA8IDEzKSB7XG4gICAgICAgICAgICByZXR1cm4gbWFwW2lucHV0IC0gMV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbn0pO1xuXG5hcHBNb2R1bGUuZmlsdGVyKCdmb3JIb3dMb25nJywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICAgICAgaWYgKHBvc2l0aW9uLmlzQ3VycmVudCkge1xuICAgICAgICAgICAgLy8gcmV0dXJuICd0aWxsIG5vdydcbiAgICAgICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgICAgICBwb3NpdGlvbi5lbmREYXRlID0ge1xuICAgICAgICAgICAgICAgIHllYXI6IG5vdy5nZXRGdWxsWWVhcigpLFxuICAgICAgICAgICAgICAgIG1vbnRoOiBub3cuZ2V0TW9udGgoKSArIDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHBvc2l0aW9uLnN0YXJ0RGF0ZSAmJiBwb3NpdGlvbi5lbmREYXRlKSB7XG4gICAgICAgICAgICB2YXIgeWVhckxvbmcgPSBwb3NpdGlvbi5lbmREYXRlLnllYXIgLSBwb3NpdGlvbi5zdGFydERhdGUueWVhcixcbiAgICAgICAgICAgIG1vbnRoTG9uZyA9IHBvc2l0aW9uLmVuZERhdGUubW9udGggLSBwb3NpdGlvbi5zdGFydERhdGUubW9udGg7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChtb250aExvbmcgPCAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRvdGFsTG9uZ0luTW9udGggPSB5ZWFyTG9uZyAqIDEyICsgbW9udGhMb25nO1xuICAgICAgICAgICAgICAgIHllYXJMb25nID0gTWF0aC5mbG9vcih0b3RhbExvbmdJbk1vbnRoIC8gMTIpO1xuICAgICAgICAgICAgICAgIG1vbnRoTG9uZyA9IDEyICsgbW9udGhMb25nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgeWVhclVuaXQgPSB5ZWFyTG9uZyA+IDEgPyAneWVhcnMnIDogJ3llYXInLFxuICAgICAgICAgICAgbW9udGhVbml0ID0gbW9udGhMb25nID4gMSA/ICdtb250aHMnIDogJ21vbnRoJztcblxuICAgICAgICAgICAgdmFyIHllYXJTdHJpbmcgPSB5ZWFyTG9uZyA+IDAgPyB5ZWFyTG9uZyArICcgJyArIHllYXJVbml0ICsgJyAnIDogJycsXG4gICAgICAgICAgICBtb250aFN0cmluZyA9IG1vbnRoTG9uZyA+IDA/IG1vbnRoTG9uZyArICcgJyArIG1vbnRoVW5pdCA6ICcnO1xuXG4gICAgICAgICAgICB2YXIgd2hvbGVTdHJpbmcgPSB5ZWFyU3RyaW5nICsgbW9udGhTdHJpbmcgKyAocG9zaXRpb24uaXNDdXJyZW50ID8gJyB0aWxsIG5vdycgOiAnJyk7XG5cbiAgICAgICAgICAgIHJldHVybiB3aG9sZVN0cmluZztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG59KTtcblxuYXBwTW9kdWxlLmRpcmVjdGl2ZSgnYnJlYWtBdE4nLCBbZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBjb250ZW50OiAnQCdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuXG4gICAgICAgICAgICAvL2xpbmtlZGluIEFQSSB3aWxsIHJlbW92ZSBsaW5lIGJyZWFrcywgaGVyZSB3ZSBhZGQgdGhlbSBiYWNrIGluIGJlZm9yZSBcIi4uLihuKVwiIHdoZXJlIG4gPiAxXG4gICAgICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnY29udGVudCcsIGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgICAgICAgICAvLyB2YXIgaHRtbFN0cmluZyA9IHZhbHVlLnJlcGxhY2UoL1xccytcXChcXGQqXFwpL2csIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgcmV0dXJuICcgPGJyPicgKyB2O1xuICAgICAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgdmFyIGh0bWxTdHJpbmcgPSB2YWx1ZS5yZXBsYWNlKC9cXG4vZywgZnVuY3Rpb24odikge1xuICAgICAgICAgICAgICAgIHJldHVybiAnIDxicj4nO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGVsZW1lbnQuaHRtbChodG1sU3RyaW5nKTtcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKCc8ZGl2IGNsYXNzPVwibWFza1wiPjwvZGl2PicpO1xuICAgICAgICB9KTsgICAgIFxuXG4gICAgICAgIH1cbiAgICB9O1xufV0pO1xuXG5hcHBNb2R1bGUuZGlyZWN0aXZlKCdjbGlja0FkZENsYXNzJywgW2Z1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgdG9nZ2xlY2xhc3M6ICdAJ1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICBlbGVtZW50Lm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2V4cGFuZGVkJyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfTtcbn1dKTtcblxuYXBwTW9kdWxlLmRpcmVjdGl2ZSgndmlzaWJsZU9uTWFyaycsIFtmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIG1hcms6ICdAJ1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCd0cmFuc3BhcmVudC1maXJzdCcpO1xuICAgICAgICAgICAgc2NvcGUuJHdhdGNoKCdtYXJrJywgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYobmV3VmFsdWUgPT09ICd0cnVlJykge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygndmlzaWJsZScpO1xuICAgICAgICAgICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ3Zpc2libGUnKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59XSk7XG5cbmFwcE1vZHVsZS5kaXJlY3RpdmUoJ3Zpc2libGVPblRpbWUnLCBbZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICB0aW1lOiAnQCdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygndHJhbnNwYXJlbnQtZmlyc3QnKTtcbiAgICAgICAgICAgIHZhciB0aW1lID0gcGFyc2VJbnQoc2NvcGUudGltZSB8fCA0MDApO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3Zpc2libGUnKTtcbiAgICAgICAgICAgIH0sIHRpbWUpO1xuICAgICAgICB9XG4gICAgfTtcbn1dKVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9