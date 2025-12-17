const questions = [
  {
    question: "Who invented C++?",
    options: ["Dennis Ritchie", "Bjarne Stroustrup", "Ken Thompson", "Brian Kernighan"],
    answer: "Bjarne Stroustrup",
    explanation: "Bjarne Stroustrup developed C++ at Bell Labs."
  },
  {
    question: "What is C++?",
    options: ["Object Oriented Programming Language", "Procedural Programming Language", "Both A and B", "Functional Programming Language"],
    answer: "Both A and B",
    explanation: "C++ supports both procedural and object-oriented programming paradigms."
  },
  {
    question: "Which of the following is the correct syntax to print the message in C++?",
    options: ["cout << \"Hello world!\";", "Cout << \"Hello world!\";", "Out << \"Hello world!\";", "Print << \"Hello world!\";"],
    answer: "cout << \"Hello world!\";",
    explanation: "cout is the standard output stream in C++."
  },
  {
    question: "Which of the following is the correct identifier?",
    options: ["$var_name", "VAR_123", "varname@", "None of the above"],
    answer: "VAR_123",
    explanation: "Identifiers can contain letters, digits, and underscores, but cannot start with a digit or special characters like $ or @."
  },
  {
    question: "Which of the following is the address operator?",
    options: ["@", "#", "&", "%"],
    answer: "&",
    explanation: "The & operator is used to get the address of a variable."
  },
  {
    question: "Which of the following features must be supported by any programming language to become a pure object-oriented programming language?",
    options: ["Encapsulation", "Inheritance", "Polymorphism", "All of the above"],
    answer: "All of the above",
    explanation: "A pure OOP language must support Encapsulation, Inheritance, and Polymorphism."
  },
  {
    question: "The programming language that has the ability to create new data types is called___.",
    options: ["Overloaded", "Encapsulated", "Reprehensible", "Extensible"],
    answer: "Extensible",
    explanation: "Extensibility allows a language to handle new data types."
  },
  {
    question: "Which of the following is the original creator of the C++ language?",
    options: ["Dennis Ritchie", "Ken Thompson", "Bjarne Stroustrup", "Brian Kernighan"],
    answer: "Bjarne Stroustrup",
    explanation: "Bjarne Stroustrup created C++."
  },
  {
    question: "Which of the following is the correct syntax to read the single character to console in the C++ language?",
    options: ["Read ch()", "Getch()", "get(ch)", "scanf(ch)"],
    answer: "get(ch)",
    explanation: "cin.get(ch) reads a single character."
  },
  {
    question: "Which of the following is the correct syntax to add the header file in the C++ program?",
    options: ["#include<userdefined>", "#include \"userdefined\"", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Both <> and \"\" can be used to include header files."
  },
  {
    question: "Which of the following is the correct syntax to declare the same variable name in different scopes?",
    options: ["int var; int var;", "int var; { int var; }", "Both A and B", "None of the above"],
    answer: "int var; { int var; }",
    explanation: "Variables can be redeclared in different scopes (e.g., inside a block)."
  },
  {
    question: "Which of the following is the correct syntax to access the private member of the class?",
    options: ["Using friend function", "Using member function", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Private members can be accessed by member functions and friend functions."
  },
  {
    question: "Which of the following is the correct syntax to define the member function outside the class?",
    options: ["return_type class_name::function_name(){}", "return_type class_name:function_name(){}", "return_type class_name.function_name(){}", "None of the above"],
    answer: "return_type class_name::function_name(){}",
    explanation: "The scope resolution operator :: is used to define member functions outside the class."
  },
  {
    question: "Which of the following is the correct syntax to create an object of the class?",
    options: ["class_name object_name;", "class_name object_name();", "class_name object_name = new class_name();", "None of the above"],
    answer: "class_name object_name;",
    explanation: "This creates an object on the stack."
  },
  {
    question: "Which of the following is the correct syntax to access the static member of the class?",
    options: ["class_name.static_member", "class_name::static_member", "class_name->static_member", "None of the above"],
    answer: "class_name::static_member",
    explanation: "Static members are accessed using the scope resolution operator ::."
  },
  {
    question: "Which of the following is the correct syntax to call the constructor?",
    options: ["class_name object_name;", "class_name object_name();", "class_name object_name = new class_name();", "All of the above"],
    answer: "All of the above",
    explanation: "Constructors are called when an object is created."
  },
  {
    question: "Which of the following is the correct syntax to call the destructor?",
    options: ["~class_name();", "class_name();", "!class_name();", "None of the above"],
    answer: "~class_name();",
    explanation: "Destructors are named with a tilde ~ followed by the class name."
  },
  {
    question: "Which of the following is the correct syntax to declare the virtual function?",
    options: ["virtual return_type function_name();", "return_type virtual function_name();", "return_type function_name() virtual;", "None of the above"],
    answer: "virtual return_type function_name();",
    explanation: "The virtual keyword is placed before the return type."
  },
  {
    question: "Which of the following is the correct syntax to declare the pure virtual function?",
    options: ["virtual return_type function_name() = 0;", "virtual return_type function_name() = NULL;", "virtual return_type function_name() = null;", "None of the above"],
    answer: "virtual return_type function_name() = 0;",
    explanation: "Pure virtual functions are initialized to 0."
  },
  {
    question: "Which of the following is the correct syntax to declare the friend function?",
    options: ["friend return_type function_name();", "return_type friend function_name();", "return_type function_name() friend;", "None of the above"],
    answer: "friend return_type function_name();",
    explanation: "The friend keyword is placed before the return type."
  },
  {
    question: "Which of the following is the correct syntax to declare the template function?",
    options: ["template <class T> return_type function_name(T a);", "template <typename T> return_type function_name(T a);", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Both 'class' and 'typename' can be used in template declarations."
  },
  {
    question: "Which of the following is the correct syntax to declare the template class?",
    options: ["template <class T> class class_name;", "template <typename T> class class_name;", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Both 'class' and 'typename' can be used."
  },
  {
    question: "Which of the following is the correct syntax to handle the exception?",
    options: ["try { ... } catch(exception) { ... }", "try { ... } catch(exception e) { ... }", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Standard exception handling syntax."
  },
  {
    question: "Which of the following is the correct syntax to throw the exception?",
    options: ["throw exception;", "throw(exception);", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Exceptions can be thrown using the throw keyword."
  },
  {
    question: "Which of the following is the correct syntax to declare the namespace?",
    options: ["namespace namespace_name { ... }", "namespace { ... }", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Namespaces can be named or anonymous."
  },
  {
    question: "Which of the following is the correct syntax to use the namespace?",
    options: ["using namespace namespace_name;", "using namespace_name;", "Both A and B", "None of the above"],
    answer: "using namespace namespace_name;",
    explanation: "The 'using namespace' directive imports the namespace."
  },
  {
    question: "Which of the following is the correct syntax to declare the pointer?",
    options: ["int *ptr;", "int* ptr;", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Whitespace placement around the asterisk does not matter."
  },
  {
    question: "Which of the following is the correct syntax to declare the reference?",
    options: ["int &ref = var;", "int& ref = var;", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Whitespace placement around the ampersand does not matter."
  },
  {
    question: "Which of the following is the correct syntax to declare the array?",
    options: ["int arr[10];", "int arr[] = {1, 2, 3};", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Arrays can be declared with a size or initialized with elements."
  },
  {
    question: "Which of the following is the correct syntax to declare the string?",
    options: ["string str;", "char str[10];", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "C++ supports both std::string and C-style char arrays."
  },
  {
    question: "Which of the following is the correct syntax to declare the constant?",
    options: ["const int var = 10;", "int const var = 10;", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "const can be placed before or after the type."
  },
  {
    question: "Which of the following is the correct syntax to declare the macro?",
    options: ["#define MACRO 10", "#define MACRO = 10", "Both A and B", "None of the above"],
    answer: "#define MACRO 10",
    explanation: "Macros are defined without an equals sign."
  },
  {
    question: "Which of the following is the correct syntax to declare the enumeration?",
    options: ["enum enum_name { ... };", "enum { ... };", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Enums can be named or anonymous."
  },
  {
    question: "Which of the following is the correct syntax to declare the structure?",
    options: ["struct struct_name { ... };", "struct { ... };", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Structures can be named or anonymous."
  },
  {
    question: "Which of the following is the correct syntax to declare the union?",
    options: ["union union_name { ... };", "union { ... };", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Unions can be named or anonymous."
  },
  {
    question: "Which of the following is the correct syntax to declare the class?",
    options: ["class class_name { ... };", "class { ... };", "Both A and B", "None of the above"],
    answer: "class class_name { ... };",
    explanation: "Classes are typically named."
  },
  {
    question: "Which of the following is the correct syntax to declare the inheritance?",
    options: ["class derived_class : access_specifier base_class { ... };", "class derived_class : base_class { ... };", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Access specifier is optional (defaults to private for classes)."
  },
  {
    question: "Which of the following is the correct syntax to declare the multiple inheritance?",
    options: ["class derived_class : access_specifier base_class1, access_specifier base_class2 { ... };", "class derived_class : base_class1, base_class2 { ... };", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Multiple base classes are separated by commas."
  },
  {
    question: "Which of the following is the correct syntax to declare the multilevel inheritance?",
    options: ["class derived_class : access_specifier base_class { ... }; class sub_derived_class : access_specifier derived_class { ... };", "class derived_class : base_class { ... }; class sub_derived_class : derived_class { ... };", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Multilevel inheritance involves a chain of classes."
  },
  {
    question: "Which of the following is the correct syntax to declare the hierarchical inheritance?",
    options: ["class derived_class1 : access_specifier base_class { ... }; class derived_class2 : access_specifier base_class { ... };", "class derived_class1 : base_class { ... }; class derived_class2 : base_class { ... };", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Hierarchical inheritance involves multiple classes derived from a single base class."
  },
  {
    question: "Which of the following is the correct syntax to declare the hybrid inheritance?",
    options: ["Combination of two or more types of inheritance", "Single inheritance", "Multiple inheritance", "None of the above"],
    answer: "Combination of two or more types of inheritance",
    explanation: "Hybrid inheritance combines multiple inheritance types."
  },
  {
    question: "Which of the following is the correct syntax to declare the virtual base class?",
    options: ["class derived_class : virtual access_specifier base_class { ... };", "class derived_class : virtual base_class { ... };", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Virtual inheritance prevents multiple instances of the base class in the hierarchy."
  },
  {
    question: "Which of the following is the correct syntax to declare the abstract class?",
    options: ["Class containing at least one pure virtual function", "Class containing at least one virtual function", "Class containing at least one friend function", "None of the above"],
    answer: "Class containing at least one pure virtual function",
    explanation: "An abstract class must have at least one pure virtual function."
  },
  {
    question: "Which of the following is the correct syntax to declare the interface?",
    options: ["Class containing only pure virtual functions", "Class containing only virtual functions", "Class containing only friend functions", "None of the above"],
    answer: "Class containing only pure virtual functions",
    explanation: "C++ interfaces are typically implemented as abstract classes with only pure virtual functions."
  },
  {
    question: "Which of the following is the correct syntax to declare the constructor overloading?",
    options: ["Defining multiple constructors with different parameters", "Defining multiple constructors with same parameters", "Defining multiple constructors with different return types", "None of the above"],
    answer: "Defining multiple constructors with different parameters",
    explanation: "Constructor overloading allows creating objects in different ways."
  },
  {
    question: "Which of the following is the correct syntax to declare the function overloading?",
    options: ["Defining multiple functions with same name but different parameters", "Defining multiple functions with same name and same parameters", "Defining multiple functions with different name and different parameters", "None of the above"],
    answer: "Defining multiple functions with same name but different parameters",
    explanation: "Function overloading allows multiple functions with the same name."
  },
  {
    question: "Which of the following is the correct syntax to declare the operator overloading?",
    options: ["return_type operator op(parameters) { ... }", "return_type operator op(parameters);", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Operator overloading allows defining custom behavior for operators."
  },
  {
    question: "Which of the following is the correct syntax to declare the copy constructor?",
    options: ["class_name(const class_name &obj) { ... }", "class_name(class_name &obj) { ... }", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Copy constructors take a reference to an object of the same class."
  },
  {
    question: "Which of the following is the correct syntax to declare the move constructor?",
    options: ["class_name(class_name &&obj) { ... }", "class_name(class_name &obj) { ... }", "Both A and B", "None of the above"],
    answer: "class_name(class_name &&obj) { ... }",
    explanation: "Move constructors take an rvalue reference (&&)."
  },
  {
    question: "Which of the following is the correct syntax to declare the destructor?",
    options: ["~class_name() { ... }", "~class_name();", "Both A and B", "None of the above"],
    answer: "Both A and B",
    explanation: "Destructors clean up resources."
  }
];

module.exports = questions;
