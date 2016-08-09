###
    This controller runs a modal
###
showMatchEventCtrl = ($rootScope, $scope, $modalInstance, event)->
	$scope.eventDescription = JSON.stringify(event, null, 4)

	$scope.close = ()->
		$modalInstance.close()

module.exports = showMatchEventCtrl