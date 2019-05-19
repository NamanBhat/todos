const express = require('express');
const bodyParser=require('body-parser');
const mongoose = require('mongoose');
const authenticate=require('../authenticate');
const todos = require('../models/todo');
var User = require('../models/user');
const todoRouter =express.Router();
const cors = require('./cors');

todoRouter.use(bodyParser.json());

todoRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(authenticate.verifyUser,cors.cors,(req,res,next)=>{
	todos.findOne({user: req.user._id})
	.populate('user')
	.then((todo)=>{
		res.statusCode=200;
		res.setHeader('Content-Type','application/json');
		res.json(todo);
		console.log(todo);
	},(err)=>next(err))
	.catch((err)=>next(err));
})
.post(cors.corsWithOptions,
	  authenticate.verifyUser,
	  (req,res,next)=>{
	todos.findOne({ user: req.user._id })
	.then((todo)=>{
		if(!todo)
	       {
	       	todos.create({"user": req.user._id})
	       .then((todo)=>{
				todo.tasks.push(req.body);
			    todo.save()
			    .then((todo)=>{
			      
		    		console.log('todo created: ',todo.toObject());
					res.statusCode=200;
					res.setHeader('Content-Type','application/json');
					res.json(todo);
			    },(err)=>next(err))
			},(err)=>next(err))
	       }
	       else{
	       	todo.tasks.push(req.body);
		    todo.save()
		    .then((todo)=>{
	    		console.log('todo created: ',todo.toObject());
				res.statusCode=200;
				res.setHeader('Content-Type','application/json');
				res.json(todo);
		    },(err)=>next(err))
	       }
			
	       
	},(err)=>next(err))
	.catch((err)=>next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
	res.statusCode=403;
	res.end('PUT operation not supported on /todo');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    todos.findOneAndRemove({"user": req.user._id})
	.then((resp)=>{
		res.statusCode=200;
		res.setHeader('Content-Type','application/json');
		res.json(resp);
	},(err)=>next(err))
	.catch((err)=>next(err));
});

todoRouter.route('/reorder/:old/:new')
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
	todos.findOne({user: req.user._id})
	.populate('user')
	.then((todo)=>{
	    if(old>=0&&old<todo.tasks.length&&newp>=0&&newp<todo.tasks.length){
	    	var temp=todo.tasks[old];
	        todo.tasks[old]=todo.tasks[newp];
	        todo.tasks[newp]=temp;
	        todo.update({id: todo._id},{ $set: {tasks: todo.tasks}});
	    }
        else{
    		err=new Error('This reordering not permitted!');
        	err.status=403;
        	return next(err);
    	}
	},(err)=>next(err))
});
todoRouter.route('/tasks')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,authenticate.verifyUser,(req,res,next)=>{
	todos.findOne({ user: req.user._id })
	.populate('user')
	.then((todo)=>{
		res.statusCode=200; 
		res.setHeader('Content-Type','application/json');
		res.json(todo.tasks);
	},(err)=>next(err))
	.catch((err)=>next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
	res.statusCode=403;
	res.end('PUT operation not supported ');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    todos.findOne({ user: req.user._id })
	.then((todo)=>{
		if(todo!=null){

			for(var i=(todo.tasks.length-1);i>=0;i--)
			    {
			    	    todo.tasks.id(todo.tasks[i]._id).remove();
			    }
	        todo.save()
	        .then((todo)=>{
				res.statusCode=200;
				res.setHeader('Content-Type','application/json');
		        res.json(todo); 
	        },(err)=>next(err));
		
	    }
        else{
        	err=new Error('NO TODO EXISTS');
        	err.status=404;
        	return next(err);
        } 
	},(err)=>next(err))
	.catch((err)=>next(err)); 
});

