###
    This controller runs a modal, with template user.html / editUser.html
###

EditGameStorageCtrl = ($rootScope, $scope, $modalInstance, $modal, game, domain, storage, GameService, notificationService) ->
	$scope.storage = storage
	$scope.selectedKey = []

	$scope.files = null
	modalInstance = null

	$scope.uploadFile = (files, rowIndex) ->
		key = $scope.storage[rowIndex].fskey
		if files?.length
			file = files[0]
			GameService.getSignedUrl(game.name, domain, key)
			.success (url)-> 
				$modal.open
					templateUrl: 'progress.html'
					controller: ($scope, $modalInstance, file, url)->
						$scope.loaded = 0
						reader = new FileReader();
						reader.onload = ()->
							arrayBuffer = reader.result;
							oReq = new XMLHttpRequest()
							oReq.open "PUT", url.signedURL, true
							oReq.upload.onprogress = (e)->
								if e.lengthComputable
									loaded = parseInt(e.loaded*100/e.total)
									$scope.$apply ()-> $scope.loaded = loaded
									#console.log loaded
							oReq.onloadend = ()->
								$scope.loaded = 100
								console.log "#{key} uploaded"
								$modalInstance.close(url.getURL);
							oReq.onloadstart = ()->
								$scope.loaded = 1
								console.log "start upload for #{key}"							
							oReq.onerror = (err)->
								console.log "err"
								notificationService.error "upload error : #{JSON.stringify(err)}"
							oReq.send(arrayBuffer)
						reader.readAsArrayBuffer file
					resolve:
						file: ()->
							file
						url: ()->
							url
					backdrop : false
				.result.then (getURL)->
					console.log getURL
					$scope.storage[rowIndex].fsvalue = getURL



	$scope.kvGrid =
		data: 'storage'

		enableCellSelection: true
		enableRowSelection: true
		enableCellEditOnFocus: true

		selectedItems: $scope.selectedKey
		multiSelect: false

		columnDefs: [
			field: 'fskey'
			displayName: 'Key'
			enableCellEdit: false
			cellTemplate: '<div><div class="ngCellText"><button class="fa fa-cloud-upload" ng-file-select ng-file-change="uploadFile($files,row.rowIndex)"></button>     {{row.getProperty("fskey")}}</div></div>'
		,
			field: 'fsvalue'
			displayName: 'Value'
			enableCellEdit: true
			cellTemplate : '<div class="ngCellText">{{row.getProperty(col.field)}}</div>'
		]



	$scope.addNewKey = (key)->
		exists = each for each in $scope.storage when each.fskey == key
		if exists?
			alert("Duplicate key : '#{key}'")
		else if key.indexOf(".")!=-1
			alert("Forbidden character : . ")		
		else
			$scope.storage.push {fskey: key, fsvalue: "default value, update me"}

	$scope.deleteKey = (kv)->
		$scope.kvGrid.selectAll(false) # deselect all rows
		$scope.storage = $scope.storage.filter (each)->
			each.fskey != kv.fskey

	$scope.ok = ()-> # send all the key-value pairs for update
		GameService.updateGameStorage(game.name, domain, $scope.storage).success ()->
			$modalInstance.close($scope.storage)
		.catch (err)->
			alert('Error while saving data. See console for more details.')
			console.log err

	$scope.cancel = ()->
		$modalInstance.dismiss('cancel')

module.exports = EditGameStorageCtrl