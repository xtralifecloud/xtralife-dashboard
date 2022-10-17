/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { ObjectId } = require("mongodb");
const async = require("async");
const _ = require("underscore");
const xtralife = require("xtralife-api");
const notify = require("./notify.js");

const route = require("express").Router({ caseSensitive: true });
const { downloadable } = require("./middleware.js");

route.param("game", function (req, res, next, game) {
  for (let each of Array.from(req.user != null ? req.user.games : undefined)) {
    if ((each != null ? each.name : undefined) === req.params.game) {
      game = each;
    }
  }
  if (game != null) {
    req.game = xtralife.api.game.dynGames[game.name];
    req.context = { game: req.game, skipHooks: true };
    return next();
  } else {
    logger.warn(
      `Illegal access blocked, user ${req.user.name} for ${req.params.game}`
    );
    res.status(401);
    res.json({
      Error: "Unauthorized",
      Message: "You don't have privileged access to this game",
    });
    return res.end();
  }
});

route.param("userid", function (req, res, next, userid) {
  req.user_id = new ObjectId(userid);
  return next();
});

route.param("friendid", function (req, res, next, friendid) {
  req.friend_id = new ObjectId(friendid);
  return next();
});

route.param("matchid", function (req, res, next, matchid) {
  req.match_id = new ObjectId(matchid);
  return next();
});

route.param("key", function (req, res, next, key) {
  req.key = key;
  return next();
});

route.param("domain", function (req, res, next, domain) {
  const _isValidDomain = (aDomain) =>
    aDomain === "private" ||
    (req.game != null &&
      req.game.config.domains != null &&
      req.game.config.domains.indexOf(aDomain) !== -1);

  if (_isValidDomain(req.params.domain)) {
    req.dom =
      req.params.domain === "private"
        ? `${req.game.appid}.${req.game.apisecret}`
        : req.params.domain;
    return next();
  } else {
    logger.warn(
      `Illegal access blocked, user ${req.user.name} for ${req.params.game} domain ${req.params.domain}`
    );
    return res
      .status(401)
      .json({
        Error: "Unauthorized",
        Message: "Access not granted",
      })
      .end();
  }
});

const to_string = function (value) {
  if (_.isObject(value)) {
    return JSON.stringify(value);
  } else if (_.isNumber(value)) {
    return value;
  } else {
    return '"' + value + '"';
  }
};

const from_string = function (value) {
  if (_.indexOf(value, '"') === 0) {
    return (value = value.substring(1, value.lastIndexOf('"')));
  } else {
    return JSON.parse(value);
  }
};

route
  .route("/game/:game/signedurl/:domain/:key")
  .get((req, res) =>
    xtralife.api.gamevfs.createSignedURL(
      req.dom,
      req.key,
      function (err, signedURL, getURL) {
        console.log("err", err);
        if (err != null) {
          return res.status(400).json(err).end();
        }
        return res.json({ signedURL, getURL }).end();
      }
    )
  )
  .delete((req, res) => {
    xtralife.api.gamevfs
      .deleteURL(req.dom, req.key)
      .then((result) => {
        return res.json({ done: 1 }).end();
      })
      .catch((err) => {
        return res.status(400).json(err).end();
      });
  });

route
  .route("/game/:game/user/:userid/signedurl/:domain/:key")
  .get((req, res) => {
    return xtralife.api.virtualfs
      .createSignedURL(req.dom, req.user_id, req.key)
      .then(([signedURL, getURL], err) => {
        if (err != null) {
          return res.status(400).json(err).end();
        }
        return res.json({ signedURL, getURL }).end();
      });
  })
  .delete((req, res) => {
    xtralife.api.virtualfs
      .deleteURL(req.dom, req.user_id, req.key)
      .then((result) => {
        return res.json({ done: 1 }).end();
      })
      .catch((err) => {
        return res.status(400).json(err).end();
      });
  });

route
  .route("/game/:game/storage/:domain")
  .get(downloadable("gamekv"), (req, res) =>
    xtralife.api.gamevfs.read(req.dom, null, function (err, data) {
      if (err != null) {
        return res.sendStatus(400).json(err).end();
      }

      return res
        .json(
          (() => {
            const result = [];
            for (let key in data) {
              const value = data[key];
              result.push({ fskey: key, fsvalue: to_string(value) });
            }
            return result;
          })()
        )
        .end();
    })
  )
  .post(function (req, res) {
    try {
      const obj = {};
      for (let each of Array.from(req.body)) {
        obj[each.fskey] = from_string(each.fsvalue);
      }
      return xtralife.api.gamevfs.write(req.dom, null, obj, function (err) {
        if (err != null) {
          return res.sendStatus(500).end();
        }
        return res.sendStatus(200).end();
      });
    } catch (ex) {
      return res.sendStatus(400).json(ex.stack.split("\n")[0]).end();
    }
  });

