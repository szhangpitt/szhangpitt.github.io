function loadData() {
    angular.element(document.getElementById("appBody")).scope().$apply(
        function($scope) {
            $scope.getLinkedInData();
        });
}