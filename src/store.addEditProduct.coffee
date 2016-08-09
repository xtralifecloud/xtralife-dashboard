_ = require 'underscore'

# TODO Florian/Chris -- Move somewhere appropriate?
parseTx = (tx)->
	reg = /[ ]*([^:, ]+) *: *([+-]* *[0-9\.]+)[ ]*/g
	if tx.match(reg)
		filtered = tx.split(reg).filter (each)->
			each isnt '' and each isnt ','
		obj = {}
		(obj[ccy] = parseFloat filtered[i + 1] for ccy, i in filtered by 2)
		obj
	else null

printTx = (tx)->
	args = (prop + ": " + value for prop, value of tx)
	return args.join(", ")

###
    This controller runs a modal, with template store.html
###
AddEditStoreProductCtrl = ($rootScope, $scope, $modalInstance, $q, selectedProduct, StoreService, game)->
	$scope.game = game
	if selectedProduct?
		$scope.addMode = false
		$scope.product = _.clone(selectedProduct)
	else
		$scope.addMode = true
		$scope.product = {reward: {domain: "private"}}

	$scope.rewardTx = printTx($scope.product.reward.tx) if $scope.product.reward?

	$scope.ok = (form)-> # send all the key-value pairs for update
		operation =
			if $scope.addMode
				StoreService.addProduct(game.name, $scope.product)
			else
				StoreService.updateProduct(game.name, $scope.product)

		$scope.product.reward.tx = parseTx($scope.rewardTx) if $scope.rewardTx?

		operation.success ()->
			$modalInstance.close($scope.product)
		.catch (err)->
			alert "Error while saving product: #{err.data.message}. See console for more details."
			console.error err

	$scope.cancel = ()->
		$modalInstance.dismiss('cancel')

module.exports = AddEditStoreProductCtrl