route
  .route("/game/:game/storage/:domain/:key")
  .get(function (req, res) {
    const { key } = req.params;
    return xtralife.api.gamevfs.read(req.dom, key, function (err, data) {
      if (err != null) {
        return res.json(400, err);
      }
      return res.json(data).end();
    });
  })
  .put(function (req, res) {
    const { key } = req.params;
    return xtralife.api.gamevfs.write(req.dom, key, req.body, function (err) {
      if (err != null) {
        return res.send(500);
      }
      return res.json({ done: 1 }).end();
    });
  })
  .delete(function (req, res) {
    const { key } = req.params;
    return xtralife.api.gamevfs.delete(req.dom, key, function (err) {
      if (err != null) {
        return res.send(500);
      }
      return res.json({ done: 1 }).end();
    });
  });

const addMQlength = function (domain, game, users) {
  let each;
  const { broker } = xlenv;
  const id_list = (() => {
    const result = [];
    for (each of Array.from(users)) {
      result.push(each._id);
    }
    return result;
  })();
  return broker
    ._getBroker(domain)
    .pendingStats(id_list)
    .then(function (res) {
      for (let index = 0; index < res.length; index++) {
        each = res[index];
        users[index].mqPending = each;
      }

      return broker._getBroker(domain).timedoutStats(id_list);
    })
    .then((res) =>
      (() => {
        const result1 = [];
        for (let index = 0; index < res.length; index++) {
          each = res[index];
          result1.push((users[index].mqTimedout = each));
        }
        return result1;
      })()
    )
    .catch(function (err) {
      logger.error(err.message, { stack: err.stack });
      return logger.error("Can't compute broker MQ length");
    });
};

// Route to find users by name
route.get("/game/:game/users/search", function (req, res) {
  const domain = `${req.game.appid}.${req.game.apisecret}`;

  return xtralife.api.user.search(
    req.game.appid,
    req.query.q,
    parseInt(req.query.skip),
    parseInt(req.query.limit),
    (err, data) =>
      addMQlength(domain, req.params.game, data).then(() =>
        res.json({ list: data }).end()
      )
  );
});

route.get("/game/:game/users/search/count", function (req, res) {
  return xtralife.api.user.searchCount(
    req.game.appid,
    req.query.q,
    (err, count) => {
      if (err != null) {
        console.log(err);
      }
      return res.json({ total: count }).end();
    }
  );
});

// Route to list users for a game
// TODO add domain param
route.get("/game/:game/users", function (req, res, next) {
  const domain = `${req.game.appid}.${req.game.apisecret}`;

  return xtralife.api.user.list(
    {
      skip: parseInt(req.query.skip) || 0,
      limit: parseInt(req.query.limit) || 0,
      game: req.game.appid,
    },
    function (err, data) {
      if (err != null) {
        console.log(err);
      }
      return addMQlength(domain, req.game.appid, data)
        .then(() => res.json({ list: data }).end())
        .catch(next)
        .done();
    }
  );
});

route.get("/game/:game/users/count", function (req, res, next) {
  return xtralife.api.user.count(
    {
      game: req.game.appid,
    },
    function (err, count) {
      if (err != null) {
        console.log(err);
      }
      return res.json({ total: count }).end();
    }
  );
});

route.get("/game/:game/users/find/:user_id", function (req, res, next) {
  let id;
  const domain = `${req.game.appid}.${req.game.apisecret}`;

  // doesn't use the route param userid to manage exceptions...
  try {
    id = new ObjectId(req.params.user_id);
  } catch (error) {
    return res.json({ errorName: "InvalidUserId", message: error.message });
  }

  const options = {
    skip: parseInt(req.query.skip) || 0,
    limit: parseInt(req.query.limit) || 0,
    game: req.game.appid,
  };

  if (id != null) {
    options.id = id;
  }

  return xtralife.api.user.list(options, function (err, data) {
    if (err != null) {
      console.log(err);
    }
    return addMQlength(domain, req.game.appid, data)
      .then(() => res.json({ list: data }).end())
      .catch(next)
      .done();
  });
});

