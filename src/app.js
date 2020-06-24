/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
Angular Application
*/

let app;
let currentUser = null;

const saveUser = function (user) {
	if (window.sessionStorage != null) {
		return window.sessionStorage.setItem('user', JSON.stringify(user));
	}
};

const loadUser = function () {
	if (window.sessionStorage != null) {
		let user = window.sessionStorage.getItem('user');
		user = (user != null) ? JSON.parse(user) : null;
		AuthService.setUser(user);
		$rootScope.$broadcast('userChanged');
		return user;
	}
};

// explicitely export app
window.app = (app = angular.module('app', ['ngRoute', 'ngGrid', 'ui.bootstrap', 'ngTable', 'nvd3ChartDirectives', 'ui.codemirror', 'jlareau.pnotify', 'angularFileUpload']));

app.config(function ($routeProvider, $locationProvider, $httpProvider, $controllerProvider) {

	//================================================
	// Check if the user is connected
	//================================================
	const checkLoggedin = function ($q, $timeout, $http, $location, $rootScope, AuthService) {
		// Initialize a new promise
		const deferred = $q.defer();

		// Make an AJAX call to check if the user is logged in
		$http.get("/loggedin").success(function (user) {
			// Authenticated
			if (user !== "0") {
				$rootScope.user = user;
				AuthService.setUserName(user.name);
				AuthService.setGames(user.games);
				//saveUser(user)
				return $timeout(deferred.resolve, 0);
				// Not Authenticated
			} else {
				$rootScope.message = "You need to log in.";
				$timeout(() => deferred.reject()
					, 0);
				return $location.url("/login");
			}
		});

		return deferred.promise;
	};

	//================================================
	// Add an interceptor for AJAX errors
	//================================================
	$httpProvider.responseInterceptors.push(
		function ($q, $location) {
			return (promise) =>
				// Success: just return the response
				promise.then(// Error: check the error status to get only the 401
					response => response,
					response => {
						if (response.status === 401) { $location.url("/login"); }
						return $q.reject(response);
					}
				)
		}
	);

	//================================================
	// Define all the routes
	//================================================
	app.registerCtrl = $controllerProvider.register;

	//console.log app.registerCtrl
	return $routeProvider.when("/", {
		templateUrl: "pages/main.html",
		controller: "mainController"
	}
	).when("/status", {
		templateUrl: "pages/status.html",
		controller: "statusController",
		resolve: {
			loggedin: checkLoggedin
		}
	}
	).when("/users", {
		templateUrl: "pages/users.html",
		controller: "usersController",
		resolve: {
			loggedin: checkLoggedin
		}
	}
	).when("/gamer/:userId", {
		templateUrl: "pages/gamer.html",
		controller: "gamerController",
		resolve: {
			loggedin: checkLoggedin
		}
	}
	).when("/leaderboards", {
		templateUrl: "pages/leaderboards.html",
		controller: "leaderboardsController",
		resolve: {
			loggedin: checkLoggedin
		}
	}
	).when("/hooks", {
		templateUrl: "pages/hooks.html",
		controller: "hooksController",
		resolve: {
			loggedin: checkLoggedin
		}
	}
	).when("/matches", {
		templateUrl: "pages/matches.html",
		controller: 'matchesController',
		resolve: {
			loggedin: checkLoggedin
		}
	}
	).when("/matches/:matchId", {
		templateUrl: "pages/showMatch.html",
		controller: 'showMatchController',
		resolve: {
			loggedin: checkLoggedin
		}
	}
	).when("/store", {
		templateUrl: "pages/store.html",
		controller: 'storeController',
		resolve: {
			loggedin: checkLoggedin
		}
	}
	).when("/login", {
		templateUrl: "pages/login.html",
		controller: "LoginCtrl"
	}
	).otherwise({ redirectTo: "/" });
});


/*
Login controller
*/
app.controller("LoginCtrl", function ($scope, $rootScope, $http, $location, AuthService) {

	// This object will be filled by the form
	$scope.user = {};

	// Register the login() function
	return $scope.login = () => // No error: authentication OK
		$http.post("/login", {
			username: $scope.user.username,
			password: $scope.user.password,
			ggcode: $scope.user.ggcode
		}).success(function (user) {
			$rootScope.message = "Authentication successful!";
			$rootScope.user = user;
			saveUser(user);
			AuthService.setUserName(user.name);
			AuthService.setGames(user.games);

			currentUser = user;
			return $location.url("/status");
		}).error(function () {
			$scope.user.username = "";
			$scope.user.password = "";
			currentUser = null;
			// Error: authentication failed
			$rootScope.message = "Authentication failed.";
			return $location.url("/login");
		});
});

