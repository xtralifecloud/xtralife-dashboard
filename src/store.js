/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function($scope, $q, $modal, StoreService, ngTableParams, ExportService){
	let domain, game;
	$scope.game = (game = $scope.$parent.game);
	$scope.domain = (domain = $scope.$parent.domain);

	$scope.selectedProduct = null;

	const modalForProduct = (templateUrl, controller, product) => $modal.open({
        templateUrl,
        controller,
        resolve: {
            selectedProduct(){ return product; },
            StoreService(){ return StoreService; },
            domain() { return domain; },
            game() { return game; }
        }}).result;

	$scope.$on('domainChanged', function(event, value){
		if(value.fromGameChange) {
			$scope.domain = (domain = value.domain);
		}else{
			$scope.domain = (domain = value.domain);
			$scope.productsTable.reload();
		}
		return;
	});

	$scope.$on('gameChanged', function(event, value){
		$scope.game = (game = value);
		return $scope.productsTable.reload();
	});

	$scope.onFilterChanged = value => $scope.productsTable.reload();

	$scope.changeSelection = function(product){
		if ($scope.selectedProduct != null) {
			$scope.selectedProduct.$selected=false;
		}
		product.$selected = true;
		return $scope.selectedProduct = product;
	};

	$scope.addProduct = () => modalForProduct('store.addEditProduct.html', require('./store.addEditProduct.js', null))
    .then(() => $scope.productsTable.reload());

	$scope.deleteProduct = product => StoreService.deleteProduct(game.name, $scope.selectedProduct.productId)
    .then(function(){
        alert("Product deleted");
        return $scope.productsTable.reload();}).catch(function(err){
        alert("Couldn't delete the selected product");
        return console.error(err);
    });

	$scope.editProduct = () => modalForProduct('store.addEditProduct.html', require('./store.addEditProduct.js'), $scope.selectedProduct)
    .then(() => $scope.productsTable.reload());

	$scope.importProducts = function(files){
		if ((files != null ? files.length : undefined) === 1) {
			if (!ExportService.checkFileName(files[0].name, "inapp", game.name)) { return; }

			return ExportService.readFileAsJson(files[0], jsonContents => StoreService.setProducts(game.name, jsonContents.list)
            .success(function(){
                alert('Products imported');
                return $scope.productsTable.reload();}).catch(err => alert('Error while saving data. See console for more details.')));
		}
	};


	return $scope.productsTable = new ngTableParams({
		page: 1, // show first page
		count: 10
	}
	, {
		getData($defer, params) {
			const skip = () => (params.page() - 1) * params.count();
			const limit = () => params.count();

			const listProducts = () => StoreService.listProducts(game.name, skip(), limit());

			$scope.selectedProduct = null;
			return listProducts().success(function(products){ // data is {list: [], total: int}
				params.total(products.total);
				return $defer.resolve(products.list);}).catch(function(err){
				alert("Can't load product list. See Console for more details");
				return console.error(err);});
		}
	}
	);
};