todoRouter.route('/tasks/:taskId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next)=>{
	todos.findOne({ user: req.user._id })
	.populate('user')
	.then((todo)=>{
		if(todo!=null&&todo.tasks.id(req.params.taskId)!=null){
			res.statusCode=200; 
			res.setHeader('Content-Type','application/json');
			res.json(todo.tasks.id(req.params.taskId));
	    }
        else if(todo==null){
        	err=new Error('todo not found');
        	err.status=404;
        	return next(err);
        }
        else{
        	err=new Error('task '+req.params.taskId+' not found');
        	err.status=404;
        	return next(err);
        }
	},(err)=>next(err))
	.catch((err)=>next(err)); 
})
.post(authenticate.verifyUser,(req,res,next)=>{
	res.statusCode=403;
	res.end('POST operation not supported on /todo/tasks/'+req.params.taskId);
})
.put(authenticate.verifyUser,(req,res,next)=>{
	todos.findOne({ user: req.user._id })
	.then((todo)=>{
		if(todo!=null&&todo.tasks.id(req.params.taskId)!=null){
		    

				    if(req.body.todo){
		                todo.tasks.id(req.params.taskId).todo=req.body.todo;
				    }

		            if(req.body.description){
		                todo.tasks.id(req.params.taskId).description=req.body.description;
		            }

		            if(req.body.date){
		                todo.tasks.id(req.params.taskId).date=req.body.date;
		            }

            

				    todo.save()
		            .then((todo)=>{
				       todos.findById(todo._id)
		    	      .populate('user')
		    	      .then((todo)=>{
		    	      	res.statusCode=200;
						res.setHeader('Content-Type','application/json');
				        res.json(todo); 
		    	      }) 
		            },(err)=>next(err));
            
	    }

        else if(todo==null){
        	err=new Error('todo not found or does not belong to you');
        	err.status=404;
        	return next(err);
        }
        else{
        	err=new Error('task '+req.params.taskId+' not found');
        	err.status=404;
        	return next(err);
        }
	},(err)=>next(err))
	.catch((err)=>next(err)); 
})
.delete(authenticate.verifyUser,(req,res,next)=>{
    todos.findOne({ user: req.user._id })
	.then((todo)=>{
		if(todo!=null&&todo.tasks.id(req.params.taskId)!=null)
		{

			todo.tasks.id(req.params.taskId).remove();
	        todo.save()
            .then((todo)=>{
		       todos.findById(todo._id)
    	      .populate('user')
    	      .then((todo)=>{
    	      	res.statusCode=200;
				res.setHeader('Content-Type','application/json');
		        res.json(todo); 
    	      }) 
            },(err)=>next(err));
            
	    }

        else if(todo==null){
        	err=new Error('todo not found or does not belong to you');
        	err.status=404;
        	return next(err);
        }
        else{
        	err=new Error('task '+req.params.taskId+' not found');
        	err.status=404;
        	return next(err);
        }
	
	},(err)=>next(err))
	.catch((err)=>next(err));  
});

todoRouter.route('/permissions')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,authenticate.verifyUser,(req,res,next)=>{
	User.findOne({ _id: req.user._id })
	.populate('permittedviewers')
    .populate('permittedcreators')
    .populate('permittededitors')
    .populate('permitteddeleters')
	.then((user)=>{
		res.statusCode=200; 
		res.setHeader('Content-Type','application/json');
		res.json(user);
	},(err)=>next(err))
	.catch((err)=>next(err));
});

todoRouter.route('/permissions/:perm_id')
.post(authenticate.verifyUser,(req,res,next)=>{
    User.findOne({ _id: perm_id })
    .then((perm)=>{
    	if(perm){
    		User.findOne({ _id: req.user._id })
		    .then((user)=>{
                if(req.body.view_allow===true){
		                user.permittedviewers.push(perm_id)
		                .populate('permittedviewers')
		                .then((user)=>{
                            res.statusCode=200; 
							res.setHeader('Content-Type','application/json');
							res.json(user);
						},(err)=>next(err))
				    }

                if(req.body.create_allow===true){
		                user.permittedcreators.push(perm_id)
		                .populate('permittedviewers')
		                .populate('permittedcreators')
		                .then((user)=>{
                            res.statusCode=200; 
							res.setHeader('Content-Type','application/json');
							res.json(user);
						},(err)=>next(err))
				    }
				if(req.body.edit_allow===true){
		                user.permittededitors.push(perm_id)
		                .populate('permittedviewers')
		                .populate('permittedcreators')
		                .populate('permittededitors')
		                .then((user)=>{
                            res.statusCode=200; 
							res.setHeader('Content-Type','application/json');
							res.json(user);
						},(err)=>next(err))
				    }
                if(req.body.delete_allow===true){
		                user.permitteddeleters.push(perm_id)
		                .populate('permittedviewers')
		                .populate('permittedcreators')
		                .populate('permittededitors')
		                .populate('permitteddeleters')
		                .then((user)=>{
                            res.statusCode=200; 
							res.setHeader('Content-Type','application/json');
							res.json(user);
						},(err)=>next(err))
				    }
		    })
    	} 
    	else{
    		err=new Error('User '+req.params.perm_Id+' not found');
        	err.status=404;
        	return next(err);
    	}
	    
    },(err)=>next(err))
	.catch((err)=>next(err));
});



