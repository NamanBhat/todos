TODO  REST API (made by: 2017UCO1555[Naman Bhat])


To install all dependencies run the command 'npm install' in command terminal.

Requirements met
1. Token based User authentication: uses JWT Tokens
2.Functionalities implemented(mainly using dishRouter in routes folder):
    a) add a todo:
          post method on end points 'https://localhost:3443/todo'
    b)edit a todo:
          put method on end points 'https://localhost:3443/todo/tasks/taskId'
    c)reordering todos:
          put method on end points 'https://localhost:3443/todo/reorder/:old/:new'
    d)delete a todo:
          delete method on end points 'https://localhost:3443/todo', 'https://localhost:3443/todo/tasks', 'https://localhost:3443/todo/tasks/taskId'
    e)viewing a todo:
          get method on end points 'https://localhost:3443/todo', 'https://localhost:3443/todo/tasks', 'https://localhost:3443/todo/tasks/taskId'
     f)granting permissions:
        post method on end point 'https://localhost:3443/todo/permissions/perm_id'
        also the request body should have boolean fields - 'view_allow','edit_allow','delete_allow','create_allow'
3.All data stored in MongoDB: 
   => On your system in the same path were the this folder is stored, create a folder 'mongodb', with subfolder 'data'. 
    =>To run mongo server while using this API server,goto command line and type "mongod --dbpath=data --bind_ip 127.0.0.1" and hit enter.
4.Permissions for each operation in point 2 implemented in dishRouter:
    for operating in permissions mode precede your endpoint with 'https://localhost:3443/todo/perm_mode/:userId'
5.Proper Error Handling with Status Code



Testing : This application was tested using 'Postman'