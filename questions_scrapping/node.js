const questions = [
  {
    question: "What is Node.js?",
    options: ["A JavaScript runtime built on Chrome's V8 JavaScript engine", "A framework for building mobile apps", "A database management system", "A programming language"],
    answer: "A JavaScript runtime built on Chrome's V8 JavaScript engine",
    explanation: "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine."
  },
  {
    question: "Is Node.js single-threaded or multi-threaded?",
    options: ["Single-threaded", "Multi-threaded", "Both", "None"],
    answer: "Single-threaded",
    explanation: "Node.js runs on a single thread using an event loop."
  },
  {
    question: "What is the event loop in Node.js?",
    options: ["A mechanism that handles asynchronous callbacks", "A loop that runs forever", "A database query", "A function"],
    answer: "A mechanism that handles asynchronous callbacks",
    explanation: "The event loop is what allows Node.js to perform non-blocking I/O operations."
  },
  {
    question: "What is npm?",
    options: ["Node Package Manager", "Node Project Manager", "Node Program Manager", "Node Process Manager"],
    answer: "Node Package Manager",
    explanation: "npm is the package manager for Node.js."
  },
  {
    question: "What is a module in Node.js?",
    options: ["A reusable block of code", "A database table", "A server route", "A CSS file"],
    answer: "A reusable block of code",
    explanation: "Modules are reusable blocks of code that can be exported and imported."
  },
  {
    question: "How do you import a module in Node.js?",
    options: ["Using require()", "Using import()", "Using include()", "Using fetch()"],
    answer: "Using require()",
    explanation: "CommonJS modules are imported using the require() function."
  },
  {
    question: "What is the purpose of package.json?",
    options: ["To hold metadata about the project and dependencies", "To store database credentials", "To store user data", "To store logs"],
    answer: "To hold metadata about the project and dependencies",
    explanation: "package.json holds metadata relevant to the project and handles the project's dependencies."
  },
  {
    question: "What is the difference between process.nextTick() and setImmediate()?",
    options: ["process.nextTick() fires immediately on the same phase, setImmediate() fires on the next iteration or 'check' phase", "setImmediate() is faster", "process.nextTick() is deprecated", "There is no difference"],
    answer: "process.nextTick() fires immediately on the same phase, setImmediate() fires on the next iteration or 'check' phase",
    explanation: "process.nextTick() fires immediately on the same phase, setImmediate() fires on the next iteration or 'check' phase."
  },
  {
    question: "What is a callback function?",
    options: ["A function passed as an argument to another function", "A function that calls itself", "A function that returns a promise", "A function that handles errors"],
    answer: "A function passed as an argument to another function",
    explanation: "A callback is a function passed as an argument to another function."
  },
  {
    question: "What is callback hell?",
    options: ["Heavily nested callbacks that are hard to read and debug", "A function that never returns", "A database error", "A server crash"],
    answer: "Heavily nested callbacks that are hard to read and debug",
    explanation: "Callback hell refers to heavily nested callbacks that make code difficult to read and maintain."
  },
  {
    question: "What are Promises in Node.js?",
    options: ["Objects representing the eventual completion or failure of an asynchronous operation", "Functions that return values", "Database queries", "Server routes"],
    answer: "Objects representing the eventual completion or failure of an asynchronous operation",
    explanation: "Promises are used to handle asynchronous operations."
  },
  {
    question: "What is async/await?",
    options: ["Syntactic sugar for Promises", "A new way to write synchronous code", "A database query", "A server route"],
    answer: "Syntactic sugar for Promises",
    explanation: "async/await is syntactic sugar built on top of Promises."
  },
  {
    question: "What is the fs module used for?",
    options: ["File system operations", "Network operations", "Database operations", "Crypto operations"],
    answer: "File system operations",
    explanation: "The fs module provides an API for interacting with the file system."
  },
  {
    question: "What is the http module used for?",
    options: ["Creating HTTP servers and clients", "File system operations", "Database operations", "Crypto operations"],
    answer: "Creating HTTP servers and clients",
    explanation: "The http module allows Node.js to transfer data over the Hyper Text Transfer Protocol (HTTP)."
  },
  {
    question: "What is the path module used for?",
    options: ["Handling file paths", "Handling network paths", "Handling database paths", "Handling URL paths"],
    answer: "Handling file paths",
    explanation: "The path module provides utilities for working with file and directory paths."
  },
  {
    question: "What is the os module used for?",
    options: ["Operating system related utility methods", "File system operations", "Network operations", "Database operations"],
    answer: "Operating system related utility methods",
    explanation: "The os module provides operating system-related utility methods and properties."
  },
  {
    question: "What is the events module used for?",
    options: ["Handling events", "Handling files", "Handling network requests", "Handling database queries"],
    answer: "Handling events",
    explanation: "The events module provides a way to handle events."
  },
  {
    question: "What is an EventEmitter?",
    options: ["A class that emits events", "A function that emits events", "A variable that emits events", "A database that emits events"],
    answer: "A class that emits events",
    explanation: "EventEmitter is a class in the events module that emits events."
  },
  {
    question: "What is a stream in Node.js?",
    options: ["A collection of data that might not be available all at once", "A river", "A database", "A file"],
    answer: "A collection of data that might not be available all at once",
    explanation: "Streams are objects that let you read data from a source or write data to a destination in continuous fashion."
  },
  {
    question: "What are the types of streams in Node.js?",
    options: ["Readable, Writable, Duplex, Transform", "Input, Output, Error", "File, Network, Database", "None of the above"],
    answer: "Readable, Writable, Duplex, Transform",
    explanation: "There are four fundamental stream types: Readable, Writable, Duplex, and Transform."
  },
  {
    question: "What is a buffer in Node.js?",
    options: ["A temporary storage spot for a chunk of data", "A permanent storage", "A database", "A file"],
    answer: "A temporary storage spot for a chunk of data",
    explanation: "Buffers are used to handle binary data."
  },
  {
    question: "What is middleware in Express.js?",
    options: ["Functions that have access to the request and response objects", "Database queries", "Server routes", "CSS files"],
    answer: "Functions that have access to the request and response objects",
    explanation: "Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function."
  },
  {
    question: "What is the difference between require() and import?",
    options: ["require() is CommonJS, import is ES6 modules", "require() is ES6 modules, import is CommonJS", "There is no difference", "require() is deprecated"],
    answer: "require() is CommonJS, import is ES6 modules",
    explanation: "require() is part of the CommonJS module system, while import is part of the ES6 module system."
  },
  {
    question: "What is the cluster module used for?",
    options: ["To create child processes that share server ports", "To create a database cluster", "To create a network cluster", "To create a file cluster"],
    answer: "To create child processes that share server ports",
    explanation: "The cluster module allows you to create child processes that share server ports."
  },
  {
    question: "What is the child_process module used for?",
    options: ["To spawn child processes", "To create a database", "To create a server", "To create a file"],
    answer: "To spawn child processes",
    explanation: "The child_process module provides the ability to spawn child processes."
  },
  {
    question: "What is the crypto module used for?",
    options: ["Cryptographic functionality", "Currency conversion", "Database encryption", "File encryption"],
    answer: "Cryptographic functionality",
    explanation: "The crypto module provides cryptographic functionality."
  },
  {
    question: "What is the util module used for?",
    options: ["Utility functions", "Database functions", "Network functions", "File functions"],
    answer: "Utility functions",
    explanation: "The util module supports the needs of Node.js internal APIs."
  },
  {
    question: "What is the difference between spawn and exec?",
    options: ["spawn returns a stream, exec returns a buffer", "spawn returns a buffer, exec returns a stream", "There is no difference", "spawn is deprecated"],
    answer: "spawn returns a stream, exec returns a buffer",
    explanation: "spawn returns a stream, while exec returns a buffer."
  },
  {
    question: "What is the global object in Node.js?",
    options: ["global", "window", "document", "process"],
    answer: "global",
    explanation: "In Node.js, the global object is called global."
  },
  {
    question: "What is __dirname?",
    options: ["The directory name of the current module", "The file name of the current module", "The process ID", "The current user"],
    answer: "The directory name of the current module",
    explanation: "__dirname is the directory name of the current module."
  },
  {
    question: "What is __filename?",
    options: ["The file name of the current module", "The directory name of the current module", "The process ID", "The current user"],
    answer: "The file name of the current module",
    explanation: "__filename is the file name of the current module."
  },
  {
    question: "What is process.env?",
    options: ["An object containing the user environment", "The process ID", "The current user", "The current directory"],
    answer: "An object containing the user environment",
    explanation: "process.env returns an object containing the user environment."
  },
  {
    question: "What is process.argv?",
    options: ["An array containing the command line arguments", "The process ID", "The current user", "The current directory"],
    answer: "An array containing the command line arguments",
    explanation: "process.argv returns an array containing the command line arguments."
  },
  {
    question: "What is process.exit()?",
    options: ["Ends the process", "Restarts the process", "Pauses the process", "Logs the process"],
    answer: "Ends the process",
    explanation: "process.exit() ends the process with the specified code."
  },
  {
    question: "What is module.exports?",
    options: ["The object that is returned when a module is required", "The module name", "The module path", "The module version"],
    answer: "The object that is returned when a module is required",
    explanation: "module.exports is the object that is returned when a module is required."
  },
  {
    question: "What is exports?",
    options: ["A reference to module.exports", "A global variable", "A function", "A database"],
    answer: "A reference to module.exports",
    explanation: "exports is a reference to module.exports."
  },
  {
    question: "What is REPL?",
    options: ["Read-Eval-Print Loop", "Read-Execute-Print Loop", "Read-Eval-Process Loop", "Read-Execute-Process Loop"],
    answer: "Read-Eval-Print Loop",
    explanation: "REPL stands for Read-Eval-Print Loop."
  },
  {
    question: "What is the purpose of the assert module?",
    options: ["To write tests", "To handle errors", "To log messages", "To manage state"],
    answer: "To write tests",
    explanation: "The assert module provides a simple set of assertion tests."
  },
  {
    question: "What is the purpose of the dns module?",
    options: ["To do DNS lookups", "To handle database connections", "To handle file paths", "To handle URLs"],
    answer: "To do DNS lookups",
    explanation: "The dns module enables name resolution."
  },
  {
    question: "What is the purpose of the net module?",
    options: ["To create TCP servers and clients", "To create HTTP servers", "To create UDP servers", "To create file servers"],
    answer: "To create TCP servers and clients",
    explanation: "The net module provides an asynchronous network API for creating stream-based TCP or IPC servers and clients."
  },
  {
    question: "What is the purpose of the dgram module?",
    options: ["To create UDP datagram sockets", "To create TCP servers", "To create HTTP servers", "To create file servers"],
    answer: "To create UDP datagram sockets",
    explanation: "The dgram module provides an implementation of UDP Datagram sockets."
  },
  {
    question: "What is the purpose of the tls module?",
    options: ["To provide TLS/SSL encryption", "To provide HTTP support", "To provide file support", "To provide database support"],
    answer: "To provide TLS/SSL encryption",
    explanation: "The tls module provides an implementation of the Transport Layer Security (TLS) and Secure Sockets Layer (SSL) protocols."
  },
  {
    question: "What is the purpose of the zlib module?",
    options: ["To provide compression functionality", "To provide encryption functionality", "To provide file functionality", "To provide network functionality"],
    answer: "To provide compression functionality",
    explanation: "The zlib module provides compression functionality implemented using Gzip and Deflate/Inflate."
  },
  {
    question: "What is the purpose of the v8 module?",
    options: ["To expose V8 specific built-ins", "To expose Node.js specific built-ins", "To expose OS specific built-ins", "To expose file specific built-ins"],
    answer: "To expose V8 specific built-ins",
    explanation: "The v8 module exposes APIs that are specific to the V8 JavaScript engine."
  },
  {
    question: "What is the purpose of the vm module?",
    options: ["To compile and run code within V8 Virtual Machine contexts", "To run virtual machines", "To run docker containers", "To run databases"],
    answer: "To compile and run code within V8 Virtual Machine contexts",
    explanation: "The vm module enables compiling and running code within V8 Virtual Machine contexts."
  },
  {
    question: "What is the purpose of the worker_threads module?",
    options: ["To enable the use of threads that execute JavaScript in parallel", "To create worker processes", "To create database workers", "To create file workers"],
    answer: "To enable the use of threads that execute JavaScript in parallel",
    explanation: "The worker_threads module enables the use of threads that execute JavaScript in parallel."
  },
  {
    question: "What is libuv?",
    options: ["A multi-platform support library with a focus on asynchronous I/O", "A JavaScript engine", "A database", "A web server"],
    answer: "A multi-platform support library with a focus on asynchronous I/O",
    explanation: "libuv is a multi-platform support library with a focus on asynchronous I/O."
  },
  {
    question: "What is the purpose of the querystring module?",
    options: ["To parse and format URL query strings", "To parse JSON", "To parse XML", "To parse HTML"],
    answer: "To parse and format URL query strings",
    explanation: "The querystring module provides utilities for parsing and formatting URL query strings."
  },
  {
    question: "What is the purpose of the url module?",
    options: ["To parse and format URLs", "To parse query strings", "To parse JSON", "To parse XML"],
    answer: "To parse and format URLs",
    explanation: "The url module provides utilities for URL resolution and parsing."
  },
  {
    question: "What is the purpose of the punycode module?",
    options: ["To convert Unicode strings to ASCII", "To convert ASCII to Unicode", "To encrypt strings", "To decrypt strings"],
    answer: "To convert Unicode strings to ASCII",
    explanation: "The punycode module is a bundled version of the punycode.js module."
  }
];

module.exports = questions;

module.exports = questions;
