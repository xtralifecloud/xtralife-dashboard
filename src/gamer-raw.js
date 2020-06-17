/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function($rootScope, $scope, $q, $routeParams, UserService, notificationService){

	const {
        game
    } = $scope.$parent;
	const {
        domain
    } = $scope.$parent;
	$scope.userId = $routeParams.userId;

	$scope.editorOptions = {
		lineWrapping : true,
		mode: { name: "javascript", json: true},
		readOnly : true
	};

	$scope.source = '';

	return UserService.getUserOutline(game.name, $scope.userId).success(function(outline){
		console.log(outline);
		delete outline.profile;
		delete outline.domains;
		delete outline.servertime;
		return $scope.source = JSON.stringify(outline, '', 2);}).catch(function(err){
		notificationService.error('Cannot load data for user. Try reloading page.');
		console.log(err);
		return $scope.source = '';
	});
};

