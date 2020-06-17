/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
    This controller runs a modal
*/
const showMatchEventCtrl = function($rootScope, $scope, $modalInstance, event){
	$scope.eventDescription = JSON.stringify(event, null, 4);

	return $scope.close = () => $modalInstance.close();
};

module.exports = showMatchEventCtrl;