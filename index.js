var express = require('express');
var app = express();


// Exercise 1: Getting started!
// -----------------------------------------------------------------------------
// Create a web server that can listen to requests for /hello, and respond with some HTML that says <h1>Hello World!</h1>

app.get('/hello', function (req, res) {
  res.send('<h1>Hello World!</h1>');
});


// Exercise 2: A wild parameter has appeared!
// -----------------------------------------------------------------------------
// Create a web server that can listen to requests for /hello?name=firstName, and respond with some HTML that says <h1>Hello _name_!</h1>. For example, if a client requests /hello/John, the server should respond with <h1>Hello John!</h1>.

function sayHelloTo(name) {
    return "<h1>hello " + name + "!</h1>";
}

app.get('/hello/:name', function(request, response) {
    var name = request.params.name;
    var result = sayHelloTo(name);
    response.send(result);
});


// Exercise 3: Operations
// -----------------------------------------------------------------------------
// Create a web server that can listen to requests for /calculator/:operation?num1=XX&num2=XX and respond with a JSON object that looks like the following. For example, /op/add?num1=31&num2=11:

function mathFn(oper, num1, num2) {
  var result = {
    "operator": oper,
    "firstOperand": num1,
    "secondOperand": num2,
  };
  if(oper === "add") {
    result.solution = num1+num2;
    return result;
  }
  else if(oper === "sub") {
    result.solution = num1-num2;
    return result;
  }
  else if(oper === "mult") {
    result.solution = num1*num2;
    return result;
  }
  else if(oper === "div") {
    result.solution = num1/num2;
    return result;
  }
  else {
    return "error";
  }
}

app.get('/op/:operation/:num1/:num2', function(request, response) {
  var oper = request.params.operation;
  var num1 = Number(request.params.num1);
  var num2 = Number(request.params.num2);
  console.log(typeof num2);
  
  var result = mathFn(oper, num1, num2);
  
  if (result === "error" ) {
    response.status(404); 
    response.send("<h2>ERROR: please choose an operator from <i>'add, sub, mult, div'</i></h2>");
  }
  else {
    response.send(result);
  }
});

// => /op/add/31/11
// => operator	"add"
//    firstOperand	"31"
//    secondOperand	"11"
//    solution	"3111"


// Exercise 4: Retrieving data from our database
// -----------------------------------------------------------------------------
// Using something similar to your getHomepage function, or even directly the function itself, retrieve the latest 5 posts by createdAt date, including the username who created the content.

// Once you have the query, create an endpoint in your Express server which will respond to GET requests to /posts. The Express server will use the MySQL query function to retrieve the array of contents. Then, you should build a string of HTML that you will send with the request.send function.

// load the mysql library
var mysql = require('mysql');

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'molecularcode',
  password : '',
  database : 'reddit',
  debug    : false
});

function getPosts(callback) {
  connection.query(`
    SELECT p.id AS pId, p.title AS pTitle, p.url AS pURL, p.userId AS pUserId, p.createdAt AS pCreatedAt, p.updatedAt AS pUpdatedAt, u.username AS uUsername
    FROM posts AS p
    LEFT JOIN users AS u ON u.id = p.userId
    ORDER BY p.createdAt DESC
    LIMIT 5;
    `, function(err, results) {
    if (err) {
      callback(err);
    }
    else {
      var posts = results.map(function(results) {
        var pObj = {
          "id": results.pId,
          "title": results.pTitle,
          "url": results.pURL,
          "userId": results.pUserId,
          "createdAt": results.pCreatedAt,
          "updatedAt": results.pUpdatedAt,
          "username": results.uUsername
        };
        return pObj;
      });
      callback(null, posts);
    }
  });
}

function postToHTML(result) {
  var htmlStart = '<div id="contents"> <h1>List of contents</h1> <ul class="contents-list">';
  var htmlEnd = '</ul> </div>';
  var postHTML = result.map(function(res){
    return (
      `<li class="content-item">
        <h2 class="content-item__title"><a href="${res.url}">${res.title}</a></h2>
        <p>Created by ${res.username} </p>
      </li>`);
  });
  return (htmlStart + postHTML.join('') + htmlEnd);
}

app.get('/posts', function(req, res) {
  getPosts(function(err, result) {
    if (err) {
      res.status(500).send('<h2>ERROR!</h2>');
    }
    else {
      res.send(postToHTML(result));
    }
  });
});


// Exercise 5: Creating a "new content" form
// -----------------------------------------------------------------------------
// In this exercise, we're going to use Express to simply send an HTML file to our user containing a <form>

app.get('/createContent', function(req, res) {
  var options = {
    root: __dirname + '/'
  };

  //var fileName = req.params.name;
  res.sendFile('form.html', options, function(err) {
    if (err) {
      res.status(500).send('<h2>ERROR!</h2>' + err);
    }
    else {
      console.log('Sent: form.html');
    }
  });
});


/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});