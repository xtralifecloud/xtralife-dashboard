###
    This controller runs a modal, with template user.html / editUser.html
###
EditUserPropertiesCtrl = ($rootScope, $scope, $q, $routeParams, UserService, notificationService)->
	game = $scope.$parent.game
	domain = $scope.$parent.domain
	$scope.userId = $routeParams.userId
	$scope.properties = []
	$scope.selectedKey = []
	$scope.propertiesGrid =
		data: 'properties'

		enableCellSelection: true
		enableRowSelection: true
		enableCellEditOnFocus: true

		selectedItems: $scope.selectedKey
		multiSelect: false

		columnDefs: [
			field: 'key'
			displayName: 'Property'
			enableCellEdit: false
		,
			field: 'value'
			displayName: 'Value'
			enableCellEdit: true
		]

	PropertiesHash = (properties)->
		obj = {}
		(obj[each.key]=each.value for each in properties)
		obj

	UserService.getUserProperties(game.name, domain, $scope.userId)
	.success (res)->
		unless res? then res = {}
		$scope.properties = ({key: key, value: value} for key, value of res)
	.catch (err)->
		alert('Error while loading properties data. See console for more details.')
		console.log err

	$scope.addNewKey = (key)->
		exists = each for each in $scope.properties when each.key == key
		if exists?
			alert("Duplicate key : '#{key}'")
		else if key.indexOf(".")!=-1
			alert("Forbidden character : . ")		
		else
			$scope.properties.push {key: key, value: "default value, update me"}

	$scope.deleteKey = (kv)->
		$scope.propertiesGrid.selectAll(false) # deselect all rows
		$scope.properties = $scope.properties.filter (each)->
			each.key != kv.key

	$scope.ok = ()-> # send all the key-value pairs for update
		UserService.updateUserProperties(game.name, domain, $scope.userId, PropertiesHash($scope.properties)).success ()->
			notificationService.success 'properties saved!'
		.catch (err)->
			alert('Error while saving data. See console for more details.')
			console.log err

module.exports = EditUserPropertiesCtrl