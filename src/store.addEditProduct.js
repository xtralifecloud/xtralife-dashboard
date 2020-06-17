/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('underscore');

// TODO Florian/Chris -- Move somewhere appropriate?
const parseTx = function(tx){
	const reg = /[ ]*([^:, ]+) *: *([+-]* *[0-9\.]+)[ ]*/g;
	if (tx.match(reg)) {
		const filtered = tx.split(reg).filter(each => (each !== '') && (each !== ','));
		const obj = {};
		for (let i = 0; i < filtered.length; i += 2) { const ccy = filtered[i]; obj[ccy] = parseFloat(filtered[i + 1]); }
		return obj;
	} else { return null; }
};

const printTx = function(tx){
	const args = ((() => {
		const result = [];
		for (let prop in tx) {
			const value = tx[prop];
			result.push(prop + ": " + value);
		}
		return result;
	})());
	return args.join(", ");
};

/*
    This controller runs a modal, with template store.html
*/
const AddEditStoreProductCtrl = function($rootScope, $scope, $modalInstance, $q, selectedProduct, StoreService, game){
	$scope.game = game;
	if (selectedProduct != null) {
		$scope.addMode = false;
		$scope.product = _.clone(selectedProduct);
	} else {
		$scope.addMode = true;
		$scope.product = {reward: {domain: "private"}};
	}

	if ($scope.product.reward != null) { $scope.rewardTx = printTx($scope.product.reward.tx); }

	$scope.ok = function(form){ // send all the key-value pairs for update
		const operation =
			$scope.addMode ?
				StoreService.addProduct(game.name, $scope.product)
			:
				StoreService.updateProduct(game.name, $scope.product);

		if ($scope.rewardTx != null) { $scope.product.reward.tx = parseTx($scope.rewardTx); }

		return operation.success(() => $modalInstance.close($scope.product)).catch(function(err){
			alert(`Error while saving product: ${err.data.message}. See console for more details.`);
			return console.error(err);
		});
	};

	return $scope.cancel = () => $modalInstance.dismiss('cancel');
};

module.exports = AddEditStoreProductCtrl;