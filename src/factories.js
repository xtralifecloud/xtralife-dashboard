/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports.UserService = $http => // list and find users
({
    findUser(game, user_id) {
        return $http.get(`/game/${game}/users/find/${user_id}`);
    },

    getUsers(game, skip, limit) {
        return $http.get(`/game/${game}/users?skip=${skip}&limit=${limit}`);
    },

    searchUsers(game, q, skip, limit) {
        return $http.get(`/game/${game}/users/search?q=${q}&skip=${skip}&limit=${limit}`);
    },

    getFriends(game, domain, userId){
        return $http.get(`/game/${game}/user/${userId}/friends/${domain}`);
    },

    removeFriend(game, domain, userId, friendId){
        return $http.delete(`/game/${game}/user/${userId}/friend/${domain}/${friendId}`);
    },

    getGod(game, domain, userId){
        return $http.get(`/game/${game}/user/${userId}/friends/${domain}/god`);
    },

    // Other functions
    sendMessage(game, user, eventObject, domain){
        if (domain == null) { domain = "private"; }
        return $http.post(`/game/${game}/user/${user._id}/message/${domain}`, JSON.stringify(eventObject));
    },

    deleteUser(game, user_id) {
        return $http.delete(`/game/${game}/user/${user_id}`);
    },

    // User profile & properties
    getUserOutline(game, user_id){
        return $http.get(`/game/${game}/user/${user_id}/outline`);
    },

    getUserProfile(game, user_id){
        return $http.get(`/game/${game}/user/${user_id}/profile`);
    },

    updateUserProfile(game, user_id, profile){
        return $http.post(`/game/${game}/user/${user_id}/profile`, JSON.stringify(profile));
    },

    updateUserProperties(game, domain, user_id, properties){
        return $http.post(`/game/${game}/user/${user_id}/domain/${domain}/properties`, JSON.stringify(properties));
    },

    getUserProperties(game, domain, user_id) {
        return $http.get(`/game/${game}/user/${user_id}/domain/${domain}/properties`);
    },

    // KVstore user
    getUserKVStore(game, user_id, domain) {
        if (domain == null) { domain = "private"; }
        return $http.get(`/game/${game}/user/${user_id}/kvstore/${domain}`);
    },

    updateUserKVStore(game, user_id, kvstore, domain){
        if (domain == null) { domain = "private"; }
        return $http.post(`/game/${game}/user/${user_id}/kvstore/${domain}`, JSON.stringify(kvstore));
    },

    // Virtual FS user
    getUserStorage(game, user_id, domain) {
        if (domain == null) { domain = "private"; }
        return $http.get(`/game/${game}/user/${user_id}/storage/${domain}`);
    },

    updateUserStorage(game, user_id, storage, domain){
        if (domain == null) { domain = "private"; }
        return $http.post(`/game/${game}/user/${user_id}/storage/${domain}`, JSON.stringify(storage));
    },

    // Transactions
    balance(game, user_id, domain){
        if (domain == null) { domain = "private"; }
        return $http.get(`/game/${game}/user/${user_id}/balance/${domain}`);
    },

    newTransaction(game, user_id, tx, description, domain){
        if (domain == null) { domain = "private"; }
        return $http.post(`/game/${game}/user/${user_id}/transaction/${domain}`, JSON.stringify({tx, description}));
    },

    txHistory(game, user_id, domain, skip, limit){
        if (domain == null) { domain = "private"; }
        if (skip == null) { skip = 0; }
        if (limit == null) { limit = 0; }
        return $http.get(`/game/${game}/user/${user_id}/txHistory/${domain}?skip=${skip}&limit=${limit}`);
    },

    // Scores
    bestScores(game, domain, user_id){
        return $http.get(`/game/${game}/user/${user_id}/domain/${domain}/bestscores`);
    },

    deleteScore(game, domain, user_id, lb){
        return $http.delete(`/${game}/user/${user_id}/domain/${domain}/${lb}`);
    }
});

