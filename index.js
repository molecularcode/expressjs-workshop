// node module
var express = require('express');
// create an instance of the web server
var app = express();


// Exercise 1: Getting started!
// -----------------------------------------------------------------------------
// Create a web server that can listen to requests for /hello, and respond with some HTML that says <h1>Hello World!</h1>

// display a sting (including html) on a webpage - url - /hello
app.get('/hello', function (req, res) {
  // show http header object with info like visitor IP, lang prefs etc.
  console.log(req.headers);
  res.send('<h1 style="color:#5F04B4;">Hello World!</h1>');
});


// Exercise 2: A wild parameter has appeared!
// -----------------------------------------------------------------------------
// Create a web server that can listen to requests for /hello?name=firstName, and respond with some HTML that says <h1>Hello _name_!</h1>. For example, if a client requests /hello/John, the server should respond with <h1>Hello John!</h1>.

// function to take a string passed as a parameter in a url and return a concatonated string
function sayHelloTo(name) {
    return "<h1>hello <i style='color: #5F04B4;'>" + name + "</i>!</h1>";
}

// display a concatonated string - url - /hello/Alex
app.get('/hello/:name', function(request, response) {
    var name = request.params.name;
    var result = sayHelloTo(name);
    response.send(result);
});


// Exercise 3: Operations
// -----------------------------------------------------------------------------
// Create a web server that can listen to requests for /calculator/:operation?num1=XX&num2=XX and respond with a JSON object that looks like the following. For example, /op/add?num1=31&num2=11:

// function to do 4 types of math operator on 2 numbers, takes the opperator as a string and 2 numbers, all as URL parameters, returns an object with new key-value
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

// display an object - url - /op/add/31/11
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

// function to take a callback and return the result of a DB query as an array of objects
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

// function to take an aray of objects and return a single string, including HTML
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

// first get the result of the DB query as an array of objects, then transform that into a single string, including HTML
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

// get the directory path for the file
app.get('/createContent', function(req, res) {
  var options = {
    root: __dirname + '/'
  };

  // send the html file to the webpage
  res.sendFile('form.html', options, function(err) {
    if (err) {
      res.status(500).send('<h2>ERROR!</h2>' + err);
    }
    else {
      return;
    }
  });
});


// Exercise 6: Receiving data from our form
// -----------------------------------------------------------------------------
//In this exercise, we will write our first POST endpoint. The resource will be the same, /createContent, but we will be writing a second endpoint using app.post instead.

// Once you are familiar with the contents of req.body, use a version of your createPost MySQL function to create a new post that has the URL and Title passed to you in the HTTP request. For the moment, set the user as being ID#1, or "John Smith".

// Once the data is inserted successfully, you have a few choices of what to do in your callback:

//     Use response.send("OK") to tell the browser that everything went well
//     Use response.send to send the actual post object that was created (received from the createPost function)
//     Use response.redirect to send the user back to the /posts page you setup in a previous exercise
//     challenge :) Using a response.redirect, redirect the user to the URL /posts/:ID where :ID is the ID of the newly created post. This is more challenging because now you have to implement the /posts/:ID URL! See if you can do that and return a single post only.


// load the middleware body-parser
var bodyParser = require('body-parser');
app.use(bodyParser());

// function to take the post object created by filling in and submitting the form.html page and insert it in to the DB
function createPost (post, callback) {
  connection.query(
    'INSERT INTO `posts` (`userId`, `title`, `url`, `createdAt`, `subredditId`) VALUES (?, ?, ?, ?, ?)', [post.userId, post.title, post.url, null, post.subredditId],
    function(err, result) {
      if (err) {
        callback(err);
      }
      else {
        /* Post inserted successfully. Let's use the result.insertId to retrieve the post and send it to the caller! */
        connection.query(
          'SELECT `id`,`title`,`url`,`userId`, `subredditId`, `createdAt`, `updatedAt` FROM `posts` WHERE `id` = ?', [result.insertId],
          function(err, result) {
            if (err) {
              callback(err);
            }
            else {
              callback(null, result[0]);
            }
          }
        );
      }
    }
  );
}

// take the inputs from filling in and submitting the form.html form and create a new post. If successful, redirect to the /posts page showing 5 most recent posts
app.post('/createContent', function(req, res) {
  var newURL = req.body.url;
  var newTitle = req.body.title;
  createPost({
      title: newTitle,
      url: newURL,
      userId: 1,
      subredditId: 8
    }, function(err, post) {
      if (err) {
        res.send('<h2>ERROR: post not created!</h2>' + err);
      }
      else {
        res.redirect('/posts');
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