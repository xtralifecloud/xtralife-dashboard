module.exports = ($scope, $q, $modal, StoreService, ngTableParams, ExportService)->
	$scope.game = game = $scope.$parent.game
	$scope.domain = domain = $scope.$parent.domain

	$scope.selectedProduct = null

	modalForProduct = (templateUrl, controller, product)->
		$modal.open
			templateUrl: templateUrl
			controller: controller
			resolve:
				selectedProduct: ()-> product
				StoreService: ()-> StoreService
				domain: -> domain
				game: -> game
		.result

	$scope.$on 'domainChanged', (event, value)->
		$scope.domain = domain = value
		$scope.productsTable.reload()

	$scope.$on 'gameChanged', (event, value)->
		$scope.game = game = value
		$scope.productsTable.reload()

	$scope.onFilterChanged = (value)->
		$scope.productsTable.reload()

	$scope.changeSelection = (product)->
		$scope.selectedProduct?.$selected=false
		product.$selected = true
		$scope.selectedProduct = product

	$scope.addProduct = ()->
		modalForProduct('store.addEditProduct.html', require './store.addEditProduct.coffee', null)
		.then ()->
			$scope.productsTable.reload()

	$scope.deleteProduct = (product)->
		StoreService.deleteProduct(game.name, $scope.selectedProduct.productId)
		.then ()->
			alert "Product deleted"
			$scope.productsTable.reload()
		.catch (err)->
			alert("Couldn't delete the selected product")
			console.error err

	$scope.editProduct = ()->
		modalForProduct('store.addEditProduct.html', require('./store.addEditProduct.coffee'), $scope.selectedProduct)
		.then ()->
			$scope.productsTable.reload()

	$scope.importProducts = (files)->
		if files?.length is 1
			unless ExportService.checkFileName files[0].name, "inapp", game.name then return

			ExportService.readFileAsJson files[0], (jsonContents)->

				StoreService.setProducts(game.name, jsonContents.list)
				.success ()->
					alert 'Products imported'
					$scope.productsTable.reload()
				.catch (err)->
					alert('Error while saving data. See console for more details.')


	$scope.productsTable = new ngTableParams(
		page: 1 # show first page
		count: 10
	,
		getData: ($defer, params) ->
			skip = ()-> (params.page() - 1) * params.count()
			limit = ()-> params.count()

			listProducts = ()->
				StoreService.listProducts(game.name, skip(), limit())

			$scope.selectedProduct = null
			listProducts().success (products)-> # data is {list: [], total: int}
				params.total(products.total)
				$defer.resolve products.list
			.catch (err)->
				alert("Can't load product list. See Console for more details")
				console.error err
	)
