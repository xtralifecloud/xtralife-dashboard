/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
    This controller runs a modal, with template editTransactions.html / editUser.html
*/
const EditTransactionsCtrl = function($rootScope, $scope, $q, $routeParams, UserService, notificationService){
	const {
        game
    } = $scope.$parent;
	const {
        domain
    } = $scope.$parent;
	$scope.userId = $routeParams.userId;
	$scope.domain = domain;
	$scope.balance = [];
	$scope.newTx =
		{text: ''}; // see https://github.com/angular-ui/bootstrap/issues/2086
	$scope.balanceGrid = {
		data: 'balance',

		multiSelect: false,

		columnDefs: [{
			field: 'ccy',
			displayName: 'Currency',
			enableCellEdit: false
		}
		, {
			field: 'amount',
			displayName: 'Amount',
			enableCellEdit: false
		}
		]
	};

	const setBalance = function(balance){
		$scope.balance = ((() => {
			const result = [];
			for (let key in balance) {
				const value = balance[key];
				result.push({ccy: key, amount: value});
			}
			return result;
		})());
		return $scope.balance.sort((a, b) => a.ccy > b.ccy);
	};

	UserService.balance(game.name, $scope.userId, domain).success(balance => setBalance(balance)).catch(function(err){
		console.error(err);
		return alert("Cannot load balance for user. Try reloading page.");
	});

	return $scope.newTransaction = function(){
		const parseTx = function(tx){
			const reg = /[ ]*([^: ]+) *: *([+-]* *[0-9\.]+)[ ]*/g;
			if (tx.match(reg)) {
				const filtered = tx.split(reg).filter(each => each !== '');
				const obj = {};
				for (let i = 0; i < filtered.length; i += 2) { const ccy = filtered[i]; obj[ccy] = parseFloat(filtered[i + 1]); }
				return obj;
			} else { return null; }
		};

		const description = "Dashboard transaction";
		return UserService.newTransaction(game.name, $scope.userId, parseTx($scope.newTx.text), description, domain).success(function(balance){
			setBalance(balance);
			$scope.newTx.text = '';
			return notificationService.success("transaction complete!");}).catch(function(err){
			if (err.error = 49) {
				return notificationService.error("Insufficient Balance");
			} else {
				notificationService.error("Transaction was NOT completed. Please check console.log");
				return console.error(err);
			}
		});
	};
};


module.exports = EditTransactionsCtrl;