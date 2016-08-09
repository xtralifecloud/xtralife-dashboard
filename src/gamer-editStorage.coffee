###
    This controller runs a modal, with template user.html / editUser.html
###
EditUserStorageCtrl = ($rootScope, $scope, $q, $routeParams, UserService, notificationService)->
	game = $scope.$parent.game
	domain = $scope.$parent.domain
	$scope.domain = domain
	$scope.userId = $routeParams.userId
	$scope.storage = []
	$scope.selectedKey = []
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
		,
			field: 'fsvalue'
			displayName: 'Value'
			enableCellEdit: true
		]

	UserService.getUserStorage(game.name, $scope.userId, domain).success (storage)->
		$scope.storage = if storage? then storage else []
	.catch (err)->
		unless err.status is 400 and err.data.code="KeyNotFound"
			alert('Cannot load data for user. Try reloading page.')
			console.log err
			$scope.storage = []

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
		UserService.updateUserStorage(game.name, $scope.userId, $scope.storage, domain).success ()->
			notificationService.success 'key/value saved!'
		.catch (err)->
			notificationService.error('Error while saving data. See console for more details.')
			console.log err

	$scope.cancel = ()->

module.exports = EditUserStorageCtrl