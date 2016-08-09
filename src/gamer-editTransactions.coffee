###
    This controller runs a modal, with template editTransactions.html / editUser.html
###
EditTransactionsCtrl = ($rootScope, $scope, $q, $routeParams, UserService, notificationService)->
	game = $scope.$parent.game
	domain = $scope.$parent.domain
	$scope.userId = $routeParams.userId
	$scope.domain = domain
	$scope.balance = []
	$scope.newTx =
		text: '' # see https://github.com/angular-ui/bootstrap/issues/2086
	$scope.balanceGrid =
		data: 'balance'

		multiSelect: false

		columnDefs: [
			field: 'ccy'
			displayName: 'Currency'
			enableCellEdit: false
		,
			field: 'amount'
			displayName: 'Amount'
			enableCellEdit: false
		]

	setBalance = (balance)->
		$scope.balance = ({ccy: key, amount: value} for key, value of balance)
		$scope.balance.sort (a, b)->
			a.ccy > b.ccy

	UserService.balance(game.name, $scope.userId, domain).success (balance)->
		setBalance(balance)
	.catch (err)->
		console.error err
		alert("Cannot load balance for user. Try reloading page.")

	$scope.newTransaction = ()->
		parseTx = (tx)->
			reg = /[ ]*([^: ]+) *: *([+-]* *[0-9\.]+)[ ]*/g
			if tx.match(reg)
				filtered = tx.split(reg).filter (each)->
					each != ''
				obj = {}
				(obj[ccy] = parseFloat filtered[i + 1] for ccy, i in filtered by 2)
				obj
			else null

		description = "Dashboard transaction"
		UserService.newTransaction(game.name, $scope.userId, parseTx($scope.newTx.text), description, domain).success (balance)->
			setBalance(balance)
			$scope.newTx.text = ''
			notificationService.success("transaction complete!")
		.catch (err)->
			if err.error = 49
				notificationService.error("Insufficient Balance")
			else
				notificationService.error("Transaction was NOT completed. Please check console.log")
				console.error err


module.exports = EditTransactionsCtrl