route.route("/game/:game/user/:userid/outline").get((req, res, next) =>
  xtralife.api.outline.get(req.game, req.user_id, [], (err, outline) => {
    if (err != null || outline === null) {
      return res.json(400, err);
    }
    return res.json(outline).end();
  })
);

route
  .route("/game/:game/user/:userid/profile")
  .get(
    (
      req,
      res,
      next //don't use req.user_id as connect.exist do the new ObjectId by itself
    ) =>
      xtralife.api.connect.exist(req.params.userid, function (err, result) {
        if (err != null || result === null) {
          return res.json(400, err);
        }
        return res.json(result.profile).end();
      })
  )
  .post((req, res) =>
    xtralife.api.user.updateProfile(
      req.user_id,
      req.body,
      function (err, result) {
        if (err != null) {
          return res.json(400, err);
        }

        return res.json(result).end();
      }
    )
  );

route
  .route("/game/:game/user/:userid/domain/:domain/properties")
  .all((req, res, next) => next())
  .post((req, res) =>
    xtralife.api.user
      .write(req.context, req.dom, req.user_id, null, req.body)
      .then((result) => res.json(result).end())
      .catch((err) => res.json(400, err))
  )
  .get((req, res) =>
    xtralife.api.user
      .read(req.context, req.dom, req.user_id, null)
      .then((result) => res.json(result).end())
      .catch((err) => res.json(400, err))
  );

route.get("/game/:game/user/:userid/friends/:domain", (req, res) =>
  xtralife.api.social.getFriends(
    req.context,
    req.dom,
    req.user_id,
    function (err, friends) {
      if (err != null) {
        return res.json(400, err);
      }

      return xtralife.api.social.getBlacklistedUsers(
        req.context,
        req.dom,
        req.user_id,
        function (err, blacklist) {
          if (err != null) {
            return res.json(400, err);
          }
          return res.json({ friends, blackList: blacklist }).end();
        }
      );
    }
  )
);

route.delete("/game/:game/user/:userid/friend/:domain/:friendid", (req, res) =>
  xtralife.api.social.setFriendStatus(
    req.dom,
    req.user_id,
    req.friend_id,
    "forget",
    null,
    function (err, result) {
      if (err != null) {
        return res.json(400, err);
      }
      return res.json(result).end();
    }
  )
);

route.get("/game/:game/user/:userid/friends/:domain/sponsorship", (req, res) =>
  xtralife.api.social.getGodfather(
    req.context,
    req.dom,
    req.user_id,
    (err, referral) => {
      if (err != null) {
        return res.json(400, err);
      }
      return xtralife.api.social.getGodchildren(
        req.context,
        req.dom,
        req.user_id,
        (err, referrers) => {
          if (err != null) {
            return res.json(400, err);
          }
          return res.json({ referral, referrers }).end();
        }
      );
    }
  )
);

// Route to GET kvstore  for a user
route
  .route("/game/:game/user/:userid/kvstore/:domain")
  .get(function (req, res, next) {
    const query = { user_id: new ObjectId(req.user_id) };
    return xtralife.api.kv
      .list(req.context, req.dom, query, 0, 1000)
      .then(function (data) {
        for (let kv of Array.from(data)) {
          kv.value = JSON.stringify(kv.value);
          kv.acl = JSON.stringify(kv.acl);
        }
        return res.json(data).end();
      })
      .catch(next)
      .done();
  })
  .post(function (req, res, next) {
    const obj = {};
    return res.json({ ok: 1 }).end();
  });

// Route to GET virtualfs storage for a user
route
  .route("/game/:game/user/:userid/storage/:domain")
  .get((req, res, next) =>
    xtralife.api.virtualfs
      .read(req.context, req.dom, req.user_id, null)
      .then((data) =>
        res
          .json(
            (() => {
              const result = [];
              for (let key in data) {
                const value = data[key];
                result.push({ fskey: key, fsvalue: to_string(value) });
              }
              return result;
            })()
          )
          .end()
      )
      .catch(next)
      .done()
  )
  .post(function (req, res, next) {
    const obj = {};
    for (let each of Array.from(req.body)) {
      obj[each.fskey] = from_string(each.fsvalue);
    }

    return xtralife.api.virtualfs
      .write(req.context, req.dom, req.user_id, null, obj)
      .then(() => res.status(200).end())
      .catch(next)
      .done();
  });

