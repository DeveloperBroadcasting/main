// Escentials
var express = require('express');
var router = express.Router();
var crypto = require('crypto');

// Mongo Types
var ObjectID = require('mongodb').ObjectID;

// Mongo connector and collection binder
var MongoClient = require('../mongoClient');
var Posts, Users;
MongoClient.on('connect', function(err, db) {
	if(!err) {
		Posts = db.collection('posts');
		Users = db.collection('users');
	}
});

// End Initializers

function md5(text) {
	return crypto
		.createHash('md5')
		.update(text)
		.digest('hex');
}
// Developers quick user add :D
router.get('/createuser', function(req, res, next) {
	var user = {
		name: 'Shannon K',
		username: 'sowen',
		password: md5('password'),
		signature:'For the Lulz',
		updated:new Date(),
		created:new Date()
	}
	Users.insert(user, function(err, results) {
		res.send(results);
	})
})

// Display login page
router.get('/login', function(req, res, next) {
	if(req.user) {
		console.log(res.redirect);
		res.redirect('/');
		return;
	}
	res.render('default/login');
})

// Handle login submittion request
router.post('/login', function(req, res, next) {
	if( !(/^[A-Za-z0-9_-]*$/.test(req.body.username))) {
		res.redirect('/login');
		return;
	}

	Users.findOne({
		username:req.body.username,
		password:md5(req.body.password)
	}, function(err, user) {
		if(err || !user) {
			res.redirect('/login');
			return;
		}
		req.session._id = user._id.toString()
		res.redirect('/admin');
	})
});

// Handle logout
router.get('/logout', function(req, res, next) {
	req.session.destroy(function(err) {
		res.redirect('/');
	})
})


// Index
router.get('/', function(req, res, next) {
	var page = parseInt(req.query.page);
	var limit = parseInt(req.query.limit) || 10;
	var skip = (page-1)*limit;

	skip = skip >= 0 ? skip : 0;
	limit = limit < 25 && limit > 0 ? limit : 10;

	Posts.find({})
		.sort({
			"created":-1
		})
		.skip(skip)
		.limit(limit)
		.toArray(function(err, posts) {
			console.log(posts);
			res.render('default/posts/index', { posts:posts }, function(err, body) {
				console.log(body);
				res.render('default/index', { sidebar:'Soon', body: body });
			})

		})
});

// Single Post View using id
router.get('/post/:id', function(req, res, next) {
	var id = new ObjectID(req.params.id);
	Posts.findOne({
		_id: id
	}, function(err, post) {
		res.render('default/posts/single', { post:post }, function(err, body) {
			res.render('default/index', { sidebar:'Soon', body: body });
		})
	})
})

// Single Post View using permalink
router.get('*', function(req, res, next) {
	Posts.findOne({
		permalink: req.path
	}, function(err, post) {
		res.render('default/posts/single', { post:post }, function(err, body) {
			console.log(err);
			res.render('default/index', { sidebar:'Soon', body: body });
		})
	})
})


router.post('/post/:id', function(req, res, next) {
	var id = new ObjectID(req.params.id);
	Posts.findOne({
		_id: id
	}, function(err, post) {
		if(err || !post) {
			res.render('default/posts/single', { post:post }, function(err, body) {
				res.render('default/index', { sidebar:'Soon', body: body });
			})
			return;
		}
		var comment = {
			name:req.body.name,
			email:req.body.email,
			hideEmail:req.body.hideEmail=='yes',
			twitter:req.body.twitter,
			twitchtv:req.body.twitchtv,
			secret:req.body.secret,
			comment:req.body.comment,
			created:new Date()
		}
		if(post.comments==undefined) {
			var update = {
				$set:{
					comments:[comment]
				}
			}
		} else {
			var update = {
				$push:{
					comments:comment
				}
			}
		}
		Posts.update({
			_id: post._id
		}, update, function(err, success) {
			res.redirect(req.path);
		})
	})
})
// Single Post View using permalink
router.post('*', function(req, res, next) {
	Posts.findOne({
		permalink: req.path
	}, function(err, post) {
		if(err || !post) {
			res.render('default/posts/single', { post:post }, function(err, body) {
				console.log(err);
				res.render('default/index', { sidebar:'Soon', body: body });
			})
			return;
		}
		var comment = { // Add validation for comments
			name:req.body.name,
			email:req.body.email,
			hideEmail:req.body.hideEmail=='yes',
			twitter:req.body.twitter,
			twitchtv:req.body.twitchtv,
			secret:req.body.secret,
			comment:req.body.comment,
			created:new Date()
		}
		if(post.comments==undefined) {
			var update = {
				$set:{
					comments:[comment]
				}
			}
		} else {
			var update = {
				$push:{
					comments:comment
				}
			}
		}
		Posts.update({
			_id: post._id
		}, update, function(err, success) {
			res.redirect(req.path);
		})
	})
})

module.exports = router;