todoRouter.route('/perm_mode/:userId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(authenticate.verifyUser,cors.cors,(req,res,next)=>{
	User.find({user: userId},{permittedviewers: {"$in" : [req.user._id]}})
	.then((user)=>{
		if(user){
			todos.findOne({user: userId})
			.populate('user')
			.then((todo)=>{
				res.statusCode=200;
				res.setHeader('Content-Type','application/json');
				res.json(todo);
				console.log(todo);
			},(err)=>next(err))
		}
		else{
            err=new Error('You are not authorized to view this person\'s todo!');
        	err.status=403;
        	return next(err);
		}
	},(err)=>next(err))
    .catch((err)=>next(err));
	
})
.post(cors.corsWithOptions,
	  authenticate.verifyUser,
	  (req,res,next)=>{
    User.find({user: userId},{permittedcreators: {"$in" : [req.user._id]}})
	.then((user)=>{
		if(user){
			todos.findOne({ user: userId })
			.then((todo)=>{
				if(!todo)
			       {
			       	todos.create({"user": req.user._id})
			       .then((todo)=>{
						todo.tasks.push(req.body);
					    todo.save()
					    .then((todo)=>{
				    		console.log('todo created: ',todo.toObject());
							res.statusCode=200;
							res.setHeader('Content-Type','application/json');
							res.json(todo);
					    },(err)=>next(err))
					},(err)=>next(err))
			       }
			       else{
			       	todo.tasks.push(req.body);
				    todo.save()
				    .then((todo)=>{
			    		console.log('todo created: ',todo.toObject());
						res.statusCode=200;
						res.setHeader('Content-Type','application/json');
						res.json(todo);
				    },(err)=>next(err))
			       }
					
			       
			},(err)=>next(err))
		}
		else{
            err=new Error('You are not authorized to create this person\'s todo!');
        	err.status=403;
        	return next(err);
		}
	},(err)=>next(err))
    .catch((err)=>next(err));

})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
	res.statusCode=403;
	res.end('PUT operation not supported on /todo');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    User.find({user: userId},{permitteddeleters: {"$in" : [req.user._id]}})
	.then((user)=>{
		if(user){
			todos.findOneAndRemove({"user": userId})
			.then((resp)=>{
				res.statusCode=200;
				res.setHeader('Content-Type','application/json');
				res.json(resp);
			},(err)=>next(err))
		}
		else{
            err=new Error('You are not authorized to delete this person\'s todo!');
        	err.status=403;
        	return next(err);
		}
	},(err)=>next(err))
    .catch((err)=>next(err));
});

todoRouter.route('/perm_mode/:userId/reorder/:old/:new')
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
   	User.find({user: userId},{permittededitors: {"$in" : [req.user._id]}})
	.then((user)=>{
		if(user){
			todos.findOne({user: userId})
			.populate('user')
			.then((todo)=>{
		    if(old>=0&&old<todo.tasks.length&&newp>=0&&newp<todo.tasks.length){
		    	var temp=todo.tasks[old];
		        todo.tasks[old]=todo.tasks[newp];
		        todo.tasks[newp]=temp;
		        todo.update({id: todo._id},{ $set: {tasks: todo.tasks}});
		    }
	        else{
	    		err=new Error('This reordering not permitted!');
	        	err.status=403;
	        	return next(err);
	    	}
		},(err)=>next(err))
		}
		else{
            err=new Error('You are not authorized to edit this person\'s todo!');
        	err.status=403;
        	return next(err);
		}
	},(err)=>next(err))
    .catch((err)=>next(err));
	
});
todoRouter.route('/perm_mode/:userId/tasks')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,authenticate.verifyUser,(req,res,next)=>{
   	User.find({user: userId},{permittedviewers: {"$in" : [req.user._id]}})
	.then((user)=>{
		if(user){
			todos.findOne({user: userId})
			.populate('user')
			.then((todo)=>{
				res.statusCode=200;
				res.setHeader('Content-Type','application/json');
				res.json(todo.tasks);
				console.log(todo);
			},(err)=>next(err))
		}
		else{
            err=new Error('You are not authorized to view this person\'s todo!');
        	err.status=403;
        	return next(err);
		}
	},(err)=>next(err))
    .catch((err)=>next(err));

})
.put(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
	res.statusCode=403;
	res.end('PUT operation not supported ');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    User.find({user: userId},{permitteddeleters: {"$in" : [req.user._id]}})
	.then((user)=>{
		if(user){
			todos.findOne({user: userId})
			.then((todo)=>{
			if(todo!=null){

				for(var i=(todo.tasks.length-1);i>=0;i--)
				    {
				    	    todo.tasks.id(todo.tasks[i]._id).remove();
				    }
		        todo.save()
		        .then((todo)=>{
					res.statusCode=200;
					res.setHeader('Content-Type','application/json');
			        res.json(todo); 
		        },(err)=>next(err));
			
		    }
	        else{
	        	err=new Error('NO TODO EXISTS');
	        	err.status=404;
	        	return next(err);
	        } 
		},(err)=>next(err))
		}
		else{
            err=new Error('You are not authorized to delete this person\'s todo!');
        	err.status=403;
        	return next(err);
		}
	},(err)=>next(err))
    .catch((err)=>next(err));
});

