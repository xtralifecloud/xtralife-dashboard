/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */


module.exports = function($rootScope, $scope, $modal, $upload, $http, GameService, ExportService, notificationService){
	let domain, game;
	$scope.storage = [];
	$scope.achievements = [];
	$scope.certs = {};
	$scope.socialSettings = {};

	$scope.statsDataDAU = [ {key: "DAU", values: [] }];
	$scope.statsDataMAU = [ {key: "MAU", values: [] }];
	$scope.statsDataCCU = [ {key: "CCU", values: [] }];

	$scope.domain = (domain = $scope.$parent.domain);
	$scope.game = (game = $scope.$parent.game);
	$scope.enablePullEvents = false;

	const updateEnablePullEvents = () => $scope.enablePullEvents = game.eventedDomains.indexOf(domain) !== -1;

	const loadStorage = () => GameService.getGameStorage(game.name, domain)
	.success(storage => $scope.storage = storage
    , err => console.error(err));

	const loadAchievements = () => GameService.getAchievements(game.name, domain)
    .then(achievements => $scope.achievements = achievements
    , err => console.error(err));

	$scope.$on('domainChanged', function(event, value){
		if(value.fromGameChange) {
			$scope.domain = (domain = value.domain);
		}else{
			$scope.domain = (domain = value.domain);
			loadStorage();
			loadAchievements();
		}
		return updateEnablePullEvents();
	});

	$scope.$on('gameChanged', function(event, value){
		game = value;
		$scope.game = value;
		loadStorage();
		$scope.saveCertsOK=false;
		loadAchievements();
		return updateEnablePullEvents();
	});


	updateEnablePullEvents();
	loadStorage();
	loadAchievements();

	$scope.changePullEvent = function(game, domain){
		let each;
		const previouslyEnabled = $scope.enablePullEvents;

		const newEventedDomains = previouslyEnabled ?
			((() => {
				const result = [];
				for (each of Array.from(game.eventedDomains)) { 					if (each !== domain) {
						result.push(each);
					}
				}
				return result;
			})())
		:
			[domain].concat(game.eventedDomains);

		const newEventedDomainsWithoutPrivate = ((() => {
			const result1 = [];
			for (each of Array.from(newEventedDomains)) { 				if (each !== 'private') {
					result1.push(each);
				}
			}
			return result1;
		})());
		return GameService.setEventedDomains(game.name, newEventedDomainsWithoutPrivate).success(() => game.eventedDomains = newEventedDomains);
	};

	$scope.editGameStorage = () => $modal.open({
        templateUrl: 'status.editGameStorage.html',
        controller: require('./status.editGameStorage.js'),
        resolve: {
            GameService() { return GameService; },
            storage() { return $scope.storage; },
            game() { return game; },
            domain() { return domain; }
        },
        backdrop : false}).result
    .then(() => loadStorage());

	$scope.importGameStorage = function(files){
		if ((files != null ? files.length : undefined) === 1) {

			if (!ExportService.checkFileName(files[0].name, "gamekv", domain)) { return; }

			return ExportService.readFileAsJson(files[0], jsonContents => GameService.updateGameStorage(game.name, domain, jsonContents)
            .success(function(){
                alert('Game K/V storage imported');
                return loadStorage();}).catch(err => alert('Error while saving data. See console for more details.')));
		}
	};

	$scope.editAchievements = () => $modal.open({
        templateUrl: 'status.editAchievements.html',
        controller: require('./status.editAchievements.js'),
        resolve: {
            GameService() { return GameService; },
            achievements() { return $scope.achievements; },
            game() { return game; },
            domain() { return domain; }
        },
        backdrop : false}).result
    .then(() => loadAchievements());

	$scope.importAchievements = function(files){
		if ((files != null ? files.length : undefined) === 1) {

			if (!ExportService.checkFileName(files[0].name, "achievements", domain)) { return; }

			return ExportService.readFileAsJson(files[0], jsonContents => GameService.saveRawAchievements(game.name, domain, jsonContents)
            .success(function(){
                alert('Achievements imported');
                return loadAchievements();}).catch(err => alert('Error while saving data. See console for more details.')));
		}
	};


	$scope.xAxisCCUFormatFunction = () => d => moment.unix(d).format("hh:mm");

	$scope.ccuToolTipContent = () => (key, x, y, e, graph) => '<h1>' + key + '</h1>' + '<p>' +  y + ' at ' + moment.unix(x).format("hh:mm") + '</p>';

	$scope.xAxisDAUFormatFunction = () => d => moment.unix(d).format("DD-MM-YY");

	$scope.dauToolTipContent = () => (key, x, y, e, graph) => '<h1>' + key + '</h1>' + '<p>' +  y + ' at ' + moment.unix(x).format("DD-MM-YY") + '</p>';

	$scope.xAxisMAUFormatFunction = () => d => moment.unix(d).format("MM-YYYY");

	$scope.mauToolTipContent = () => (key, x, y, e, graph) => '<h1>' + key + '</h1>' + '<p>' +  y + ' at ' + moment.unix(x).format("MM-YYYY") + '</p>';

	$scope.exportData = () => GameService.exportData().success(data => $scope.alerts.push({ type: 'success' , msg: "Exporting data...This could take a while, you'll receive an email when the job is done."})).error(err => $scope.alerts.push({ type: 'danger' , msg: `Unable to export data : ${JSON.stringify(err)}`}));

	$scope.alerts = [];

	return $scope.closeAlert = index => $scope.alerts.splice(index, 1);
};
