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

    $scope.pdfUrl = "";
	$scope.saveDelay = 3000; // Idle time in ms before auto-save
    $scope.focus = null;
    $scope.user = "testuser";
    $scope.hideNotifications = true;
	$scope.timerID = 0; // ID of the timer, so we can cancel the previous one
    $scope.editor = ace.edit("editor");
    $scope.editor.setTheme("ace/theme/monokai");
    $scope.editor.getSession().setMode("ace/mode/latex");
	$scope.editor.on("change", function() { // Handle change and update
		clearTimeout($scope.timerID);
		console.log("timer started...");
		$scope.timerID = setTimeout(function(){
			console.log("timer HIT!");
			$scope.all();
		}, $scope.saveDelay);
	});

    $scope.socket = io();
    $scope.socket.emit("auth", "testuser");

    $scope.socket.on('image upload', function(url) {
        console.log('got urls', url.filenames.join(' and '));
        for(var i = 0; i < url.filenames.length; i++) {
            $scope.editor.insert("\\includegraphics[width=\\textwidth]{" + url.filenames[i] + "}\n");
        }
    });

    $scope.socket.on("greeting", function(obj) {
        alert(obj.message);
    });

	$scope.changeWordwrap = function() {
		console.log($scope.wordwrap);
		$scope.editor.getSession().setUseWrapMode($scope.wordwrap);
	}

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

	$scope.all = function() {
        console.log("called");
		$http.post("/api/all", {
            username: $scope.user,
            documentName: $scope.focus,
            contents: $scope.editor.getValue()
        }).success(function(result){
            console.log(result.stderr);
            console.log(result.stdout);
            console.log(result.error );
            $scope.pdfUrl = "";
            $scope.pdfUrl = [
                $scope.user,
                "temp",
                [
                    $scope.focus.substring(0, $scope.focus.length - 4),
                    ".pdf"
                ].join("")
            ].join('/');

            $('#pdfID').attr('data',$scope.pdfUrl);

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
                else {
                    console.log(JSON.stringify(resp));
                }
            });
    };

    }]);

$(function() {
	$("#editor-container").jqxSplitter({ width: "100%", height: "100%", panels: [
		{collapsible: true, size: 200}, {collapsible: false}]});
	$("#editor-preview").jqxSplitter({ width: "100%", height: "100%", panels: [
		{collapsible: true, size: "50%"}, {collapsible: false, size: "50%"}]});
});
