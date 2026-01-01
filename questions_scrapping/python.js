const questions = [
  {
    question: "What is the output of print(2 ** 3 ** 2)?",
    options: ["64", "512", "Error", "None"],
    answer: "512",
    explanation: "The exponentiation operator ** is right-associative. So, 2 ** (3 ** 2) = 2 ** 9 = 512."
  },
  {
    question: "Which of the following is not a keyword in Python?",
    options: ["val", "raise", "try", "with"],
    answer: "val",
    explanation: "val is not a keyword in Python. It is used in languages like Kotlin or Scala."
  },
  {
    question: "What is the correct file extension for Python files?",
    options: [".pyth", ".pt", ".py", ".pe"],
    answer: ".py",
    explanation: "Python files are saved with the .py extension."
  },
  {
    question: "How do you create a variable with the floating number 2.8?",
    options: ["x = 2.8", "x = float(2.8)", "Both A and B", "x : 2.8"],
    answer: "Both A and B",
    explanation: "In Python, you can assign a float directly or cast it using float()."
  },
  {
    question: "What is the output of print(type([]) is list)?",
    options: ["False", "True", "Error", "None"],
    answer: "True",
    explanation: "[] creates an empty list, so type([]) returns <class 'list'>."
  },
  {
    question: "Which method can be used to remove any whitespace from both the beginning and the end of a string?",
    options: ["strip()", "trim()", "len()", "ptrim()"],
    answer: "strip()",
    explanation: "The strip() method removes whitespace from both ends of a string."
  },
  {
    question: "Which collection is ordered, changeable, and allows duplicate members?",
    options: ["Set", "Dictionary", "Tuple", "List"],
    answer: "List",
    explanation: "Lists in Python are ordered, mutable, and allow duplicates."
  },
  {
    question: "How do you start a for loop in Python?",
    options: ["for x in y:", "for each x in y:", "for x in y", "for x inside y:"],
    answer: "for x in y:",
    explanation: "The correct syntax is 'for variable in iterable:'."
  },
  {
    question: "Which statement is used to stop a loop?",
    options: ["stop", "exit", "break", "return"],
    answer: "break",
    explanation: "The break statement is used to terminate the loop immediately."
  },
  {
    question: "What is the correct way to create a function in Python?",
    options: ["create myFunction():", "def myFunction():", "function myFunction():", "func myFunction():"],
    answer: "def myFunction():",
    explanation: "Functions are defined using the 'def' keyword."
  },
  {
    question: "Which of the following is a tuple?",
    options: ["[1, 2, 3]", "{1, 2, 3}", "(1, 2, 3)", "{'a': 1}"],
    answer: "(1, 2, 3)",
    explanation: "Tuples are defined with parentheses ()."
  },
  {
    question: "What is the output of print(10 // 3)?",
    options: ["3.33", "3", "3.0", "4"],
    answer: "3",
    explanation: "// is the floor division operator, which returns the integer part of the quotient."
  },
  {
    question: "Which operator is used to multiply numbers?",
    options: ["x", "%", "*", "#"],
    answer: "*",
    explanation: "The * operator is used for multiplication."
  },
  {
    question: "What is the result of 'Hello' + 'World'?",
    options: ["HelloWorld", "Hello World", "Error", "None"],
    answer: "HelloWorld",
    explanation: "The + operator concatenates strings without adding a space."
  },
  {
    question: "Which of the following is mutable?",
    options: ["Tuple", "String", "List", "Integer"],
    answer: "List",
    explanation: "Lists are mutable, meaning their elements can be changed after creation."
  },
  {
    question: "What does the len() function do?",
    options: ["Returns the length of an object", "Returns the type of an object", "Returns the value of an object", "None of the above"],
    answer: "Returns the length of an object",
    explanation: "len() returns the number of items in an object."
  },
  {
    question: "How do you insert comments in Python code?",
    options: ["// This is a comment", "# This is a comment", "/* This is a comment */", "-- This is a comment"],
    answer: "# This is a comment",
    explanation: "Python uses # for single-line comments."
  },
  {
    question: "Which of the following is not a valid variable name?",
    options: ["my_var", "_myvar", "2myvar", "myVar"],
    answer: "2myvar",
    explanation: "Variable names cannot start with a number."
  },
  {
    question: "What is the output of bool(0)?",
    options: ["True", "False", "Error", "None"],
    answer: "False",
    explanation: "0 is considered falsy in Python."
  },
  {
    question: "Which method adds an element at the end of a list?",
    options: ["append()", "insert()", "add()", "push()"],
    answer: "append()",
    explanation: "append() adds an element to the end of the list."
  },
  {
    question: "What is the output of print(3 * 'abc')?",
    options: ["abcabcabc", "abc3", "Error", "None"],
    answer: "abcabcabc",
    explanation: "Multiplying a string by an integer repeats the string that many times."
  },
  {
    question: "Which keyword is used to import a module?",
    options: ["include", "import", "using", "require"],
    answer: "import",
    explanation: "The import keyword is used to import modules."
  },
  {
    question: "What is the output of print(10 % 3)?",
    options: ["1", "3", "0", "10"],
    answer: "1",
    explanation: "% is the modulus operator, returning the remainder of the division."
  },
  {
    question: "Which function converts a string to an integer?",
    options: ["str()", "int()", "float()", "char()"],
    answer: "int()",
    explanation: "int() converts a value to an integer."
  },
  {
    question: "What is the correct syntax to output 'Hello World' in Python?",
    options: ["echo 'Hello World'", "p('Hello World')", "print('Hello World')", "printf('Hello World')"],
    answer: "print('Hello World')",
    explanation: "print() is the function used to output text."
  },
  {
    question: "Which of the following is a dictionary?",
    options: ["{'name': 'John', 'age': 36}", "[1, 2, 3]", "(1, 2, 3)", "{1, 2, 3}"],
    answer: "{'name': 'John', 'age': 36}",
    explanation: "Dictionaries are defined with curly braces {} and key-value pairs."
  },
  {
    question: "How do you check if a key exists in a dictionary?",
    options: ["key in dict", "dict.has(key)", "dict.contains(key)", "key.exists(dict)"],
    answer: "key in dict",
    explanation: "The 'in' operator checks for the existence of a key in a dictionary."
  },
  {
    question: "What is the output of range(3)?",
    options: ["[0, 1, 2]", "[1, 2, 3]", "(0, 1, 2)", "range(0, 3)"],
    answer: "range(0, 3)",
    explanation: "In Python 3, range() returns a range object, not a list."
  },
  {
    question: "Which statement is used to handle exceptions?",
    options: ["try...except", "try...catch", "do...catch", "try...rescue"],
    answer: "try...except",
    explanation: "Python uses try...except blocks for exception handling."
  },
  {
    question: "What is the output of print(2 == 2.0)?",
    options: ["True", "False", "Error", "None"],
    answer: "True",
    explanation: "Python compares the values, and 2 is equal to 2.0."
  },
  {
    question: "Which method returns the index of the first occurrence of a substring?",
    options: ["find()", "search()", "locate()", "indexof()"],
    answer: "find()",
    explanation: "find() returns the lowest index of the substring if found."
  },
  {
    question: "What is the output of print('a' < 'b')?",
    options: ["True", "False", "Error", "None"],
    answer: "True",
    explanation: "String comparison is based on ASCII/Unicode values, and 'a' comes before 'b'."
  },
  {
    question: "Which of the following is an immutable set?",
    options: ["frozenset", "set", "list", "tuple"],
    answer: "frozenset",
    explanation: "frozenset is an immutable version of a set."
  },
  {
    question: "What is the output of print(abs(-7.25))?",
    options: ["7.25", "-7.25", "7", "Error"],
    answer: "7.25",
    explanation: "abs() returns the absolute value of a number."
  },
  {
    question: "Which module is used for regular expressions?",
    options: ["regex", "re", "regexp", "pyre"],
    answer: "re",
    explanation: "The 're' module provides regular expression support."
  },
  {
    question: "What is the output of print(min(5, 10, 25))?",
    options: ["5", "10", "25", "Error"],
    answer: "5",
    explanation: "min() returns the smallest item."
  },
  {
    question: "How do you create a class in Python?",
    options: ["class MyClass:", "create class MyClass:", "class MyClass()", "def class MyClass:"],
    answer: "class MyClass:",
    explanation: "Classes are defined using the 'class' keyword."
  },
  {
    question: "What is the correct way to inherit a class?",
    options: ["class Child(Parent):", "class Child extends Parent:", "class Child inherits Parent:", "class Child : Parent"],
    answer: "class Child(Parent):",
    explanation: "Inheritance is specified by putting the parent class in parentheses."
  },
  {
    question: "What is __init__?",
    options: ["A constructor method", "A destructor method", "A static method", "A class method"],
    answer: "A constructor method",
    explanation: "__init__ is the constructor method in Python classes."
  },
  {
    question: "What is the output of print(pow(2, 3))?",
    options: ["8", "6", "5", "9"],
    answer: "8",
    explanation: "pow(x, y) returns x to the power of y (2^3 = 8)."
  },
  {
    question: "Which method converts a string to uppercase?",
    options: ["upper()", "uppercase()", "toUpper()", "up()"],
    answer: "upper()",
    explanation: "upper() converts all characters in the string to uppercase."
  },
  {
    question: "What is the output of print(bool([]))?",
    options: ["False", "True", "Error", "None"],
    answer: "False",
    explanation: "Empty lists are considered falsy."
  },
  {
    question: "Which operator is used for logical AND?",
    options: ["&&", "and", "&", "AND"],
    answer: "and",
    explanation: "Python uses the keyword 'and' for logical AND."
  },
  {
    question: "What is the output of print(10 > 9)?",
    options: ["True", "False", "Error", "None"],
    answer: "True",
    explanation: "10 is greater than 9."
  },
  {
    question: "Which function returns the current date and time?",
    options: ["datetime.now()", "date.now()", "time.now()", "now()"],
    answer: "datetime.now()",
    explanation: "datetime.now() from the datetime module returns the current date and time."
  },
  {
    question: "What is the output of print(round(2.55, 1))?",
    options: ["2.6", "2.5", "3", "2"],
    answer: "2.6",
    explanation: "round(number, digits) rounds the number to the specified number of digits."
  },
  {
    question: "Which of the following is not a built-in data type?",
    options: ["Array", "List", "Dictionary", "Tuple"],
    answer: "Array",
    explanation: "Python does not have a built-in Array type (it uses Lists). Arrays are provided by modules like array or numpy."
  },
  {
    question: "What is the output of print('Python'[0])?",
    options: ["P", "y", "Python", "Error"],
    answer: "P",
    explanation: "String indexing starts at 0."
  },
  {
    question: "How do you create a lambda function?",
    options: ["lambda arguments : expression", "def arguments : expression", "function arguments : expression", "lambda arguments -> expression"],
    answer: "lambda arguments : expression",
    explanation: "Lambda functions are defined using the 'lambda' keyword."
  },
  {
    question: "What is the output of print(set([1, 2, 2, 3]))?",
    options: ["{1, 2, 3}", "[1, 2, 3]", "{1, 2, 2, 3}", "Error"],
    answer: "{1, 2, 3}",
    explanation: "Sets remove duplicate elements."
  }
];

module.exports = questions;

module.exports = questions;