todoRouter.route('/perm_mode/:userId/tasks/:taskId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next)=>{
   	User.find({user: userId},{permittedviewers: {"$in" : [req.user._id]}})
	.then((user)=>{
		if(user){
			todos.findOne({user: userId})
			.populate('user')
			.then((todo)=>{
				if(todo!=null&&todo.tasks.id(req.params.taskId)!=null){
					res.statusCode=200; 
					res.setHeader('Content-Type','application/json');
					res.json(todo.tasks.id(req.params.taskId));
			    }
		        else if(todo==null){
		        	err=new Error('todo not found');
		        	err.status=404;
		        	return next(err);
		        }
		        else{
		        	err=new Error('task '+req.params.taskId+' not found');
		        	err.status=404;
		        	return next(err);
		        }
			},(err)=>next(err))
		}
		else{
            err=new Error('You are not authorized to view this person\'s todo!');
        	err.status=403;
        	return next(err);
		}
	},(err)=>next(err))
    .catch((err)=>next(err));
})
.post(authenticate.verifyUser,(req,res,next)=>{
	res.statusCode=403;
	res.end('POST operation not supported on /todo/tasks/'+req.params.taskId);
})
.put(authenticate.verifyUser,(req,res,next)=>{
    User.find({user: userId},{permittededitors: {"$in" : [req.user._id]}})
	.then((user)=>{
		if(user){
			todos.findOne({user: userId})
			.then((todo)=>{
				if(todo!=null&&todo.tasks.id(req.params.taskId)!=null){
				    

						    if(req.body.todo){
				                todo.tasks.id(req.params.taskId).todo=req.body.todo;
						    }

				            if(req.body.description){
				                todo.tasks.id(req.params.taskId).description=req.body.description;
				            }

				            if(req.body.date){
				                todo.tasks.id(req.params.taskId).date=req.body.date;
				            }

		            

						    todo.save()
				            .then((todo)=>{
						       todos.findById(todo._id)
				    	      .populate('user')
				    	      .then((todo)=>{
				    	      	res.statusCode=200;
								res.setHeader('Content-Type','application/json');
						        res.json(todo); 
				    	      }) 
				            },(err)=>next(err));
		            
			    }

		        else if(todo==null){
		        	err=new Error('todo not found or does not belong to you');
		        	err.status=404;
		        	return next(err);
		        }
		        else{
		        	err=new Error('task '+req.params.taskId+' not found');
		        	err.status=404;
		        	return next(err);
		        }
			},(err)=>next(err))
		}
		else{
            err=new Error('You are not authorized to edit this person\'s todo!');
        	err.status=403;
        	return next(err);
		}
	},(err)=>next(err))
    .catch((err)=>next(err));

})
.delete(authenticate.verifyUser,(req,res,next)=>{
    	User.find({user: userId},{permitteddeleters: {"$in" : [req.user._id]}})
	.then((user)=>{
		if(user){
			todos.findOne({ user: userId })
			.then((todo)=>{
				if(todo!=null&&todo.tasks.id(req.params.taskId)!=null)
				{

					todo.tasks.id(req.params.taskId).remove();
			        todo.save()
		            .then((todo)=>{
				       todos.findById(todo._id)
		    	      .populate('user')
		    	      .then((todo)=>{
		    	      	res.statusCode=200;
						res.setHeader('Content-Type','application/json');
				        res.json(todo); 
		    	      }) 
		            },(err)=>next(err));
		            
			    }

		        else if(todo==null){
		        	err=new Error('todo not found or does not belong to you');
		        	err.status=404;
		        	return next(err);
		        }
		        else{
		        	err=new Error('task '+req.params.taskId+' not found');
		        	err.status=404;
		        	return next(err);
		        }
			
			},(err)=>next(err))
		}
		else{
            err=new Error('You are not authorized to delete this person\'s todo!');
        	err.status=403;
        	return next(err);
		}
	},(err)=>next(err))
    .catch((err)=>next(err));
});




module.exports=todoRouter;