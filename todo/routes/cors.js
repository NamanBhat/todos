const express = require('express');
const cors = require('cors');
const app = express();

const whiteList = ['http://localhost:4000','https://localhost:4443','http://localhost:4200'];
var corsOptionsDelegate = (req, callback) => {
	var corsOptions;

    if(whiteList.indexOf(req.header('Origin')) !== -1){
    	corsOptions = { origin: true };
    }

    else{
    	corsOptions = { origin: false};
    }
    callback(null,corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
