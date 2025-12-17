const questions = [
  {
    question: "Which type of JavaScript language is ___",
    options: ["Object-Oriented", "Object-Based", "Assembly-language", "High-level"],
    answer: "Object-Based",
    explanation: "JavaScript is an object-based language."
  },
  {
    question: "Which one of the following also known as Conditional Expression:",
    options: ["Alternative to if-else", "Switch statement", "If-then-else statement", "immediate if"],
    answer: "immediate if",
    explanation: "The conditional operator (?:) is often called the immediate if."
  },
  {
    question: "In JavaScript, what is a block of statement?",
    options: ["Conditional block", "block that combines a number of statements into a single compound statement", "both conditional block and a single statement", "block that contains a single statement"],
    answer: "block that combines a number of statements into a single compound statement",
    explanation: "A block is a set of statements enclosed in curly braces."
  },
  {
    question: "When interpreter encounters an empty statements, what it will do:",
    options: ["Shows a warning", "Prompts to complete the statement", "Throws an error", "Ignores the statements"],
    answer: "Ignores the statements",
    explanation: "Empty statements (just a semicolon) are ignored."
  },
  {
    question: "The \"function\" and \" var\" are known as:",
    options: ["Keywords", "Data types", "Declaration statements", "Prototypes"],
    answer: "Declaration statements",
    explanation: "They are used to declare functions and variables."
  },
  {
    question: "Which of the following variables takes precedence over the others if the names are the same?",
    options: ["Global variable", "The local element", "The two of the above", "None of the above"],
    answer: "The local element",
    explanation: "Local variables shadow global variables with the same name."
  },
  {
    question: "Which one of the following is the correct way for calling the JavaScript code?",
    options: ["Preprocessor", "Triggering Event", "RMI", "Function/Method"],
    answer: "Function/Method",
    explanation: "JavaScript code is typically executed by calling functions or methods."
  },
  {
    question: "Which of the following type of a variable is volatile?",
    options: ["Mutable variable", "Dynamic variable", "Volatile variable", "Immutable variable"],
    answer: "Mutable variable",
    explanation: "Mutable variables can be changed."
  },
  {
    question: "Which of the following option is used as hexadecimal literal beginning?",
    options: ["00", "0x", "0X", "Both 0x and 0X"],
    answer: "Both 0x and 0X",
    explanation: "Hexadecimal literals start with 0x or 0X."
  },
  {
    question: "In the JavaScript, which one of the following is not considered as an error:",
    options: ["Syntax error", "Missing of semicolons", "Division by zero", "Missing of Bracket"],
    answer: "Division by zero",
    explanation: "Division by zero in JavaScript returns Infinity, not an error."
  },
  {
    question: "Which of the following number object function returns the value of the number?",
    options: ["toString()", "valueOf()", "toLocaleString()", "toPrecision()"],
    answer: "valueOf()",
    explanation: "valueOf() returns the primitive value of the object."
  },
  {
    question: "In JavaScript the x===y statement implies that:",
    options: ["Both x and y are equal in value, type and reference address as well.", "Both are x and y are equal in value only.", "Both are equal in the value and data type.", "Both are not same at all."],
    answer: "Both are equal in the value and data type.",
    explanation: "=== checks for both value and type equality."
  },
  {
    question: "Choose the correct snippet from the following to check if the variable \"a\" is not equal the \"NULL\":",
    options: ["if(a!==null)", "if (a!)", "if(a!null)", "if(a!=null)"],
    answer: "if(a!==null)",
    explanation: "!== checks for inequality in value or type."
  },
  {
    question: "Which one of the following is an ternary operator:",
    options: ["?", ":", "-", "+"],
    answer: "?",
    explanation: "The conditional operator ? : is a ternary operator."
  },
  {
    question: "Which of the following is a valid type of function javascript supports?",
    options: ["named function", "anonymous function", "Both of the above", "None of the above"],
    answer: "Both of the above",
    explanation: "JavaScript supports both named and anonymous functions."
  },
  {
    question: "Which of the following is the correct syntax to create a cookie using JavaScript?",
    options: ["document.cookie = 'key1 = value1; key2 = value2; expires = date';", "browser.cookie = 'key1 = value1; key2 = value2; expires = date';", "window.cookie = 'key1 = value1; key2 = value2; expires = date';", "navigator.cookie = 'key1 = value1; key2 = value2; expires = date';"],
    answer: "document.cookie = 'key1 = value1; key2 = value2; expires = date';",
    explanation: "Cookies are accessed via document.cookie."
  },
  {
    question: "Which of the following is the correct syntax to read a cookie using JavaScript?",
    options: ["document.cookie", "browser.cookie", "window.cookie", "navigator.cookie"],
    answer: "document.cookie",
    explanation: "Reading document.cookie returns all cookies."
  },
  {
    question: "Which of the following is the correct syntax to delete a cookie using JavaScript?",
    options: ["document.cookie = 'key1 =; expires = Thu, 01 Jan 1970 00:00:00 UTC';", "browser.cookie = 'key1 =; expires = Thu, 01 Jan 1970 00:00:00 UTC';", "window.cookie = 'key1 =; expires = Thu, 01 Jan 1970 00:00:00 UTC';", "navigator.cookie = 'key1 =; expires = Thu, 01 Jan 1970 00:00:00 UTC';"],
    answer: "document.cookie = 'key1 =; expires = Thu, 01 Jan 1970 00:00:00 UTC';",
    explanation: "Setting the expiration date to the past deletes the cookie."
  },
  {
    question: "Which of the following is the correct syntax to redirect a url using JavaScript?",
    options: ["document.location='http://www.newlocation.com';", "browser.location='http://www.newlocation.com';", "navigator.location='http://www.newlocation.com';", "window.location='http://www.newlocation.com';"],
    answer: "window.location='http://www.newlocation.com';",
    explanation: "window.location is used for redirection."
  },
  {
    question: "Which of the following is the correct syntax to print a page using JavaScript?",
    options: ["window.print();", "browser.print();", "navigator.print();", "document.print();"],
    answer: "window.print();",
    explanation: "window.print() opens the print dialog."
  },
  {
    question: "Which of the following is the correct syntax to open a new window using JavaScript?",
    options: ["window.open('http://www.content.com');", "browser.open('http://www.content.com');", "navigator.open('http://www.content.com');", "document.open('http://www.content.com');"],
    answer: "window.open('http://www.content.com');",
    explanation: "window.open() opens a new browser window."
  },
  {
    question: "Which of the following is the correct syntax to close a window using JavaScript?",
    options: ["window.close();", "browser.close();", "navigator.close();", "document.close();"],
    answer: "window.close();",
    explanation: "window.close() closes the current window."
  },
  {
    question: "Which of the following is the correct syntax to display an alert box using JavaScript?",
    options: ["alert('Hello World');", "msg('Hello World');", "msgbox('Hello World');", "alertbox('Hello World');"],
    answer: "alert('Hello World');",
    explanation: "alert() displays an alert box."
  },
  {
    question: "Which of the following is the correct syntax to display a confirm box using JavaScript?",
    options: ["confirm('Are you sure?');", "msg('Are you sure?');", "msgbox('Are you sure?');", "alertbox('Are you sure?');"],
    answer: "confirm('Are you sure?');",
    explanation: "confirm() displays a dialog with OK and Cancel buttons."
  },
  {
    question: "Which of the following is the correct syntax to display a prompt box using JavaScript?",
    options: ["prompt('Enter your name', 'Name');", "msg('Enter your name', 'Name');", "msgbox('Enter your name', 'Name');", "alertbox('Enter your name', 'Name');"],
    answer: "prompt('Enter your name', 'Name');",
    explanation: "prompt() displays a dialog for user input."
  },
  {
    question: "Which of the following is the correct syntax to create an array in JavaScript?",
    options: ["var txt = new Array('tim','kim','jim');", "var txt = new Array='tim','kim','jim';", "var txt = new Array['tim','kim','jim'];", "var txt = new Array('tim','kim','jim')"],
    answer: "var txt = new Array('tim','kim','jim');",
    explanation: "Arrays can be created using the Array constructor."
  },
  {
    question: "Which of the following is the correct syntax to create an object in JavaScript?",
    options: ["var txt = {name:'tim', age:30};", "var txt = {name='tim', age=30};", "var txt = {name:'tim', age:30};", "var txt = {name:'tim', age:30}"],
    answer: "var txt = {name:'tim', age:30};",
    explanation: "Objects are created using curly braces and key-value pairs."
  },
  {
    question: "Which of the following is the correct syntax to create a function in JavaScript?",
    options: ["function myFunction()", "function:myFunction()", "function = myFunction()", "function myFunction"],
    answer: "function myFunction()",
    explanation: "Functions are defined with the function keyword."
  },
  {
    question: "Which of the following is the correct syntax to call a function in JavaScript?",
    options: ["myFunction()", "call myFunction()", "call function myFunction()", "myFunction"],
    answer: "myFunction()",
    explanation: "Functions are called by their name followed by parentheses."
  },
  {
    question: "Which of the following is the correct syntax to write an if statement in JavaScript?",
    options: ["if (i == 5)", "if i = 5 then", "if i == 5 then", "if i = 5"],
    answer: "if (i == 5)",
    explanation: "If statements use parentheses for the condition."
  },
  {
    question: "Which of the following is the correct syntax to write an if...else statement in JavaScript?",
    options: ["if (i == 5) { ... } else { ... }", "if i = 5 then { ... } else { ... }", "if i == 5 then { ... } else { ... }", "if i = 5 { ... } else { ... }"],
    answer: "if (i == 5) { ... } else { ... }",
    explanation: "Standard if-else syntax."
  },
  {
    question: "Which of the following is the correct syntax to write a while loop in JavaScript?",
    options: ["while (i <= 5)", "while i <= 5", "while (i <= 5; i++)", "while i <= 5; i++"],
    answer: "while (i <= 5)",
    explanation: "While loops use parentheses for the condition."
  },
  {
    question: "Which of the following is the correct syntax to write a for loop in JavaScript?",
    options: ["for (i = 0; i <= 5; i++)", "for (i <= 5; i++)", "for i = 1 to 5", "for (i = 0; i <= 5)"],
    answer: "for (i = 0; i <= 5; i++)",
    explanation: "For loops have initialization, condition, and increment."
  },
  {
    question: "Which of the following is the correct syntax to add a comment in JavaScript?",
    options: ["// This is a comment", "' This is a comment", "<!-- This is a comment -->", "# This is a comment"],
    answer: "// This is a comment",
    explanation: "Double slashes are used for single-line comments."
  },
  {
    question: "Which of the following is the correct syntax to add a multi-line comment in JavaScript?",
    options: ["/* This is a comment */", "// This is a comment", "<!-- This is a comment -->", "# This is a comment"],
    answer: "/* This is a comment */",
    explanation: "/* ... */ is used for multi-line comments."
  },
  {
    question: "Which of the following is the correct syntax to round a number to the nearest integer?",
    options: ["Math.round(7.25)", "Math.rnd(7.25)", "round(7.25)", "rnd(7.25)"],
    answer: "Math.round(7.25)",
    explanation: "Math.round() rounds to the nearest integer."
  },
  {
    question: "Which of the following is the correct syntax to find the highest value of x and y?",
    options: ["Math.max(x, y)", "Math.ceil(x, y)", "top(x, y)", "ceil(x, y)"],
    answer: "Math.max(x, y)",
    explanation: "Math.max() returns the largest of the arguments."
  },
  {
    question: "Which of the following is the correct syntax to find the random number?",
    options: ["Math.random()", "Math.rnd()", "random()", "rnd()"],
    answer: "Math.random()",
    explanation: "Math.random() returns a random number between 0 and 1."
  },
  {
    question: "Which of the following is the correct syntax to find the square root of a number?",
    options: ["Math.sqrt(9)", "Math.sqr(9)", "sqrt(9)", "sqr(9)"],
    answer: "Math.sqrt(9)",
    explanation: "Math.sqrt() returns the square root."
  },
  {
    question: "Which of the following is the correct syntax to find the absolute value of a number?",
    options: ["Math.abs(-7.25)", "Math.absolute(-7.25)", "abs(-7.25)", "absolute(-7.25)"],
    answer: "Math.abs(-7.25)",
    explanation: "Math.abs() returns the absolute value."
  },
  {
    question: "Which of the following is the correct syntax to find the length of a string?",
    options: ["str.length", "str.len", "str.length()", "str.len()"],
    answer: "str.length",
    explanation: "length is a property of string objects."
  },
  {
    question: "Which of the following is the correct syntax to convert a string to lowercase?",
    options: ["str.toLowerCase()", "str.toLower()", "str.lowerCase()", "str.lower()"],
    answer: "str.toLowerCase()",
    explanation: "toLowerCase() converts the string to lowercase."
  },
  {
    question: "Which of the following is the correct syntax to convert a string to uppercase?",
    options: ["str.toUpperCase()", "str.toUpper()", "str.upperCase()", "str.upper()"],
    answer: "str.toUpperCase()",
    explanation: "toUpperCase() converts the string to uppercase."
  },
  {
    question: "Which of the following is the correct syntax to find the index of a character in a string?",
    options: ["str.indexOf('h')", "str.index('h')", "str.find('h')", "str.search('h')"],
    answer: "str.indexOf('h')",
    explanation: "indexOf() returns the position of the first occurrence."
  },
  {
    question: "Which of the following is the correct syntax to replace a character in a string?",
    options: ["str.replace('h', 'H')", "str.repl('h', 'H')", "str.sub('h', 'H')", "str.substitute('h', 'H')"],
    answer: "str.replace('h', 'H')",
    explanation: "replace() replaces a specified value with another value."
  },
  {
    question: "Which of the following is the correct syntax to split a string into an array?",
    options: ["str.split(' ')", "str.array(' ')", "str.list(' ')", "str.separate(' ')"],
    answer: "str.split(' ')",
    explanation: "split() splits a string into an array of substrings."
  },
  {
    question: "Which of the following is the correct syntax to join an array into a string?",
    options: ["arr.join(' ')", "arr.string(' ')", "arr.text(' ')", "arr.combine(' ')"],
    answer: "arr.join(' ')",
    explanation: "join() joins all elements of an array into a string."
  },
  {
    question: "Which of the following is the correct syntax to reverse an array?",
    options: ["arr.reverse()", "arr.rev()", "arr.invert()", "arr.back()"],
    answer: "arr.reverse()",
    explanation: "reverse() reverses the order of the elements in an array."
  },
  {
    question: "Which of the following is the correct syntax to sort an array?",
    options: ["arr.sort()", "arr.order()", "arr.arrange()", "arr.sequence()"],
    answer: "arr.sort()",
    explanation: "sort() sorts the elements of an array."
  },
  {
    question: "Which of the following is the correct syntax to add an element to the end of an array?",
    options: ["arr.push('new')", "arr.add('new')", "arr.append('new')", "arr.insert('new')"],
    answer: "arr.push('new')",
    explanation: "push() adds new items to the end of an array."
  }
];

module.exports = questions;
