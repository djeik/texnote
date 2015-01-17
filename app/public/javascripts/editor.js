var texnote = angular.module('texnote',[]);

texnote.controller('EditorController',['$scope', '$http', function($scope, $http) {
    $scope.documents = []
    $http.get("/api/list/testuser")
        .success(function(resp) {
            if(resp.status === "ok") {
                console.log("got files");
                $scope.documents = resp.files
            }
        });

    $scope.focus = null;
    $scope.user = "testuser";
    $scope.hideNotifications = true;
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
    $scope.compile = function() {
        $http.post("/api/compile", {
            username: $scope.user,
            documentName: $scope.focus
        }).success(function(result){
            console.log(result.stderr);
            console.log(result.stdout);
            console.log(result.error );
        })
    };

    $scope.changeDoc = function(doc) {
        $http.get(["/api/read", $scope.user,doc].join('/'))
            .success(function(result) {
                $scope.editor.setValue(result.contents),
                $scope.focus = doc
            })
    };

    $scope.addNewFile = function() {
        $http.post("/api/write", { username: $scope.user, documentName: $scope.newFileName })
            .success(function(resp) {
                if(resp.status === "ok") {
                    $scope.documents.push(resp.documentName);
                    $scope.newFileName = "";
                }
            });
    };

    }]);