module.exports.GameService = $http => ({
    getSignedUrl(game, domain, key){
        return $http.get(`/game/${game}/signedurl/${domain}/${key}`);
    },

    getGameStorage(game, domain) {
        return $http.get(`/game/${game}/storage/${domain}`);
    },

    updateGameStorage(game, domain, storage) {
        return $http.post(`/game/${game}/storage/${domain}`, JSON.stringify(storage));
    },

    getGame(game, domain){
        return $http.get(`/game/${game}/domain/${domain}`);
    },

    getLeaderboard(game, domain, leaderboard, page, count){
        return $http.get(`/game/${game}/domain/${domain}/leaderboard/${leaderboard}?page=${page}&count=${count}`);
    },

    rebuildLeaderboard(game, domain, leaderboard, page, count){
        return $http.post(`/game/${game}/domain/${domain}/leaderboard/${leaderboard}`);
    },

    deleteLeaderboard(game, domain, leaderboard){
        return $http.delete(`/game/${game}/domain/${domain}/leaderboard/${leaderboard}`);
    },

    getAchievements(game, domain){
        return $http.get(`/game/${game}/achievements/${domain}`)
        .then(function(res){
            const definitions = res.data;
            return (() => {
                const result = [];
                for (let name in definitions) {
                    const ach = definitions[name];
                    result.push({name, type: ach.type, config: ach.config, gameData: ach.gameData});
                }
                return result;
            })();
        });
    },

    saveAchievements(game, domain, achievements){
        const definitions = {};
        for (let each of Array.from(achievements)) { definitions[each.name] = {type: each.type, config: each.config, gameData: each.gameData}; }
        return $http.post(`/game/${game}/achievements/${domain}`, JSON.stringify(definitions));
    },

    saveRawAchievements(game, domain, achievements){
        return $http.post(`/game/${game}/achievements/${domain}`, JSON.stringify(achievements));
    },

    exportData(game){
        return $http.post("/job/company/userexport", {data:{}});
    }
});


module.exports.AuthService = function($http, $rootScope) {
	let userName = null;
	let games = null;

	return {
		setUserName(aUserName){
			if (userName !== aUserName) {
				userName = aUserName;
				return $rootScope.$broadcast('userChanged');
			}
		},

		userName(){
			return userName;
		},

		games(){
			return games;
		},

		setGames(gamesArray){
			if (JSON.stringify(gamesArray) !== JSON.stringify(games)) {
				games = gamesArray;
				return $rootScope.$broadcast('gamesChanged');
			}
		}
	};
};

module.exports.MatchService = $http => // list matches
({
    getMatches(game, domain, hideFinished, gamer_id, customProperties, skip, limit){
        let url = `/game/${game}/matches/domain/${domain}?skip=${skip}&limit=${limit}&hideFinished=${hideFinished}`;
        if (gamer_id != null) { url = url + `&gamerId=${gamer_id}`; }
        if ((customProperties != null) && (customProperties.length > 0)) { url = url + "&customProperties=" + encodeURIComponent(customProperties); }
        return $http.get(url);
    },

    getMatch(game, matchId){
        return $http.get(`/game/${game}/matches/${matchId}`);
    },

    deleteMatch(game, matchId){
        return $http.delete(`/game/${game}/matches/${matchId}`);
    },

    updateMatch(game, matchId, match){
        return $http.put(`/game/${game}/matches/${matchId}`, match);
    }
});


module.exports.StoreService = $http => ({
    addProduct(game, product){
        return $http.post(`/game/${game}/store/products`, product);
    },

    deleteProduct(game, productId){
        return $http.delete(`/game/${game}/store/products/${productId}`);
    },

    listProducts(game, skip, limit){
        return $http.get(`/game/${game}/store/products`);
    },

    setProducts(game, products){
        return $http.put(`/game/${game}/store/products`, products);
    },

    updateProduct(game, product){
        return $http.put(`/game/${game}/store/products/${product.productId}`, product);
    }
});

module.exports.ExportService = $http => ({
    checkFileName(filename, expectedType, expectedDomain, action){
        if (action == null) { action = "replace"; }
        const extension = (filename.split('.'))[(filename.split('.')).length-1];
        const env = filename.split('-')[0];
        const domain = filename.split('-')[1];
        const type = filename.split('-')[2];

        if (extension.toLowerCase() !== 'json') {
            alert(`Incorrect file type. Found: ${extension} but expected .json`);
            return false;
        }

        if (type !== expectedType) {
            alert(`Wrong export type. Found: ${type} but expected ${expectedType}`);
            return false;
        }

        if (domain !== expectedDomain) {
            if (!confirm(`Are you sure you want to import into ${domain} your configuration from ${expectedDomain} ?`)) {
                return false;
            }
        }

        if (confirm(`Are you sure you want to ${action} this data with data from ${env}? `)) {
            return true;
        } else { return false; }
    },

    readFileAsJson(file, cb){
        const filereader = new FileReader();
        filereader.onloadend = function() {
            const jsonContents = JSON.parse(filereader.result);
            return cb(jsonContents);
        };

        return filereader.readAsText(file);
    }
});