// Route for a specific VFS storage user's key
route
  .route("/game/:game/user/:userid/storage/:domain/:key")
  .post(function (req, res, next) {
    const { key } = req.params;
    return xtralife.api.virtualfs
      .write(
        req.context,
        req.dom,
        req.user_id,
        key,
        from_string(req.body.fsvalue)
      )
      .then(() => res.status(200).end())
      .catch(next)
      .done();
  })

  .delete(function (req, res) {
    const { key } = req.params;
    return xtralife.api.virtualfs
      .delete(req.context, req.dom, req.user_id, key)
      .then(() => res.status(200).end())
      .done();
  });

// Route to delete a user
route.delete("/game/:game/user/:userid", (req, res) =>
  xtralife.api.onDeleteUser(
    req.user_id,
    (err, data) => res.json(err).end(),
    req.game.appid
  )
);

// Route to get the balance for a user
route.get("/game/:game/user/:userid/balance/:domain", (req, res, next) =>
  xtralife.api.transaction
    .balance(req.context, req.dom, req.user_id)
    .then((data) => res.json(data).end())
    .catch(next)
    .done()
);

// Route to record a new transaction for a user
route.post("/game/:game/user/:userid/transaction/:domain", (req, res, next) =>
  xtralife.api.transaction
    .transaction(
      req.context,
      req.dom,
      req.user_id,
      req.body.tx,
      req.body.description
    )
    .spread((data) => res.json(data).end())
    .catch(next)
    .done()
);

route.get("/game/:game/user/:userid/txHistory/:domain", (req, res) =>
  xtralife.api.transaction.txHistory(
    req.dom,
    req.user_id,
    null,
    parseInt(req.query.skip),
    parseInt(req.query.limit),
    function (err, data) {
      if (err != null) {
        res.set("Connection", "close"); // otherwise error will not show immediately
        res.send(400, err);
        return res.end();
      }
      return res.json(data).end();
    }
  )
);

route.get("/game/:game/user/:userid/txHistory/:domain/search", (req, res) =>
  xtralife.api.transaction.search(
    req.dom,
    req.user_id,
    req.query.ts1,
    req.query.ts2,
    req.query.q,
    parseInt(req.query.skip),
    parseInt(req.query.limit),
    function (err, data) {
      if (err != null) {
        res.set("Connection", "close"); // otherwise error will not show immediately
        res.send(400, err);
        return res.end();
      }
      return res.json(data).end();
    }
  )
);

route
  .route("/game/:game/domain/:domain/leaderboard/:leaderboard")
  .get(function (req, res, next) {
    // ?page=#{page}&count=#{count}
    const count = parseInt(req.query.count) || 10;
    const page = parseInt(req.query.page) || 1;

    // order is passed as null (the 2nd one)
    return xtralife.api.leaderboard.gethighscore(
      req.context,
      req.dom,
      null,
      req.params.leaderboard,
      page,
      count,
      function (err, leaderboard) {
        if (err != null) {
          console.log(err);
        }
        return res.json(leaderboard).end();
      }
    );
  })
  .post(function (req, res, next) {
    logger.warn(
      `Rebuilding leaderboard ${req.params.leaderboard} for ${req.game.appid}`
    );
    return xtralife.api.leaderboard.rebuild(
      req.dom,
      req.params.leaderboard,
      function (err) {
        if (err != null) {
          console.log(err);
        }
        return res.end();
      }
    );
  })
  .delete(function (req, res, next) {
    logger.warn(
      `Removing leaderboard ${req.params.leaderboard} for ${req.game.appid}`
    );
    return xtralife.api.leaderboard.deleteLeaderboard(
      req.dom,
      req.params.leaderboard,
      function (err) {
        if (err != null) {
          console.log(err);
        }
        return res.end();
      }
    );
  });

route.get(
  "/game/:game/user/:userid/domain/:domain/bestscores",
  (req, res, next) =>
    xtralife.api.leaderboard.bestscores(req.dom, req.user_id, (err, data) =>
      res.status(200).json(data).end()
    )
);

route.delete(
  "/:game/user/:userid/domain/:domain/:leaderboard",
  (req, res, next) =>
    xtralife.api.leaderboard.deleteScore(
      req.dom,
      req.user_id,
      req.params.leaderboard,
      (err, data) => res.status(200).json(data).end()
    )
);

// get whole game object
route.get("/game/:game/domain/:domain", (req, res, next) =>
  xtralife.api.game.getGame(req.game.appid, req.dom, (err, game) =>
    res.json(game).end()
  )
);

