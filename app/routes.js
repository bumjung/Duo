/*
/api/users/:user_id                         GET     Get a single user.
/api/users/:user_id/projects                GET     Get all the projects.
/api/users/:user_id/projects/:p_name        POST    Create a project.
/api/users/:user_id/projects/:p_name        DELETE  Delete a project.
*/

module.exports = function(router, User, ObjectId){
	router.route('/user/:user_id/projects')
	    .get(function(req, res){
	        User.findOne({ _id: req.params.user_id, }, function(err, user){
	            res.json({projects : user.projects, message: "success"});
	        });
	    });

	router.route('/user/:user_id/projects/:p_name')
	    .post(function(req, res) {
	        User.update({ _id: req.params.user_id },
	            {
	                "$push": {
	                    projects: {
	                        name: req.params.p_name,
	                        created: Date.now(),
	                        authors:[req.params.user_id]
	                    }
	                }
	            }, function(err, response) {
	                if(err) console.log(err);
	                else res.json({response: response});
	        });
	    });

	router.route('/user/:user_id/projects/:p_id')
	    .delete(function(req, res){
	            User.update({ _id: ObjectId(req.params.user_id)},
	                {
	                    "$pull": {
	                        projects: {
	                            _id : ObjectId(req.params.p_id)
	                        }
	                    }
	                }, function(err, response){
	                    if(err) console.log(err);
	                    else res.json({response: response});
	            });
	    });
}