###
    This controller runs a modal, with template user.html / editProfile.html
###
SendMessageCtrl = ($rootScope, $scope, $modalInstance, $q, selectedUsers, UserService, game, domain)->
	$scope.domain = domain

	$scope.users = selectedUsers
	$scope.header = switch
			when selectedUsers.length < 3 then (each.pseudo for each, index in selectedUsers).join(', ')
			else "#{selectedUsers.length} users"

	$scope.message = {value: ''}

	$scope.ok = ()->
		try
			messageObj = JSON.parse $scope.message.value
		catch err
			alert('Invalid JSON Message')
			return

		try
			messageOsn = if $scope.message.osn then JSON.parse $scope.message.osn else undefined
		catch err
			alert('Invalid JSON OS Notification')
			return


		sendOne = (rcpt)->
			mess = 
				type : "backoffice"
				event : messageObj
			if messageOsn
				mess.osn = messageOsn

			UserService.sendMessage(game.name, rcpt, mess, domain)

		$q.all((sendOne(user) for user in $scope.users))
		.then ()->
			$modalInstance.close()
		, (err)->
			alert('Error while sending message. See console for more details.')
			console.error err


	$scope.cancel = ()->
		$modalInstance.dismiss('cancel')

module.exports = SendMessageCtrl