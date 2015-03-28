// Escentials
var express = require('express');
var router = express.Router();

//Controllers
var adminController = require('../controllers/admin');
var indexController = require('../controllers/index');

var routes = [
	{ method:'all', path:'/admin*', exec:function(req, res, next) {
			if(!req.user) {
				res.redirect('/login');
				return;
			}
			next();
		}
	},
	{ method:'get', path:'/admin', exec:adminController.index },
	{ method:'get', path:'/admin/posts', exec:adminController.posts },
	{ method:'get', path:'/admin/post/add', exec:adminController.addPostGET },
	{ method:'get', path:'/admin/post/edit/:id', exec:adminController.editPostGET },
	{ method:'all', path:'/admin/post/*/?:id?', exec:adminController.validatePost },
	{ method:'post', path:'/admin', exec:adminController.addPostPOST },
	{ method:'post', path:'/admin', exec:adminController.editPostPOST },
	{ method:'get', path:'/', exec:indexController.index },
	{ method:'get', path:'/login', exec:indexController.loginGET },
	{ method:'post', path:'/login', exec:indexController.loginPOST },
	{ method:'get', path:'/logout', exec:indexController.logout },
	{ method:'get', path:'/captcha', exec:indexController.captcha },
	{ method:'get', path:'/post/:id', exec:indexController.postIdGET },
	{ method:'get', path:'/[a-z0-9-_]+', exec:indexController.permalinkGET },
	{ method:'post', path:'/post/:id', exec:indexController.postIdPOST },
	{ method:'post', path:'/[a-z0-9-_]+', exec:indexController.permalinkPOST }
]

for(var i=0;i<routes.length;i++) {
	router[routes[i].method](routes[i].path, routes[i].exec);
}

module.exports = router;

