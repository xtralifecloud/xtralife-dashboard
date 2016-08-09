###
    This controller runs a modal, with template user.html / editUser.html
###

EditKVStoreCtrl = ($rootScope, $scope, $q, $routeParams, UserService, notificationService)->
	game = $scope.$parent.game
	domain = $scope.$parent.domain
	$scope.userId = $routeParams.userId
	$scope.kvstore = []
	$scope.selectedKey = []
	$scope.kvstoreGrid =
		data: 'kvstore'

		enableCellSelection: true
		enableRowSelection: true
		enableCellEditOnFocus: true

		selectedItems: $scope.selectedKey
		multiSelect: false

		columnDefs: [
			field: 'key'
			displayName: 'Key'
			enableCellEdit: false
		,
			field: 'value'
			displayName: 'Value'
			enableCellEdit: false
		,
			field: 'acl'
			displayName: 'ACL'
			enableCellEdit: false
		]

	UserService.getUserKVStore(game.name, $scope.userId, domain)
	.success (res)->
		console.log res
		unless res? then res = {}
		$scope.kvstore = res
	.catch (err)->
		alert('Error while loading kv data. See console for more details.')
		console.log err

	$scope.addNewKey = (key)->
		exists = each for each in $scope.kvstore when each.key == key
		if exists?
			alert("Duplicate key : '#{key}'")
		else if key.indexOf(".")!=-1
			alert("Forbidden character : . ")		
		else
			$scope.kvstore.push {key: key, value: "{}", acl: "{}"}

	$scope.deleteKey = (kv)->
		$scope.kvstoreGrid.selectAll(false) # deselect all rows
		$scope.kvstore = $scope.kvstore.filter (each)->
			each.key != kv.key

	$scope.ok = ()-> # send all the key-value pairs for update
		UserService.updateKVStore(game.name, $scope.userId, domain, $scope.kvstore)
		.success ()->
			notificationService.success 'kvstore saved!'
		.catch (err)->
			alert('Error while saving data. See console for more details.')
			console.log err

module.exports = EditKVStoreCtrl