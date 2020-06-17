/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
    This controller runs a modal, with template user.html / editProfile.html
*/
const SendMessageCtrl = function($rootScope, $scope, $modalInstance, $q, selectedUsers, UserService, game, domain){
	$scope.domain = domain;

	$scope.users = selectedUsers;
	$scope.header = (() => { switch (false) {
			case !(selectedUsers.length < 3): return (Array.from(selectedUsers).map((each, index) => each.pseudo)).join(', ');
			default: return `${selectedUsers.length} users`;
	} })();

	$scope.message = {value: ''};

	$scope.ok = function(){
		let err, messageObj, messageOsn;
		try {
			messageObj = JSON.parse($scope.message.value);
		} catch (error) {
			err = error;
			alert('Invalid JSON Message');
			return;
		}

		try {
			messageOsn = $scope.message.osn ? JSON.parse($scope.message.osn) : undefined;
		} catch (error1) {
			err = error1;
			alert('Invalid JSON OS Notification');
			return;
		}


		const sendOne = function(rcpt){
			const mess = { 
				type : "backoffice",
				event : messageObj
			};
			if (messageOsn) {
				mess.osn = messageOsn;
			}

			return UserService.sendMessage(game.name, rcpt, mess, domain);
		};

		return $q.all((Array.from($scope.users).map((user) => sendOne(user))))
		.then(() => $modalInstance.close()
		, function(err){
			alert('Error while sending message. See console for more details.');
			return console.error(err);
		});
	};


	return $scope.cancel = () => $modalInstance.dismiss('cancel');
};

module.exports = SendMessageCtrl;