var express = require('express');
var app = express();


// Exercise 1: Getting started!
// -----------------------------------------------------------------------------
// Create a web server that can listen to requests for /hello, and respond with some HTML that says <h1>Hello World!</h1>

app.get('/hello', function (req, res) {
  res.send('<h1>Hello World!</h1>');
});


// Exercise 2: A wild parameter has appeared!
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
    return "error - please choose an operator from 'add, sub, mult, div";
  }
}

app.get('/op/:operation/:num1/:num2', function(request, response) {
  var oper = request.params.operation;
  var num1 = request.params.num1;
  var num2 = request.params.num2;
  
  var result = mathFn(oper, num1, num2);
  response.send(result);
});

// => /op/add/31/11
// => operator	"add"
//    firstOperand	"31"
//    secondOperand	"11"
//    solution	"3111"




/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});