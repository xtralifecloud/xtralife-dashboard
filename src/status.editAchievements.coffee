###
    This controller runs a modal, with template user.html / editUser.html
###
EditAchievementsCtrl = ($rootScope, $scope, $modalInstance, game, domain, achievements, GameService) ->
	$scope.achievements = achievements
	$scope.selected = []
	$scope.achGrid =
		data: 'achievements'

		enableCellSelection: true
		enableRowSelection: true
		enableCellEditOnFocus: true

		selectedItems: $scope.selected
		multiSelect: false

		columnDefs: [
			field: 'name'
			displayName: 'Name'
			enableCellEdit: false
		,
			field: 'config.unit'
			displayName: 'Unit'
			enableCellEdit: true
		,
			field: 'config.maxValue'
			displayName: 'Trigger value'
			enableCellEdit: true
		]

	$scope.addNew = (name)->
		existsAlready = each for each in $scope.achievements when each.name is name
		if existsAlready?
			alert("Duplicate achievement name : '#{name}'")
		else
			$scope.achievements.push {name: name, type: "limit", config: {unit: "default", maxValue: 0}}

	$scope.delete = (ach)->
		$scope.achGrid.selectAll(false) # deselect all rows
		$scope.achievements = $scope.achievements.filter (each)->
			each.name isnt ach.name

	$scope.ok = ()-> # send all the key-value pairs for update
		GameService.saveAchievements(game.name, domain, $scope.achievements)
		.success ()->
			$modalInstance.close($scope.achievements)
		.catch (err)->
			alert('Error while saving data. See console for more details.')
			console.log err

	$scope.cancel = ()->
		$modalInstance.dismiss('cancel')

module.exports = EditAchievementsCtrl