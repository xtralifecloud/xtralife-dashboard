/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
    This controller runs a modal, with template user.html / editUser.html
*/

const EditGameStorageCtrl = function($rootScope, $scope, $modalInstance, $modal, game, domain, storage, GameService, notificationService) {
	$scope.storage = storage;
	$scope.selectedKey = [];

	$scope.files = null;
	const modalInstance = null;

	$scope.uploadFile = function(files, rowIndex) {
		const key = $scope.storage[rowIndex].fskey;
		if (files != null ? files.length : undefined) {
			const file = files[0];
			return GameService.getSignedUrl(game.name, domain, key)
			.success(url => $modal.open({
                templateUrl: 'progress.html',
                controller($scope, $modalInstance, file, url){
                    $scope.loaded = 0;
                    const reader = new FileReader();
                    reader.onload = function(){
                        const arrayBuffer = reader.result;
                        const oReq = new XMLHttpRequest();
                        oReq.open("PUT", url.signedURL, true);
                        oReq.upload.onprogress = function(e){
                            if (e.lengthComputable) {
                                const loaded = parseInt((e.loaded*100)/e.total);
                                return $scope.$apply(() => $scope.loaded = loaded);
                            }
                        };
                                //console.log loaded
                        oReq.onloadend = function(){
                            $scope.loaded = 100;
                            console.log(`${key} uploaded`);
                            return $modalInstance.close(url.getURL);
                        };
                        oReq.onloadstart = function(){
                            $scope.loaded = 1;
                            return console.log(`start upload for ${key}`);							
                        };
                        oReq.onerror = function(err){
                            console.log("err");
                            return notificationService.error(`upload error : ${JSON.stringify(err)}`);
                        };
                        return oReq.send(arrayBuffer);
                    };
                    return reader.readAsArrayBuffer(file);
                },
                resolve: {
                    file(){
                        return file;
                    },
                    url(){
                        return url;
                    }
                },
                backdrop : false}).result.then(function(getURL){
                console.log(getURL);
                return $scope.storage[rowIndex].fsvalue = getURL;
            }));
		}
	};



	$scope.kvGrid = {
		data: 'storage',

		enableCellSelection: true,
		enableRowSelection: true,
		enableCellEditOnFocus: true,

		selectedItems: $scope.selectedKey,
		multiSelect: false,

		columnDefs: [{
			field: 'fskey',
			displayName: 'Key',
			enableCellEdit: false,
			cellTemplate: '<div><div class="ngCellText"><button class="fa fa-cloud-upload" ng-file-select ng-file-change="uploadFile($files,row.rowIndex)"></button>     {{row.getProperty("fskey")}}</div></div>'
		}
		, {
			field: 'fsvalue',
			displayName: 'Value',
			enableCellEdit: true,
			cellTemplate : '<div class="ngCellText">{{row.getProperty(col.field)}}</div>'
		}
		]
	};



	$scope.addNewKey = function(key){
		let exists;
		for (let each of Array.from($scope.storage)) { if (each.fskey === key) { exists = each; } }
		if (exists != null) {
			return alert(`Duplicate key : '${key}'`);
		} else if (key.indexOf(".")!==-1) {
			return alert("Forbidden character : . ");		
		} else {
			return $scope.storage.push({fskey: key, fsvalue: "default value, update me"});
		}
	};

	$scope.deleteKey = function(kv){
		$scope.kvGrid.selectAll(false); // deselect all rows
		return $scope.storage = $scope.storage.filter(each => each.fskey !== kv.fskey);
	};

	$scope.ok = () => // send all the key-value pairs for update
    GameService.updateGameStorage(game.name, domain, $scope.storage).success(() => $modalInstance.close($scope.storage)).catch(function(err){
        alert('Error while saving data. See console for more details.');
        return console.log(err);
    });

	return $scope.cancel = () => $modalInstance.dismiss('cancel');
};

module.exports = EditGameStorageCtrl;