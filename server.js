const express = require('express');
require('dotenv').config();
const jwt = require('express-jwt'); //Validate jwt and set req.user
const jwksRsa = require('jwks-rsa'); //Retrieve RSA keys from a JSON Web key set (JWKS) endpoint
const checkScope = require('express-jwt-authz');

const checkjwt = jwt({
    //Dynamically provide a signing key based on the kid in the header
    //and the signing keys provided by the jwkys endpoint
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${
            process.env.REACT_APP_AUTH0_DOMAIN
        }/.well-known/jwks.json`
    }),

    //Validate the audience and the issuer
    audience: process.env.REACT_APP_AUTH0_AUDIENCE,
    issuer: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/`,
    algorithms: ["RS256"]
})

const app = express();

app.get('/public', function(req, res){
    res.json({
        message: 'Hello from publicAPI'
    });
});

app.get('/private', checkjwt, function(req, res){
    res.json({
        message: 'Hello from privateAPI'
    });
});

function checkRole(role){
    return function(req, res, next){
        const assignedRoles = req.user["http://localhost:3000/roles"];
        if(Array.isArray(assignedRoles) && assignedRoles.includes(role)){
            return next();
        }else{
            return res.status(401).send("Insufficient role");
        }
    }
}

app.get('/course', checkjwt, checkScope(["read:courses"]), function(req, res){
    res.json({
        courses: [
            {id: 1, title: "Building Apps with React"},
            {id: 2, title: "Creating reusable react components"}
        ]
    });
});

app.get('/admin', checkjwt, checkRole('admin'), function(req, res){
    res.json({
        message: 'Hello from Admin API'
    });
});

app.listen(3001);
console.log("API server listening on " + process.env.REACT_APP_API_URL);