route.get(
  "/game/:game/achievements/:domain",
  downloadable("achievements"),
  (req, res, next) =>
    xtralife.api.achievement
      .loadAchievementsDefinitions(req.dom)
      .then((definitions) => res.json(definitions).end())
      .catch(next)
      .done()
);
route.post("/game/:game/achievements/:domain", (req, res, next) =>
  xtralife.api.achievement
    .saveAchievementsDefinitions(req.dom, req.body)
    .then((ach) => res.json(ach).end())
    .catch(next)
    .done()
);

route.post(
  "/game/:game/user/:userid/message/:domain",
  function (req, res, next) {
    const message = req.body;
    return xlenv.broker
      .send(req.dom, req.user_id, message)
      .then(() =>
        res
          .status(200)
          .json(message) // with .id field added
          .end()
      )
      .catch((err) => next(err));
  }
);

route.post("/game/:game/push/bulk/:domain", function (req, res, next) {
  if (req.body.userids == null) {
    return next(new Error("userids is missing"));
  }
  if (req.body.notification == null) {
    return next(new Error("notification is missing"));
  }
  if (!_.isArray(req.body.userids)) {
    return next(new Error("userids should be an array"));
  }

  return notify.pushBulk(
    req.game.appid,
    req.dom,
    req.body.userids,
    req.body.notification,
    function (err, found) {
      if (err != null) {
        return next(err);
      }
      return res.status(200).json({ found }).end();
    }
  );
});

route.get("/company", function (req, res) {
  const result = req.isAuthenticated() ? _.omit(req.user, "password") : "0";
  return res.json(result).end();
});

route.get("/game/:game/matches/domain/:domain", (req, res, next) =>
  xtralife.api.match
    .list(
      req.dom,
      parseInt(req.query.skip),
      parseInt(req.query.limit),
      req.query.hideFinished || false,
      req.query.gamerId,
      req.query.customProperties
    )
    .spread((data) => res.json({ list: data }))
    .catch(next)
    .done()
);

route.get("/game/:game/matches/domain/:domain/count", (req, res, next) =>
  xtralife.api.match
    .count(
      req.dom,
      req.query.hideFinished || false,
      req.query.gamerId,
      req.query.customProperties
    )
    .then((count) => res.json({ total: count }))
    .catch(next)
    .done()
);

route.get("/game/:game/matches/:matchid", (req, res, next) =>
  xtralife.api.match
    .getMatch(req.match_id)
    .then((data) => res.json(data))
    .catch(next)
    .done()
);

route.delete("/game/:game/matches/:matchid", (req, res) =>
  xtralife.api.match._forceDeleteMatch(req.match_id, (err) => res.json({}))
);

route.put("/game/:game/matches/:matchid", (req, res, next) =>
  xtralife.api.match
    .updateMatch(req.match_id, req.body)
    .then((match) => res.json(match))
    .catch(next)
    .done()
);

// Store / products
route.get(
  "/game/:game/store/products",
  downloadable("inapp"),
  (req, res, next) =>
    xtralife.api.store.listProducts(
      req.game,
      parseInt(req.query.skip),
      parseInt(req.query.limit),
      function (err, count, products) {
        if (err != null) {
          return next(err);
        }
        return res.json({ total: count, list: products });
      }
    )
);

route.put("/game/:game/store/products", (req, res, next) =>
  xtralife.api.store.setProducts(req.game, req.body, function (err, count) {
    if (err != null) {
      return next(err);
    }
    return res.json({ total: count });
  })
);

route.post("/game/:game/store/products", (req, res, next) =>
  xtralife.api.store.addProduct(
    req.game,
    req.body,
    function (err, addedProduct) {
      if (err != null) {
        return next(err);
      }
      return res.json({ product: addedProduct });
    }
  )
);

route.put("/game/:game/store/products/:productid", (req, res, next) =>
  xtralife.api.store.updateProduct(
    req.game,
    req.params.productid,
    req.body,
    function (err, modifiedProduct) {
      if (err != null) {
        return next(err);
      }
      return res.json({ product: modifiedProduct });
    }
  )
);

route.delete("/game/:game/store/products/:productid", (req, res, next) =>
  xtralife.api.store.deleteProduct(
    req.game,
    req.params.productid,
    function (err, result) {
      if (err != null) {
        return next(err);
      }
      return res.json({ ok: 1 });
    }
  )
);

module.exports = route;
