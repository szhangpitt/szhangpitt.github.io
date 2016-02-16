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
    this.companyUrlMap[9999] =  {id: 9999, logoUrl: "https://media.licdn.com/mpr/mpr/shrink_200_200/AAEAAQAAAAAAAAN2AAAAJDEyMjUxZGE3LWRhZTQtNGRlMS05MmFmLTZmZjJkZjVlZjEzZA.png", name: "Bloomberg L.P."};
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpbmtlZGluLmpzIiwiYXBwLmpzIiwic2VydmljZS5qcyIsImhlbHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDck5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gbG9hZERhdGEoKSB7XG4gICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXBwQm9keVwiKSkuc2NvcGUoKS4kYXBwbHkoXG4gICAgICAgIGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICAgICAgICAgJHNjb3BlLmdldExpbmtlZEluRGF0YSgpO1xuICAgICAgICB9KTtcbn1cblxuZnVuY3Rpb24gb25MaW5rZWRJbkpTTG9hZCgpIHtcbiAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcHBCb2R5XCIpKS5zY29wZSgpLiRhcHBseShcbiAgICAgICAgZnVuY3Rpb24oJHNjb3BlKSB7XG4gICAgICAgICAgICAkc2NvcGUub25MaW5rZWRJbkpTTG9hZCgpO1xuICAgICAgICB9KTtcbn0iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgJCgnaHRtbCxib2R5JykuYW5pbWF0ZSh7c2Nyb2xsVG9wOiAwfSwgODAwKTtcbiAgICB9LCA0MDApO1xuICAgIFxufSk7XG4vLyB2YXIgU0hBT1BFTkdfTElOS0lFRElOX0lEID0gJ3FDNzJmbUpHbEInO1xudmFyIGFwcE1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCd0YWdkZW1vJywgWyduZ1JvdXRlJ10pO1xuXG5hcHBNb2R1bGUuY29udHJvbGxlcignQXBwQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnVGFnU2VydmljZScsICckbG9jYXRpb24nLFxuICAgIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsIFRhZ1NlcnZpY2UsICRsb2NhdGlvbikge1xuICAgICAgICAkc2NvcGUuJGxvY2F0aW9uID0gJGxvY2F0aW9uO1xuICAgICAgICB2YXIgbGlua2VkSW5JZCA9IGdldFVybFZhcnMoKVsndmlldyddID09PSAnbWUnICYmICdtZScgfHwgJ3NoYW9wZW5nJztcbiAgICAgICAgdmFyIHB1YmxpY1Byb2ZpbGVVcmwgPSBlbmNvZGVVUklDb21wb25lbnQoJ3d3dy5saW5rZWRpbi5jb20vaW4vc2hhb3Blbmd6aGFuZy8nKTtcblxuICAgICAgICBpZihsaW5rZWRJbklkID09PSAnbWUnKSB7XG4gICAgICAgICAgICAkc2NvcGUuc3RhdGljQXBwID0gZmFsc2U7XG4gICAgICAgICAgICAvLyRzY29wZS5nZXRMaW5rZWRJbkRhdGEoKSB3aWxsIGJlIGNhbGxlZCBieSBsb2FkRGF0YSBvbkF1dGggbGlua2VkSW4gaGFuZGxlclxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYobGlua2VkSW5JZCA9PT0gJ3NoYW9wZW5nJyl7XG4gICAgICAgICAgICAkc2NvcGUuc3RhdGljQXBwID0gdHJ1ZTtcbiAgICAgICAgICAgIGdldFN0YXRpY0RhdGEoKTtcbiAgICAgICAgfSBcblxuICAgICAgICAvL2lwaG9uZTogbGFuZHNwYWNlIDU2OHgyMTIsIHZlcnRpY2FsIDMyMHg0NjBcbiAgICAgICAgJHNjb3BlLnBvc3NpYmx5T25Nb2JpbGUgPSB3aW5kb3cuaW5uZXJXaWR0aCA8PSA1NjggfHwgd2luZG93LmlubmVyV2lkdGggPT09IDEwMjQgfHwgd2luZG93LmlubmVyV2lkdGggPT09IDc2ODtcblxuICAgICAgICAkc2NvcGUub25MaW5rZWRJbkpTTG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHNjb3BlLmxua2VkSW5KU0xvYWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLmdldExpbmtlZEluRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgSU4uQVBJLlByb2ZpbGUoKVxuICAgICAgICAgICAgLmlkcyhsaW5rZWRJbklkKVxuICAgICAgICAgICAgLmZpZWxkcyhbJ2lkJywgJ2ZpcnN0TmFtZScsICdsYXN0TmFtZScsICdzdW1tYXJ5JywgJ2VkdWNhdGlvbnMnLCAncGljdHVyZVVybHM6OihvcmlnaW5hbCknLCdoZWFkbGluZScsJ3B1YmxpY1Byb2ZpbGVVcmwnLCAnc2tpbGxzJywgJ3Bvc2l0aW9ucycsICdwcm9qZWN0cyddKVxuICAgICAgICAgICAgLnJlc3VsdChmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xuICAgICAgICAgICAgICAgIHByb2ZpbGUgPSByZXN1bHQudmFsdWVzWzBdO1xuICAgICAgICAgICAgICAgIFRhZ1NlcnZpY2UubG9hZFByb2ZpbGUocHJvZmlsZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldFN0YXRpY0RhdGEoKSB7XG4gICAgICAgICAgICBUYWdTZXJ2aWNlLmxvYWRQcm9maWxlKG51bGwpO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLmdldFBlb3BsZURhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciByYXdVcmwgPSAnL3Blb3BsZS9pZD0nICsgbGlua2VkSW5JZCArICc6KGlkLGZpcnN0LW5hbWUsbGFzdC1uYW1lLGhlYWRsaW5lLHBpY3R1cmUtdXJsczo6KG9yaWdpbmFsKSxzdW1tYXJ5LGVkdWNhdGlvbnMsc2tpbGxzLHBvc2l0aW9ucyxwdWJsaWMtcHJvZmlsZS11cmwpJztcbiAgICAgICAgICAgIElOLkFQSS5SYXcoKVxuICAgICAgICAgICAgLnJlc3VsdChmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0cyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5saW5rZWRJbkxvYWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIElOO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLmxpbmtlZEluQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIElOICYmIElOLkVOViAmJiBJTi5FTlYuYXV0aCAmJiBJTi5FTlYuYXV0aC5vYXV0aF90b2tlbjtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5zaWduT3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBJTi5Vc2VyLmxvZ291dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuXG4gICAgLy8gUmVhZCBhIHBhZ2UncyBHRVQgVVJMIHZhcmlhYmxlcyBhbmQgcmV0dXJuIHRoZW0gYXMgYW4gYXNzb2NpYXRpdmUgYXJyYXkuXG4gICAgZnVuY3Rpb24gZ2V0VXJsVmFycygpXG4gICAge1xuICAgICAgICB2YXIgdmFycyA9IFtdLCBoYXNoO1xuICAgICAgICB2YXIgaGFzaGVzID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc2xpY2Uod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignPycpICsgMSkuc3BsaXQoJyYnKTtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGhhc2hlcy5sZW5ndGg7IGkrKylcbiAgICAgICAge1xuICAgICAgICAgICAgaGFzaCA9IGhhc2hlc1tpXS5zcGxpdCgnPScpO1xuICAgICAgICAgICAgdmFycy5wdXNoKGhhc2hbMF0pO1xuICAgICAgICAgICAgdmFyc1toYXNoWzBdXSA9IGhhc2hbMV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhcnM7XG4gICAgfVxufV0pO1xuXG5hcHBNb2R1bGUuY29udHJvbGxlcignVUlDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICdUYWdTZXJ2aWNlJywgXG4gICAgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgVGFnU2VydmljZSkge1xuICAgICAgICAkc2NvcGUuU0hBT1BFTkdfTElOS0lFRElOX0lEID0gVGFnU2VydmljZS5TSEFPUEVOR19MSU5LSUVESU5fSUQ7XG4gICAgICAgICRzY29wZS5sb2FkUGVyY2VudGFnZSA9IHtcbiAgICAgICAgICAgIGxpbmtlZEluOiAgIDAsXG4gICAgICAgICAgICBzdW1tYXJ5OiAgICAwLFxuICAgICAgICAgICAgZWR1Y2F0aW9uczogMCxcbiAgICAgICAgICAgIHNraWxsczogICAgIDAsXG4gICAgICAgICAgICBwb3NpdGlvbnM6ICAwLFxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBpbWdMb2FkSW50ZXJ2YWwsIHRhZ0xvYWRJbnRlcnZhbCwgYWR2TG9hZEludGVydmFsO1xuXG4gICAgICAgICRzY29wZS4kb24oJ1BST0ZJTEUnLCBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgICAgICRzY29wZS5sb2FkUGVyY2VudGFnZS5saW5rZWRJbiA9IDEwMDtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY29tcGxldGVTZWN0aW9uKDApO1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLnByb2ZpbGUgPSBUYWdTZXJ2aWNlLnByb2ZpbGU7ICAgXG4gICAgICAgICAgICAgICAgJHNjb3BlLnN1bW1hcnkgPSBUYWdTZXJ2aWNlLnByb2ZpbGUuc3VtbWFyeSB8fCAnICc7ICBcbiAgICAgICAgICAgICAgICAkc2NvcGUuZWR1Y2F0aW9ucyA9IFRhZ1NlcnZpY2UuZWR1Y2F0aW9ucyB8fCBbXTsgICBcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2tpbGxzID0gVGFnU2VydmljZS5za2lsbHMgfHwgW107XG4gICAgICAgICAgICAgICAgJHNjb3BlLnBvc2l0aW9ucyA9IFRhZ1NlcnZpY2UucG9zaXRpb25zIHx8IFtdOyAgICBcbiAgICB9KTtcblxuICAgICAgICAkc2NvcGUuJG9uKCdQUk9GSUxFX0FMTCcsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICAkc2NvcGUubGlua2VkSW5Mb2FkUGVyY2VudGFnZSA9IDEwMDtcbiAgICAgICAgICAgICRzY29wZS5jb21wbGV0ZVNlY3Rpb24oMCk7XG4gICAgICAgICAgICAvLyRzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLmZpbmRTY2hvb2xMb2dvVXJsRnJvbUNvbXBheSA9IGZ1bmN0aW9uKHNjaG9vbE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBjb21wYW55VXJsTWFwID0gVGFnU2VydmljZS5jb21wYW55VXJsTWFwO1xuICAgICAgICAgICAgZm9yIChrZXkgaW4gY29tcGFueVVybE1hcCkge1xuICAgICAgICAgICAgICAgIHZhciBjb21wYW55ID0gY29tcGFueVVybE1hcFtrZXldO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdsb29rIGZvcjogJywgY29tcGFueVVybE1hcFtrZXldKTtcbiAgICAgICAgICAgICAgICBpZihjb21wYW55Lm5hbWUgJiYgY29tcGFueS5sb2dvVXJsICYmIGNvbXBhbnkubmFtZSA9PT0gc2Nob29sTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tcGFueS5sb2dvVXJsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5kaXNwbGF5U2VjdGlvbkNvbnRlbnQgPSBmdW5jdGlvbihzZWN0aW9uLCBjb250ZW50UHJvcGVydHkpIHtcbiAgICAgICAgICAgICRzY29wZS5sb2FkUGVyY2VudGFnZVtjb250ZW50UHJvcGVydHldID0gMDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoJHNjb3BlW2NvbnRlbnRQcm9wZXJ0eV0pIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUubG9hZFBlcmNlbnRhZ2VbY29udGVudFByb3BlcnR5XSA9IDEwMDtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY29tcGxldGVTZWN0aW9uKHNlY3Rpb24pO1xuICAgICAgICAgICAgICAgIC8vICRzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5tYXhWYWx1ZSA9IGZ1bmN0aW9uKHRhZ3MpIHtcbiAgICAgICAgICAgIGlmKHRhZ3MubGVuZ3RoICYmIHRhZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBtYXggPSAtOTk5O1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0YWdzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0YWdzW2ldLnZhbHVlID4gbWF4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXggPSB0YWdzW2ldLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBtYXg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMTAwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAkc2NvcGUudHdpbmtsZVN0eWxlID0gZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uU3RyaW5nID0gJ2NvbG9yIDAuNXMgZWFzZSwgdGV4dC1zaGFkb3cgMC41cyBlYXNlLCAnICsgJ3RvcCAwLjRzIGVhc2UgJyArICAodmFsdWUgKiAzKS50b0ZpeGVkKDIpICsgJ3MnICsgJywnICsgJ29wYWNpdHkgMC40cyBlYXNlICcgKyAgdmFsdWUgKiAzICsgJ3MnICsgJzsnOy8vICsgJywnICsgJ3RyYW5zZm9ybSAwLjRzIGVhc2UgJyArICc7JztcbiAgICAgICAgICAgIHZhciBhbmltYXRpb25EZWxheVN0cmluZyA9ICgxMCArIHZhbHVlICogNikgKyAncycgKyAnOyc7IFxuICAgICAgICAgICAgdmFyIGZvbnRTaXplV2VpZ2h0ID0gMS4wICogaW5kZXggLyBsZW5ndGggPCAwLjA2ID8gMzIgOiAoMS4wICogaW5kZXggLyBsZW5ndGggPCAwLjM2ID8gMjQgOiAxNik7IFxuICAgICAgICAgICAgdmFyIHN0eWxlU3RyaW5nID0gJ2ZvbnQtc2l6ZTogJyArIChmb250U2l6ZVdlaWdodCArIHZhbHVlICogOCkgKyAncHgnICsgJzsnICtcbiAgICAgICAgICAgICdsaW5lLWhlaWdodDogJyArICcxLjUnICsgJzsnICtcbiAgICAgICAgICAgIC8qJ3RvcDogJyArIChsb2FkUGVyY2VudGFnZSA9PT0gMTAwKSAmJiAnMCcgfHwgJzEwcHgnICsgJzsnICsqL1xuICAgICAgICAgICAgJy13ZWJraXQtdHJhbnNpdGlvbjogJyArIHRyYW5zaXRpb25TdHJpbmcgK1xuICAgICAgICAgICAgJy1tb3otdHJhbnNpdGlvbjogJyArIHRyYW5zaXRpb25TdHJpbmcgK1xuICAgICAgICAgICAgJ3RyYW5zaXRpb246ICcgKyB0cmFuc2l0aW9uU3RyaW5nICtcbiAgICAgICAgICAgICctd2Via2l0LWFuaW1hdGlvbi1kZWxheTogJyArIGFuaW1hdGlvbkRlbGF5U3RyaW5nICtcbiAgICAgICAgICAgICctbW96LWFuaW1hdGlvbi1kZWxheTogJyArIGFuaW1hdGlvbkRlbGF5U3RyaW5nICtcbiAgICAgICAgICAgICdhbmltYXRpb24tZGVsYXk6ICcgKyBhbmltYXRpb25EZWxheVN0cmluZztcblxuICAgICAgICAgICAgcmV0dXJuIHN0eWxlU3RyaW5nO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvLyAkc2NvcGUudGFnQmFzZUhlaWdodCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIC8vICAgICByZXR1cm4gTWF0aC5taW4oMjgsIDggKyB2YWx1ZSAqIDMyKTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgICRzY29wZS5jb21wbGV0ZVNlY3Rpb24gPSBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICAkc2NvcGUuY29tcGxldGVkU2VjdGlvbiA9IHN0ZXA7XG4gICAgICAgIH1cblxuXG4gICAgICAgICRzY29wZS5zY3JvbGxUb1NlY3Rpb24gPSBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgICAgICAvLyQoJyNzdGVwJyArIHN0ZXApLmhlaWdodCh3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgICAgICAgICAgJCgnaHRtbCxib2R5JykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgc2Nyb2xsVG9wOiAkKCcjc3RlcCcgKyBzdGVwKS5vZmZzZXQoKS50b3BcbiAgICAgICAgICAgIH0sIDQwMCk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUudmlzaWJsZSA9IGZ1bmN0aW9uKGlkZW50aWZpZXIpIHtcbiAgICAgICAgICAgIGlmIChpZGVudGlmaWVyID09PSAnbGlua2VkSW4nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICAkc2NvcGUubG9hZFBlcmNlbnRhZ2VbaWRlbnRpZmllcl0gPiAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmxvYWRQZXJjZW50YWdlW2lkZW50aWZpZXJdID09PSAxMDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgICRzY29wZS5ibHVycmluZ1NraWxscyA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUuaGlnaGxpZ2h0aW5nQ2F0ZWdvcnlJZCA9IC0xO1xuICAgICAgICAkc2NvcGUuaGlnaGxpZ2h0U2tpbGxzID0gZnVuY3Rpb24oY2F0ZWdvcnlJZCkge1xuXG4gICAgICAgICAgICBpZihjYXRlZ29yeUlkID09PSAtMSkge1xuICAgICAgICAgICAgICAgICRzY29wZS5ibHVycmluZ1NraWxscyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICRzY29wZS5oaWdobGlnaHRpbmdDYXRlZ29yeUlkID0gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuYmx1cnJpbmdTa2lsbHMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICRzY29wZS5oaWdobGlnaHRpbmdDYXRlZ29yeUlkID0gY2F0ZWdvcnlJZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cblxuICAgIH1dKTtcblxuXG4iLCJhcHBNb2R1bGUuc2VydmljZSgnVGFnU2VydmljZScsIFsnJGh0dHAnLCAnJHJvb3RTY29wZScsICckcScsIGZ1bmN0aW9uICgkaHR0cCwgJHJvb3RTY29wZSwgJHEpIHtcbiAgICBcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAvLyB0aGlzLlNIQU9QRU5HX0xJTktJRURJTl9JRCA9ICdxQzcyZm1KR2xCJztcblxuICAgIHRoaXMuY29tcGFueVVybE1hcCA9IHt9O1xuICAgIHRoaXMuY29tcGFueVVybE1hcFs5OTk5XSA9ICB7aWQ6IDk5OTksIGxvZ29Vcmw6IFwiaHR0cHM6Ly9tZWRpYS5saWNkbi5jb20vbXByL21wci9zaHJpbmtfMjAwXzIwMC9BQUVBQVFBQUFBQUFBQU4yQUFBQUpERXlNalV4WkdFM0xXUmhaVFF0TkdSbE1TMDVNbUZtTFRabVpqSmtaalZsWmpFelpBLnBuZ1wiLCBuYW1lOiBcIkJsb29tYmVyZyBMLlAuXCJ9O1xuICAgIHRoaXMuY29tcGFueVVybE1hcFsxMDQzXSA9ICB7aWQ6IDEwNDMsIGxvZ29Vcmw6IFwiaHR0cHM6Ly9tZWRpYS5saWNkbi5jb20vbXByL21wci9wLzMvMDA1LzA3Yi8wMGEvMDVkZWY0Mi5wbmdcIiwgbmFtZTogXCJTaWVtZW5zXCJ9O1xuICAgIHRoaXMuY29tcGFueVVybE1hcFs1MDc3MjBdID0ge2lkOiA1MDc3MjAsIGxvZ29Vcmw6IFwiaHR0cHM6Ly9tZWRpYS5saWNkbi5jb20vbXByL21wci9wLzMvMDAwLzAzMi8xNGMvMGZhZDYzOC5wbmdcIiwgbmFtZTogXCJCZWlqaW5nIEppYW90b25nIFVuaXZlcnNpdHlcIn0gO1xuICAgIHRoaXMuY29tcGFueVVybE1hcFszNDYxXSA9IHtpZDogMzQ2MSwgbG9nb1VybDogXCJodHRwczovL21lZGlhLmxpY2RuLmNvbS9tcHIvbXByL3AvNy8wMDAvMmI1LzFiMy8zN2FlZWZlLnBuZ1wiLCBuYW1lOiBcIlVuaXZlcnNpdHkgb2YgUGl0dHNidXJnaFwifTtcbiAgICBcbiAgICB0aGlzLmdldFRhZ3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHByb21pc2UgPSAkaHR0cC5nZXQoJ2FwaS90YWdzLmpzb24nKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIHRoaXMuZ2V0U3RhdGljQWR2cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJvbWlzZSA9ICRodHRwLmdldCgnYXBpL2FkdnMuanNvbicpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgdGhpcy5sb2FkUHJvZmlsZSA9IGZ1bmN0aW9uKElOUHJvZmlsZSkge1xuICAgICAgICBpZihJTlByb2ZpbGUpIHtcbiAgICAgICAgICAgIHRoYXQucHJvZmlsZSA9IElOUHJvZmlsZTtcbiAgICAgICAgICAgIHRoYXQucG9zaXRpb25zID0gZ3JvdXBQb3NpdGlvbkJ5WWVhcihJTlByb2ZpbGUucG9zaXRpb25zKTsgIFxuXG4gICAgICAgICAgICB0aGF0LnNraWxscyA9IGZsYXR0ZW5Ta2lsbHMoSU5Qcm9maWxlLnNraWxscyk7XG4gICAgICAgICAgICB0aGF0LmVkdWNhdGlvbnMgPSBJTlByb2ZpbGUuZWR1Y2F0aW9ucy52YWx1ZXM7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoYXQucHJvZmlsZSk7XG4gICAgICAgICAgICBnZXRDb21wYW55TG9nb3MoSU5Qcm9maWxlLnBvc2l0aW9ucykudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgdGhhdC5wb3NpdGlvbnMgPSBncm91cFBvc2l0aW9uQnlZZWFyKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhhdC5wb3NpdGlvbnMpO1xuICAgICAgICAgICAgICAgIC8vICRyb290U2NvcGUuJGJyb2FkY2FzdCgnUFJPRklMRV9BTEwnLCBudWxsKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ1BST0ZJTEUnLCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKElOUHJvZmlsZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgJGh0dHAuZ2V0KCdhcGkvc2hhb3BlbmdfbGlua2VkaW5fcHJvZmlsZS5qc29uJykuc3VjY2VzcyhmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICB2YXIgSU5Qcm9maWxlID0gZGF0YTtcbiAgICAgICAgICAgICAgICB0aGF0LnByb2ZpbGUgPSBJTlByb2ZpbGU7XG4gICAgICAgICAgICAgICAgdGhhdC5wb3NpdGlvbnMgPSBncm91cFBvc2l0aW9uQnlZZWFyKElOUHJvZmlsZS5wb3NpdGlvbnMpOyAgXG5cbiAgICAgICAgICAgICAgICB0aGF0LnNraWxscyA9IGZsYXR0ZW5Ta2lsbHMoSU5Qcm9maWxlLnNraWxscyk7XG4gICAgICAgICAgICAgICAgdGhhdC5lZHVjYXRpb25zID0gSU5Qcm9maWxlLmVkdWNhdGlvbnMudmFsdWVzO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoYXQucHJvZmlsZSk7XG4gICAgICAgICAgICAgICAgdGhhdC5wb3NpdGlvbnMgPSBnZXRTdGF0aWNDb21wYW55TG9nb3MoSU5Qcm9maWxlLnBvc2l0aW9ucyk7XG4gICAgICAgICAgICAgICAgdGhhdC5wb3NpdGlvbnMgPSBncm91cFBvc2l0aW9uQnlZZWFyKHRoYXQucG9zaXRpb25zKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGF0LnBvc2l0aW9ucyk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdQUk9GSUxFJywgbnVsbCk7XG5cbiAgICAgICAgICAgICAgICAvLyAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ1BST0ZJTEUnLCBudWxsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZsYXR0ZW5Ta2lsbHMoSU5Ta2lsbHMpIHtcbiAgICAgICAgdmFyIHNraWxscyA9IElOU2tpbGxzICYmIChJTlNraWxscy52YWx1ZXMgfHwgW10pIHx8IFtdO1xuICAgICAgICB2YXIgYSA9IFtdO1xuXG4gICAgICAgIGlmKGFuZ3VsYXIuaXNBcnJheShza2lsbHMpKXtcbiAgICAgICAgICAgIHNraWxscy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGluZGV4LCBhcnJheSkge1xuICAgICAgICAgICAgICAgIGlmKGVsZW1lbnQuc2tpbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgYS5wdXNoKHtuYW1lOiBlbGVtZW50LnNraWxsLm5hbWUsIHZhbHVlOiBNYXRoLnJhbmRvbSgpLCBjYXRlZ29yeUlkOiBlbGVtZW50LmNhdGVnb3J5SWQgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTdGF0aWNDb21wYW55TG9nb3MoSU5Qb3NpdGlvbnMpIHtcbiAgICAgICAgaWYoSU5Qb3NpdGlvbnMudmFsdWVzICYmIGFuZ3VsYXIuaXNBcnJheShJTlBvc2l0aW9ucy52YWx1ZXMpKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IElOUG9zaXRpb25zLnZhbHVlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICBJTlBvc2l0aW9ucy52YWx1ZXNbaV0ubG9nb1VybCA9IHRoYXQuY29tcGFueVVybE1hcFtJTlBvc2l0aW9ucy52YWx1ZXNbaV0uY29tcGFueS5pZF0ubG9nb1VybDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gSU5Qb3NpdGlvbnM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXN5bmNMb2dvVXJsKGlkKSB7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgaWYodGhhdC5jb21wYW55VXJsTWFwW2lkXSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSB0aGF0LmNvbXBhbnlVcmxNYXBbaWRdO1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHRzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdZYXkhIFNhdmVkIG9uZSBBUEkgY2FsbCwgZm91bmQgY29tcGFueSBvYmplY3QgaW4gY2FjaGU6ICcsIHJlc3VsdHMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgSU4uQVBJLlJhdygnL2NvbXBhbmllcy9pZD0nICsgaWQgKyAnOihpZCxuYW1lLGxvZ28tdXJsKScpXG4gICAgICAgICAgICAucmVzdWx0KGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0cy5sb2dvVXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHBvc2l0aW9uLmxvZ29VcmwgPSByZXN1bHRzLmxvZ29Vcmw7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhc3luY0xvZ29VcmwnLCByZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wYW55VXJsTWFwW2lkXSA9IHJlc3VsdHM7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVzdWx0cyk7ICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZXJyb3IoZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICAgICAgICAgIC8vaW4gY2FzZSBvZiBuZXR3b3JrIGVycm9yLCB0aHJvdHRsZSwgZXRjLlxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2FzeW5jTG9nb1VybCBlcnJvcjogJywgYW5ndWxhci50b0pzb24oZXJyb3IsIHRydWUpKVxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgICAgICAgICB9KTsgICAgICAgICAgICBcbiAgICAgICAgfVxuXG5cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Q29tcGFueUxvZ29zKElOUG9zaXRpb25zKSB7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IElOUG9zaXRpb25zLnZhbHVlcyB8fCBbXTtcbiAgICAgICAgdmFyIGIgPSBbXTtcbiAgICAgICAgcG9zaXRpb25zLmZvckVhY2goZnVuY3Rpb24ocG9zaXRpb24sIGluZGV4LCBhcnJheSkge1xuICAgICAgICAgICAgaWYocG9zaXRpb24uY29tcGFueSAmJiBwb3NpdGlvbi5jb21wYW55LmlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIHByb21pc2UgPSBhc3luY0xvZ29VcmwocG9zaXRpb24uY29tcGFueS5pZCk7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1Byb21pc2UgPSBwcm9taXNlLnRoZW4oZnVuY3Rpb24oc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbi5sb2dvVXJsID0gc3VjY2Vzcy5sb2dvVXJsO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYi5wdXNoKG5ld1Byb21pc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkcS5hbGwoYikudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCctLS1hbGwtLS0nLCByZXN1bHQpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJy0tLWFsbC0tLScsIGFuZ3VsYXIudG9Kc29uKHJlc3VsdCwgdHJ1ZSkpO1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBncm91cFBvc2l0aW9uQnlZZWFyKHBvc2l0aW9uc0FycmF5KSB7XG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBbXTtcblxuICAgICAgICBpZihhbmd1bGFyLmlzQXJyYXkocG9zaXRpb25zQXJyYXkpKSB7XG4gICAgICAgICAgICBwb3NpdGlvbnMgPSBwb3NpdGlvbnNBcnJheTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHBvc2l0aW9uc0FycmF5LnZhbHVlcyAmJiBhbmd1bGFyLmlzQXJyYXkocG9zaXRpb25zQXJyYXkudmFsdWVzKSkge1xuICAgICAgICAgICAgcG9zaXRpb25zID0gcG9zaXRpb25zQXJyYXkudmFsdWVzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgYSA9IFtdO1xuXG4gICAgICAgIGlmKHBvc2l0aW9ucy5sZW5ndGggPT09IDAgfHwgKHBvc2l0aW9uc1swXSAmJiAhcG9zaXRpb25zWzBdLnN0YXJ0RGF0ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGFuZ3VsYXIuaXNBcnJheShwb3NpdGlvbnMpKSB7XG5cbiAgICAgICAgICAgIHZhciBldmVuID0gMDtcbiAgICAgICAgICAgIHBvc2l0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHBvc2l0aW9uLCBpbmRleCwgYXJyYXkpIHtcblxuICAgICAgICAgICAgICAgIGlmIChhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvL3B1c2ggdGhpcyB5ZWFyIGZpcnN0XG4gICAgICAgICAgICAgICAgICAgIGlmKCFwb3NpdGlvbi5zdGFydERhdGUgfHwgcG9zaXRpb24uc3RhcnREYXRlLnllYXIgIT09IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYS5wdXNoKHttYXJrOiBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCl9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLnN0YXJ0RGF0ZSA9IHBvc2l0aW9uLnN0YXJ0RGF0ZSB8fCB7eWVhcjogbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpLCBtb250aDogMH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvL29uIHRoZSBmaXJzdCBwb3NpdGlvbiwgcHVzaCBhIHllYXIgbWFyayBmaXJzdFxuXG4gICAgICAgICAgICAgICAgICAgIGEucHVzaCh7bWFyazogcG9zaXRpb24uc3RhcnREYXRlLnllYXJ9KTtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24uZXZlbiA9IGV2ZW47XG4gICAgICAgICAgICAgICAgICAgIGEucHVzaChwb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW4gPSAxIC0gZXZlbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vc2Vjb25kIG9uZSBhbmQgb24sIGNvbXBhcmUgd2l0aCB0aGUgcHJldmlvdXMgb25lLCAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciBsYXN0UG9zaXRpb24gPSBhW2EubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIC8vaWYgaXQgc3RhcnRzIGluIHRoZSBuZXcgeWVhciwgdGhlbiBwdXNoIGEgeWVhciBtYXJrIGZpcnN0XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0UG9zaXRpb24uc3RhcnREYXRlLnllYXIgIT09IHBvc2l0aW9uLnN0YXJ0RGF0ZS55ZWFyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhLnB1c2goe21hcms6IHBvc2l0aW9uLnN0YXJ0RGF0ZS55ZWFyfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy9pZiBpdCBpcyBpbiB0aGUgc2FtZSB5ZWFyLCBqdXN0IHB1c2ggdGhlIHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLmV2ZW4gPSBldmVuO1xuICAgICAgICAgICAgICAgICAgICBhLnB1c2gocG9zaXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZXZlbiA9IDEgLSBldmVuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xufVxucmV0dXJuIGE7XG59XG5cbn1dKTsiLCJcblxuYXBwTW9kdWxlLmRpcmVjdGl2ZSgnbG9hZFByb2dyZXNzSWNvbicsIFtmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIGljb25jbGFzczogJ0AnLCBcbiAgICAgICAgICAgIHByb2dyZXNzOiAnQCcsIFxuICAgICAgICAgICAgcmV2ZXJzZTogJ0AnXG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImdseXBoLXByb2dyZXNzXCIgbmctY2xhc3M9XCJ7XFwncmV2ZXJzZVxcJzogcmV2ZXJzZX1cIj4gXFxcbiAgICAgICAgPGRpdiBjbGFzcz1cIiB2aWV3LXBvcnRcIiBuZy1jbGFzcz1cIntcXCdmZ1xcJzogcmV2ZXJzZSwgXFwnYmdcXCc6ICFyZXZlcnNlfVwiPjxzcGFuIGNsYXNzPVwie3tpY29uY2xhc3N9fVwiPjwvc3Bhbj48L2Rpdj4gICAgXFxcbiAgICAgICAgPGRpdiBjbGFzcz1cIiB2aWV3LXBvcnRcIiBuZy1jbGFzcz1cIntcXCdiZ1xcJzogcmV2ZXJzZSwgXFwnZmdcXCc6ICFyZXZlcnNlfVwiPjxzcGFuIGNsYXNzPVwie3tpY29uY2xhc3N9fVwiPjwvc3Bhbj48L2Rpdj4gICBcXFxuICAgICAgICA8L2Rpdj4nLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICBzY29wZS4kd2F0Y2goJ3Byb2dyZXNzJywgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2xvYWRQcm9ncmVzc0ljb24ucHJvZ3Jlc3MgPSAnLCBuZXdWYWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmKHBhcnNlSW50KG5ld1ZhbHVlKSA9PT0gMTAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2xvYWRlZCcpO1xuICAgICAgICAgICAgICAgICAgICB9LDEwMClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYocGFyc2VJbnQobmV3VmFsdWUpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2xvYWRlZCcpO1xuICAgICAgICAgICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfTtcbn1dKTtcblxuIC8qdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiZ2x5cGgtcHJvZ3Jlc3NcIj4gXFxcbiAgICAgICAgPGRpdiBjbGFzcz1cIiB2aWV3LXBvcnRcIiBuZy1jbGFzcz1cIntcXCdmZ1xcJzogcmV2ZXJzZSwgXFwnYmdcXCc6ICFyZXZlcnNlfVwiPjxzcGFuIGNsYXNzPVwie3tpY29uY2xhc3N9fVwiPjwvc3Bhbj48L2Rpdj4gICAgXFxcbiAgICAgICAgPGRpdiBjbGFzcz1cIiB2aWV3LXBvcnRcIiBuZy1jbGFzcz1cIntcXCdiZ1xcJzogcmV2ZXJzZSwgXFwnZmdcXCc6ICFyZXZlcnNlfVwiIHN0eWxlPVwiaGVpZ2h0OiB7e3JldmVyc2UgJiYgcHJvZ3Jlc3MgfHwgKDEwMCAtIHByb2dyZXNzKX19JVwiPjxzcGFuIGNsYXNzPVwie3tpY29uY2xhc3N9fVwiPjwvc3Bhbj48L2Rpdj4gICBcXFxuICAgICAgICA8L2Rpdj4nLCovXG5cblxuYXBwTW9kdWxlLmZpbHRlcignaW50VG9Nb250aCcsIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHZhciBtYXAgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ107XG4gICAgICAgIGlucHV0ID0gcGFyc2VJbnQoaW5wdXQpO1xuICAgICAgICBpZiAoaW5wdXQgPiAwICYmIGlucHV0IDwgMTMpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXBbaW5wdXQgLSAxXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxufSk7XG5cbmFwcE1vZHVsZS5maWx0ZXIoJ2Zvckhvd0xvbmcnLCBmdW5jdGlvbigpe1xuICAgIHJldHVybiBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICBpZiAocG9zaXRpb24uaXNDdXJyZW50KSB7XG4gICAgICAgICAgICAvLyByZXR1cm4gJ3RpbGwgbm93J1xuICAgICAgICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgICAgIHBvc2l0aW9uLmVuZERhdGUgPSB7XG4gICAgICAgICAgICAgICAgeWVhcjogbm93LmdldEZ1bGxZZWFyKCksXG4gICAgICAgICAgICAgICAgbW9udGg6IG5vdy5nZXRNb250aCgpICsgMVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAocG9zaXRpb24uc3RhcnREYXRlICYmIHBvc2l0aW9uLmVuZERhdGUpIHtcbiAgICAgICAgICAgIHZhciB5ZWFyTG9uZyA9IHBvc2l0aW9uLmVuZERhdGUueWVhciAtIHBvc2l0aW9uLnN0YXJ0RGF0ZS55ZWFyLFxuICAgICAgICAgICAgbW9udGhMb25nID0gcG9zaXRpb24uZW5kRGF0ZS5tb250aCAtIHBvc2l0aW9uLnN0YXJ0RGF0ZS5tb250aDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKG1vbnRoTG9uZyA8IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgdG90YWxMb25nSW5Nb250aCA9IHllYXJMb25nICogMTIgKyBtb250aExvbmc7XG4gICAgICAgICAgICAgICAgeWVhckxvbmcgPSBNYXRoLmZsb29yKHRvdGFsTG9uZ0luTW9udGggLyAxMik7XG4gICAgICAgICAgICAgICAgbW9udGhMb25nID0gMTIgKyBtb250aExvbmc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB5ZWFyVW5pdCA9IHllYXJMb25nID4gMSA/ICd5ZWFycycgOiAneWVhcicsXG4gICAgICAgICAgICBtb250aFVuaXQgPSBtb250aExvbmcgPiAxID8gJ21vbnRocycgOiAnbW9udGgnO1xuXG4gICAgICAgICAgICB2YXIgeWVhclN0cmluZyA9IHllYXJMb25nID4gMCA/IHllYXJMb25nICsgJyAnICsgeWVhclVuaXQgKyAnICcgOiAnJyxcbiAgICAgICAgICAgIG1vbnRoU3RyaW5nID0gbW9udGhMb25nID4gMD8gbW9udGhMb25nICsgJyAnICsgbW9udGhVbml0IDogJyc7XG5cbiAgICAgICAgICAgIHZhciB3aG9sZVN0cmluZyA9IHllYXJTdHJpbmcgKyBtb250aFN0cmluZyArIChwb3NpdGlvbi5pc0N1cnJlbnQgPyAnIHRpbGwgbm93JyA6ICcnKTtcblxuICAgICAgICAgICAgcmV0dXJuIHdob2xlU3RyaW5nO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbn0pO1xuXG5hcHBNb2R1bGUuZGlyZWN0aXZlKCdicmVha0F0TicsIFtmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIGNvbnRlbnQ6ICdAJ1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG5cbiAgICAgICAgICAgIC8vbGlua2VkaW4gQVBJIHdpbGwgcmVtb3ZlIGxpbmUgYnJlYWtzLCBoZXJlIHdlIGFkZCB0aGVtIGJhY2sgaW4gYmVmb3JlIFwiLi4uKG4pXCIgd2hlcmUgbiA+IDFcbiAgICAgICAgICAgIGF0dHJzLiRvYnNlcnZlKCdjb250ZW50JywgZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgICAgICAgIC8vIHZhciBodG1sU3RyaW5nID0gdmFsdWUucmVwbGFjZSgvXFxzK1xcKFxcZCpcXCkvZywgZnVuY3Rpb24odikge1xuICAgICAgICAgICAgICAgIC8vICAgICByZXR1cm4gJyA8YnI+JyArIHY7XG4gICAgICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICB2YXIgaHRtbFN0cmluZyA9IHZhbHVlLnJlcGxhY2UoL1xcbi9nLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcgPGJyPic7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZWxlbWVudC5odG1sKGh0bWxTdHJpbmcpO1xuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQoJzxkaXYgY2xhc3M9XCJtYXNrXCI+PC9kaXY+Jyk7XG4gICAgICAgIH0pOyAgICAgXG5cbiAgICAgICAgfVxuICAgIH07XG59XSk7XG5cbmFwcE1vZHVsZS5kaXJlY3RpdmUoJ2NsaWNrQWRkQ2xhc3MnLCBbZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICB0b2dnbGVjbGFzczogJ0AnXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIGVsZW1lbnQub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnZXhwYW5kZWQnKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9O1xufV0pO1xuXG5hcHBNb2R1bGUuZGlyZWN0aXZlKCd2aXNpYmxlT25NYXJrJywgW2Z1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgbWFyazogJ0AnXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3RyYW5zcGFyZW50LWZpcnN0Jyk7XG4gICAgICAgICAgICBzY29wZS4kd2F0Y2goJ21hcmsnLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZihuZXdWYWx1ZSA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCd2aXNpYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygndmlzaWJsZScpO1xuICAgICAgICAgICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn1dKTtcblxuYXBwTW9kdWxlLmRpcmVjdGl2ZSgndmlzaWJsZU9uVGltZScsIFtmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHRpbWU6ICdAJ1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCd0cmFuc3BhcmVudC1maXJzdCcpO1xuICAgICAgICAgICAgdmFyIHRpbWUgPSBwYXJzZUludChzY29wZS50aW1lIHx8IDQwMCk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygndmlzaWJsZScpO1xuICAgICAgICAgICAgfSwgdGltZSk7XG4gICAgICAgIH1cbiAgICB9O1xufV0pXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
