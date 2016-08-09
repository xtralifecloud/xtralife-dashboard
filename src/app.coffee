###
Angular Application
###

currentUser = null

saveUser = (user)->
	if window.sessionStorage?
		window.sessionStorage.setItem 'user', JSON.stringify user

loadUser = ()->
	if window.sessionStorage?
		user = window.sessionStorage.getItem 'user'
		user = if user? then JSON.parse user else null
		AuthService.setUser(user)
		$rootScope.$broadcast('userChanged');
		user

# explicitely export app
window.app = app = angular.module 'app', ['ngRoute', 'ngGrid', 'ui.bootstrap', 'ngTable', 'nvd3ChartDirectives', 'ui.codemirror', 'jlareau.pnotify', 'angularFileUpload' ]

app.config ($routeProvider, $locationProvider, $httpProvider, $controllerProvider) ->

	#================================================
	# Check if the user is connected
	#================================================
	checkLoggedin = ($q, $timeout, $http, $location, $rootScope, AuthService) ->
		# Initialize a new promise
		deferred = $q.defer()

		# Make an AJAX call to check if the user is logged in
		$http.get("/loggedin").success (user) ->
			# Authenticated
			if user isnt "0"
				$rootScope.user = user
				AuthService.setUserName user.name
				AuthService.setGames user.games
				#saveUser(user)
				$timeout deferred.resolve, 0
			# Not Authenticated
			else
				$rootScope.message = "You need to log in."
				$timeout ()->
					deferred.reject()
				, 0
				$location.url "/login"

		deferred.promise

	#================================================
	# Add an interceptor for AJAX errors
	#================================================
	$httpProvider.responseInterceptors.push ($q, $location) ->
		(promise) ->
			# Success: just return the response
			promise.then (response) ->
				response

			# Error: check the error status to get only the 401
			, (response) ->
				$location.url "/login" if response.status is 401
				$q.reject response

	#================================================
	# Define all the routes
	#================================================
	app.registerCtrl = $controllerProvider.register

	#console.log app.registerCtrl
	$routeProvider.when("/",
		templateUrl: "pages/main.html"
		controller: "mainController"
	).when("/status",
		templateUrl: "pages/status.html"
		controller: "statusController"
		resolve:
			loggedin: checkLoggedin
	).when("/users",
		templateUrl: "pages/users.html"
		controller: "usersController"
		resolve:
			loggedin: checkLoggedin
	).when("/gamer/:userId",
		templateUrl: "pages/gamer.html"
		controller: "gamerController"
		resolve:
			loggedin: checkLoggedin
	).when("/leaderboards",
		templateUrl: "pages/leaderboards.html"
		controller: "leaderboardsController"
		resolve:
			loggedin: checkLoggedin
	).when("/hooks",
		templateUrl: "pages/hooks.html"
		controller: "hooksController"
		resolve:
			loggedin: checkLoggedin
	).when("/matches",
		templateUrl: "pages/matches.html"
		controller: 'matchesController'
		resolve:
			loggedin: checkLoggedin
	).when("/matches/:matchId",
		templateUrl: "pages/showMatch.html"
		controller: 'showMatchController'
		resolve:
			loggedin: checkLoggedin
	).when("/store",
		templateUrl: "pages/store.html"
		controller: 'storeController'
		resolve:
			loggedin: checkLoggedin
	).when("/login",
		templateUrl: "pages/login.html"
		controller: "LoginCtrl"
	).otherwise redirectTo: "/"

app.run ($rootScope, $http, AuthService) ->
	$rootScope.message = ""

	# Logout function is available in any pages
	$rootScope.logout = ->
		$rootScope.user = null
		AuthService.setUserName null
		AuthService.setGames null
		#saveUser(null)

		$rootScope.message = "Logged out."
		$http.post "/logout"

###
Login controller
###
app.controller "LoginCtrl", ($scope, $rootScope, $http, $location, AuthService) ->

	# This object will be filled by the form
	$scope.user = {}

	# Register the login() function
	$scope.login = ()->
		# No error: authentication OK
		$http.post "/login",
			username: $scope.user.username
			password: $scope.user.password
			ggcode: $scope.user.ggcode
		.success (user) ->
			$rootScope.message = "Authentication successful!"
			$rootScope.user = user
			saveUser(user)
			AuthService.setUserName user.name
			AuthService.setGames user.games

			currentUser = user
			$location.url "/status"
		.error ->
			$scope.user.username = ""
			$scope.user.password = ""
			currentUser = null
			# Error: authentication failed
			$rootScope.message = "Authentication failed."
			$location.url "/login"

