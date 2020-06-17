/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
    This controller runs a modal, with template user.html / editProfile.html
*/
const EditUserProfileCtrl = function($rootScope, $scope, $q, $routeParams, UserService, notificationService){

	const {
        game
    } = $scope.$parent;
	const {
        domain
    } = $scope.$parent;
	$scope.userId = $routeParams.userId;

	UserService.getUserProfile(game.name, $scope.userId).success(profile => $scope.profile = profile).catch(function(err){
		alert('Cannot load profile for user. Try reloading page.');
		console.log(err);
		return $scope.profile = {};});

	const cleanupProfile = function(profile){
		for (let key of ["displayName", "lang", "firstName", "lastName", "addr1", "addr2", "addr3", "avatar"]) { if (profile[key] === '') { delete profile[key]; } }
		return profile;
	};

	$scope.ok = () => // send all the key-value pairs for update
    UserService.updateUserProfile(game.name, $scope.userId, cleanupProfile($scope.profile)).success(() => notificationService.success('profile saved!')).catch(function(err){
        alert('Error while saving profile. See console for more details.');
        return console.error(err);
    });

	return $scope.cancel = function(){};
};

module.exports = EditUserProfileCtrl;