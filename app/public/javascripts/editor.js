var texnote = angular.module('texnote',[]);

texnote.controller('EditorController',['$scope', '$http', function($scope, $http) {
    $scope.documents = ["testdata","moretestdata"];
    $scope.focus = null;
    $scope.user = "testuser";
    $scope.editor = ace.edit("editor");
    $scope.editor.setTheme("ace/theme/monokai");
    $scope.editor.getSession().setMode("ace/mode/latex");

    $scope.save = function() {
        $http.post("/api/write", {
            documentName: $scope.focus,
            username: $scope.user,
            contents: $scope.editor.getValue()
        });
    };
    $scope.changeDoc = function(doc) {
        $http.get(["api/read", $scope.user, doc].join('/'))
            .success(function(result) {
                $scope.editor.setValue(result.contents);
                $scope.focus = doc;
            })
        };
    }]);