app.controller "SelectorCtrl", ($rootScope, $scope, AuthService)->
	$scope.user = AuthService.userName()
	$scope.games = AuthService.games()
	$scope.game = if $scope.games?.length>0 then $scope.games[0] else null
	$scope.domain = if $scope.games? then $scope.games.domains[0] or 'private'
	$rootScope.showSelector = true

	$scope.loggedIn = ()->
		$scope.user?

	$scope.$on 'userChanged', ()->
		$scope.user = AuthService.userName()

	$scope.$on 'gamesChanged', ()->
		$scope.games = AuthService.games()
		if $scope.games?
			$scope.game = $scope.games[0]
			$scope.domain = $scope.game.domains[0] or 'private'
		else
			$scope.game =null
			$scope.domain = 'private'

	$scope.$watch 'game', (value)->
		$scope.domain = 'private'
		$rootScope.$broadcast 'domainChanged', 'private'
		$rootScope.$broadcast 'gameChanged', value


	$scope.$watch 'domain', (value)->
		if value? then $rootScope.$broadcast 'domainChanged', value


factories = require "./factories.coffee"
app.factory "UserService", ["$http", factories.UserService]
app.factory "GameService", ["$http", factories.GameService]
app.factory "AuthService", ["$http", "$rootScope", factories.AuthService]
app.factory "MatchService", ["$http", factories.MatchService]
app.factory "StoreService", ["$http", factories.StoreService]
app.factory "ExportService", ["$http", factories.ExportService]

app.controller 'gamerController', require './gamer.coffee'
app.controller 'EditUserStorageCtrl', require './gamer-editStorage.coffee'
app.controller 'EditKVStoreCtrl', require './gamer-editKVStore.coffee'
app.controller 'EditUserPropertiesCtrl', require './gamer-editProperties.coffee'
app.controller 'EditUserProfileCtrl', require './gamer-editProfile.coffee'
app.controller 'EditTransactionsCtrl', require './gamer-editTransactions.coffee'
app.controller 'TransactionsHistoryCtrl', require './gamer-txHistory.coffee'
app.controller 'UserBestScoresCtrl', require './gamer-best.coffee'
app.controller 'FriendsCtrl', require './gamer-friends.coffee'
app.controller 'GodChildrenCtrl', require './gamer-godchildren.coffee'
app.controller 'RawCtrl', require './gamer-raw.coffee'


app.controller "usersController", require './users.coffee'
app.controller 'statusController', require './status.coffee'
app.controller 'leaderboardsController', require './leaderboards.coffee'
app.controller 'matchesController', require './matches.coffee'
app.controller 'showMatchController', require './showMatch.coffee'
app.controller 'storeController', require './store.coffee'

app.controller "mainController", ($rootScope, $scope, AuthService, $http) ->
	$scope.env = ""
	$scope.version = ""
	$http.get "/env"
	.success (conf) ->
		$scope.env = conf.env
		$scope.version = conf.version
		$scope.options = conf.options

app.directive 'formAutofillFix', ->
	(scope, elem, attrs) ->
		# Fixes Chrome bug: https://groups.google.com/forum/#!topic/angular/6NlucSskQjY
		elem.prop 'method', 'POST'

		# Fix autofill issues where Angular doesn't know about autofilled inputs
		if attrs.ngSubmit
			setTimeout ->
				elem.unbind('submit').submit (e) ->
					e.preventDefault()
					elem.find('input, textarea, select').trigger('input').trigger('change').trigger 'keydown'
					scope.$apply attrs.ngSubmit
			, 0


app.directive('dtabset', ->
  {
    restrict: 'E'
    replace: true
    transclude: true
    controller: ($scope) ->
      $scope.templateUrl = ''
      tabs = $scope.tabs = []
      controller = this

      @selectTab = (tab) ->
        angular.forEach tabs, (tab) ->
          tab.selected = false
          return
        tab.selected = true
        return

      @setTabTemplate = (templateUrl) ->
        $scope.templateUrl = templateUrl
        return

      @addTab = (tab) ->
        if tabs.length == 0
          controller.selectTab tab
        tabs.push tab
        return

      return
    template: '<div class="row-fluid">' + '<div class="row-fluid">' + '<div class="nav nav-tabs" ng-transclude></div>' + '</div>' + '<div class="row-fluid">' + '<ng-include src="templateUrl"></ng-include>' + '</div>' + '</div>'
  }
).directive 'dtab', ->
  {
    restrict: 'E'
    replace: true
    require: '^dtabset'
    scope:
      title: '@'
      icon: '@'
      templateUrl: '@'
    link: (scope, element, attrs, tabsetController) ->
      tabsetController.addTab scope

      scope.select = ->
        tabsetController.selectTab scope
        return

      scope.$watch 'selected', ->
        if scope.selected
          tabsetController.setTabTemplate scope.templateUrl
        return
      return
    template: '<li ng-class="{active: selected}">' +'<a href="" ng-click="select()">'+"<i class='{{icon}}'></i>"+' {{ title }}</a>' + '</li>'
  }


