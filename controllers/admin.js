var express = require('express');
var router = express.Router();
var MongoClient = require('../mongoClient');
var ObjectID = require('mongodb').ObjectID;

var Posts, Users;
MongoClient.on('connect', function(err, db) {
	Posts = db.collection('posts');
	Users = db.collection('users');
});

/* GET users listing. */
var controller = {};

controller.index = function(req, res, next) {
  res.render('admin/index', {  err:null, body:'soon' });
}

controller.posts = function(req, res, next) {
	var page = parseInt(req.query.page);
	var limit = parseInt(req.query.limit) || 10;
	var skip = (page-1)*limit;
	var field = req.query.sort || "created";
	var order = parseInt(req.query.order) || -1;
	var sort = {}
	sort[field] = order;

	skip = skip >= 0 ? skip : 0;
	limit = limit < 25 && limit > 0 ? limit : 10;

	Posts.find({})
		.sort(sort)
		.skip(skip)
		.limit(limit)
		.toArray(function(err, posts) {
			res.render('admin/posts/index', { err: null, posts:posts }, function(err, body) {
				res.render('admin/index', { err: err, body: body });
			})
		})
}

controller.addPostGET = function(req, res, next) {
	var post = {
		permalink: '',
	    title: '',
	    content: '',
		tags: [],
		files: []
	}
	res.render('admin/posts/single', {
		err:null,
		post:post
	}, function(err, body) {
		res.render('admin/index', {
			err:null,
			body: body
		});
	})
}

controller.editPostGET = function(req, res, next) {
	var id = new ObjectID(req.params.id);
	Posts.findOne({
		_id:id
	}, function(err, post) {
		res.render('admin/posts/single', {
			err:null,
			post:post
		}, function(err, body) {
			res.render('admin/index', {
				err:err,
				body: body
			});
		})
	})
}

controller.validatePost = function(req, res, next) {
	var PostSchema = {
		title:{
			type:'string',
			err:'Your title sucks'
		},
		permalink:{
			type:'string',
			validate: function(value) {
				return true;
			},
			err:'Your permalink stanks'
		},
		content:{
			type:'string',
			err:'Your content is too dramatic'
		}
	}
	for(key in PostSchema) {
		if(typeof req.body[key] == PostSchema[key].type) {
			if(!PostSchema[key].validate) {
				continue;
			}
			if(PostSchema[key].validate(req.body[key])) {
				continue;
			}
		}
		res.render('admin/posts/single', {
			err: PostSchema[key].err,
			post: req.body
		}, function(err, body) {
			res.render('admin/index', { err:null, body: body });
		})
		return;
	}
	var id = req.params.id.split('/')[1];
	console.log('all id', req.body);
	var query;
	if(id) {
		query = {
			'$and':[
				{ _id:{ '$ne': ObjectID(id) } },
				{ '$or':[{ permalink: req.body.permalink },{ title: req.body.title }] }
			]
		};
	} else {
		query = {
			$or:[
				{ permalink: req.body.permalink },
				{ title: req.body.title }
			]
		};
	}
	Posts.findOne(query, function(err, exists) {
		if(err || exists) {
			res.render('admin/posts/single', {
				err: err || 'Post already exists: '+exists.permalink,
				post: req.body
			}, function(err, body) {
				res.render('admin/index', { err: null, body: body });
			})
			return;
		}
		next();
	})
}

controller.addPostPOST = function(req, res, next) {
	var post = {
		permalink: req.body.permalink,
	    title: req.body.title,
	    content: req.body.content,
	    disableComments: false,
		tags: [],
		files: [],
		comments: [],
		updated: new Date(),
	    created: new Date(),
	    user: req.user._id.toString()
	}
	Posts.insert(post, function(error, result) {
		if(error) {
			res.render('admin/posts/single', { err:null, post:post }, function(err, body) {
				res.render('admin/index', {  err: error, body: body });
			})
			return;
		}
		res.redirect('/admin/posts');
	})
}

controller.editPostPOST = function(req, res, next) {
	var id = new ObjectID(req.params.id);
	var post = {
		permalink: req.body.permalink,
	    title: req.body.title,
	    content: req.body.content,
	    disableComments: false,
		tags: [],
		files: [],
		comments: [],
		updated: new Date(),
	    user: req.user._id.toString()
	}
	Posts.update({
		_id:id
	},{
		$set: post
	}, function(error, result) {
		if(error) {
			res.render('admin/posts/single', { err: null, post:post }, function(err, body) {
				res.render('admin/index', { err: error, body: body  });
			})
			return;
		}
		res.redirect('/admin/posts');
	})
}                                       

module.exports = controller;