app.controller("SelectorCtrl", function ($rootScope, $scope, AuthService) {
	$scope.user = AuthService.userName();
	$scope.games = AuthService.games();
	$scope.game = ($scope.games != null ? $scope.games.length : undefined) > 0 ? $scope.games[0] : null;
	$scope.domain = ($scope.games != null) ? $scope.games.domains[0] || 'private' : undefined;
	$rootScope.showSelector = true;

	$scope.loggedIn = () => $scope.user != null;

	$scope.$on('userChanged', () => $scope.user = AuthService.userName());

	$scope.$on('gamesChanged', function () {
		$scope.games = AuthService.games();
		if ($scope.games != null) {
			$scope.game = $scope.games[0];
			return $scope.domain = $scope.game.domains[0] || 'private';
		} else {
			$scope.game = null;
			return $scope.domain = 'private';
		}
	});

	$scope.$watch('game', function (value) {
		$scope.domain = 'private';
		$rootScope.$broadcast('domainChanged', 'private');
		return $rootScope.$broadcast('gameChanged', value);
	});


	return $scope.$watch('domain', function (value) {
		if (value != null) { return $rootScope.$broadcast('domainChanged', value); }
	});
});


const factories = require("./factories.js");
app.factory("UserService", ["$http", factories.UserService]);
app.factory("GameService", ["$http", factories.GameService]);
app.factory("AuthService", ["$http", "$rootScope", factories.AuthService]);
app.factory("MatchService", ["$http", factories.MatchService]);
app.factory("StoreService", ["$http", factories.StoreService]);
app.factory("ExportService", ["$http", factories.ExportService]);

app.controller('gamerController', require('./gamer.js'));
app.controller('EditUserStorageCtrl', require('./gamer-editStorage.js'));
app.controller('EditKVStoreCtrl', require('./gamer-editKVStore.js'));
app.controller('EditUserPropertiesCtrl', require('./gamer-editProperties.js'));
app.controller('EditUserProfileCtrl', require('./gamer-editProfile.js'));
app.controller('EditTransactionsCtrl', require('./gamer-editTransactions.js'));
app.controller('TransactionsHistoryCtrl', require('./gamer-txHistory.js'));
app.controller('UserBestScoresCtrl', require('./gamer-best.js'));
app.controller('FriendsCtrl', require('./gamer-friends.js'));
app.controller('GodChildrenCtrl', require('./gamer-godchildren.js'));
app.controller('RawCtrl', require('./gamer-raw.js'));


app.controller("usersController", require('./users.js'));
app.controller('statusController', require('./status.js'));
app.controller('leaderboardsController', require('./leaderboards.js'));
app.controller('matchesController', require('./matches.js'));
app.controller('showMatchController', require('./showMatch.js'));
app.controller('storeController', require('./store.js'));

app.controller("mainController", function ($rootScope, $scope, AuthService, $http) {
	$scope.env = "";
	$scope.version = "";
	return $http.get("/env")
		.success(function (conf) {
			$scope.env = conf.env;
			$scope.version = conf.version;
			return $scope.options = conf.options;
		});
});

app.directive('formAutofillFix', () => (function (scope, elem, attrs) {
	// Fixes Chrome bug: https://groups.google.com/forum/#!topic/angular/6NlucSskQjY
	elem.prop('method', 'POST');

	// Fix autofill issues where Angular doesn't know about autofilled inputs
	if (attrs.ngSubmit) {
		return setTimeout(() => elem.unbind('submit').submit(function (e) {
			e.preventDefault();
			elem.find('input, textarea, select').trigger('input').trigger('change').trigger('keydown');
			return scope.$apply(attrs.ngSubmit);
		})
			, 0);
	}
}));


app.directive('dtabset', function () {
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		controller: function($scope) {
			$scope.templateUrl = '';
			const tabs = ($scope.tabs = []);
			const controller = this;

			this.selectTab = function (tab) {
				tabs.forEach(function (tab) {
					tab.selected = false;
				});
				tab.selected = true;
			};

			this.setTabTemplate = function (templateUrl) {
				$scope.templateUrl = templateUrl;
			};

			this.addTab = function (tab) {
				if (tabs.length === 0) {
					controller.selectTab(tab);
				}
				tabs.push(tab);
			};

		},
		template: "<div class=\"row-fluid\"><div class=\"row-fluid\"><div class=\"nav nav-tabs\" ng-transclude></div></div><div class=\"row-fluid\"><ng-include src=\"templateUrl\"></ng-include></div></div>"
	};
});
app.directive('dtab', function () {
	return {
		restrict: 'E',
		replace: true,
		require: '^dtabset',

		scope: {
			title: '@',
			icon: '@',
			templateUrl: '@'
		},

		link: function(scope, element, attrs, tabsetController) {
			tabsetController.addTab(scope);

			scope.select = function () {
				tabsetController.selectTab(scope);
			};

			scope.$watch('selected', function () {
				if (scope.selected) {
					tabsetController.setTabTemplate(scope.templateUrl);
				}
			});
		},

		template: "<li ng-class=\"{active: selected}\"><a href=\"\" ng-click=\"select()\"><i class='{{icon}}'></i> {{ title }}</a></li>"
	}
});

app.run(function ($rootScope, $http, AuthService) {
	$rootScope.message = "";

	// Logout function is available in any pages
	return $rootScope.logout = function () {
		$rootScope.user = null;
		AuthService.setUserName(null);
		AuthService.setGames(null);
		//saveUser(null)

		$rootScope.message = "Logged out.";
		return $http.post("/logout");
	};
});

