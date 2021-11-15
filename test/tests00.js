/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const request = require("supertest");
const mocha = require("mocha");
const should = require("should");
const util = require("util");

let server = null;
const serverPromise = require('../server/dashboard.js');

// ------------------------------------------------
// ------------------------------------------------
const print = function(obj){
	return;
	return console.log(util.inspect(obj, { showHidden: false, depth: 8, colors: true }));
};

//endpoint = "https://sandbox-backoffice.clanofthecloud.com"
const endpoint = "https://localhost:3000";


const authapi = {
	user: 'user',
	password: 'password'
};

const game = 'com.clanofthecloud.cloudbuilder';
let user_id = null;
let gamer_id = null;
let gamers_id = null;
const domain = 'private';
const friend_id = "57ac42dc17c50ad25bbb1605";


describe("BO API tests", function(){

	before('should wait for initialisation', () => serverPromise.then(_server => server = _server));


	describe("basic requests", function(){
		
		it("/api/v1/company should fail is bad ident are passed", function(done){
			request(server)
			.get('/api/v1/company')
			.auth("xxxx", "xxxx")
			.set('Content-Type', 'application/json')
			.expect(401)
			.end(function(err, res){
				res.status.should.eql(401);
				return done(err);
			});
			return null;
		});

		return it("/api/v1/company should success", function(done){
			request(server)
			.get('/api/v1/company')
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.expect(200)
			.end(function(err, res){
				res.status.should.eql(200);
				should(err).be.undefined;
				should.exist(res.body.name);
				should.exist(res.body.games);
				return done(err);
			});
			return null;
		});
	});

	describe("users", function(){

		it("list users should success", function(done){
			request(server)
			.get(`/api/v1/game/${game}/users?skip=0&limit=3`)
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.expect(200)
			.end(function(err, res){
				res.status.should.eql(200);
				should(err).be.undefined;
				user_id = res.body.list[0]._id;
				gamers_id = (Array.from(res.body.list).map((u) => u._id));
				gamer_id = gamers_id[0]
				return done(err);
			});
			return null;
		});

		it("get profile should success", function(done){
			request(server)
			.get(`/api/v1/game/${game}/user/${gamer_id}/profile`)
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.expect(200)
			.end(function(err, res){
				res.status.should.eql(200);
				should(err).be.undefined;
				should.exist(res.body.displayName);
				print(res.body);
				return done(err);
			});
			return null;
		});


		it("list balance on user should success", function(done){
			request(server)
			.get(`/api/v1/game/${game}/user/${gamer_id}/balance/private`)
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.expect(200)
			.end(function(err, res){
				res.status.should.eql(200);
				should(err).be.undefined;
				//print res.body
				return done(err);
			});
			return null;
		});

		it("list transaction on user should success", function(done){
			request(server)
			.get(`/api/v1/game/${game}/user/${gamer_id}/txHistory/private?skip=0&limit=10`)
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.expect(200)
			.end(function(err, res){
				res.status.should.eql(200);
				should(err).be.undefined;
				//print res.body
				should.exist(res.body.transactions);
				should.exist(res.body.count);
				return done(err);
			});
			return null;
		});

		return it("push event should success", function(done){
			request(server)
			.post(`/api/v1/game/${game}/user/${gamer_id}/message/private`)
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.send({type : 'backoffice', message :'you win the contest!'}) 
			.expect(200)
			.end(function(err, res){
				res.status.should.eql(200);
				should(err).be.undefined;
				//print res.body
				return done(err);
			});
			return null;
		});
	});

	describe("bulk", function(){
		it("should send bulk event", function(done){
			request(server)
			.post(`/api/v1/game/${game}/push/bulk/private`)
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.send({ 
				userids: [gamer_id, friend_id],
				notification: {
					fr : "Salut!",
					en : "hi!"
				}}).expect(200)
			.end(function(err, res){
				res.status.should.eql(200);
				should(err).be.undefined;
				//print res.body
				return done(err);
			});
			return null;
		});

		return it("should wait", function(done){
			this.timeout(0);
			setTimeout(() => done()
			, 40000);
			return null;
		});
	});



	describe("keyvalue", function(){

		it("all keys should success", function(done){
			request(server)
			.get(`/api/v1/game/${game}/storage/${domain}`)
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.expect(200)
			.end(function(err, res){
				res.status.should.eql(200);
				return done(err);
			});
			return null;
		});

		it("should write one key", function(done){
			request(server)
			.put(`/api/v1/game/${game}/storage/${domain}/key1`)
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.send({ content : "test write one key" })
			.expect(200)
			.end(function(err, res){
				res.status.should.eql(200);
				return done(err);
			});
			return null;
		});

		return it("should read one key", function(done){
			request(server)
			.get(`/api/v1/game/${game}/storage/${domain}/key1`)
			.auth(authapi.user, authapi.password)
			.set('Content-Type', 'application/json')
			.expect(200)
			.end(function(err, res){
				res.status.should.eql(200);
				return done(err);
			});
			return null;
		});
	});

	return describe("game", () => it("game should success", function(done){
        request(server)
        .get(`/api/v1/game/${game}/domain/private`)
        .auth(authapi.user, authapi.password)
        .set('Content-Type', 'application/json')
        .expect(200)
        .end(function(err, res){
            res.status.should.eql(200);
            should.exist(res.body.appid);
            should.exist(res.body.config);
            return done(err);
        });
        return null;
    }));
});

