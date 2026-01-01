const questions = [
  {
    question: "What is React?",
    options: ["A JavaScript library for building user interfaces", "A framework for building mobile apps", "A database management system", "A server-side language"],
    answer: "A JavaScript library for building user interfaces",
    explanation: "React is a library developed by Facebook for building UI."
  },
  {
    question: "Who developed React?",
    options: ["Google", "Facebook", "Twitter", "Microsoft"],
    answer: "Facebook",
    explanation: "React was created by Jordan Walke at Facebook."
  },
  {
    question: "What is JSX?",
    options: ["JavaScript XML", "Java Syntax Extension", "JSON Xylophone", "JavaScript Extension"],
    answer: "JavaScript XML",
    explanation: "JSX is a syntax extension for JavaScript that looks like XML."
  },
  {
    question: "What is the virtual DOM?",
    options: ["A direct copy of the real DOM", "A lightweight copy of the real DOM", "A database", "A browser plugin"],
    answer: "A lightweight copy of the real DOM",
    explanation: "The virtual DOM is a concept where a virtual representation of the UI is kept in memory."
  },
  {
    question: "Which method is used to render a React component?",
    options: ["ReactDOM.render()", "React.render()", "render()", "DOM.render()"],
    answer: "ReactDOM.render()",
    explanation: "ReactDOM.render() is used to render a React element into the DOM."
  },
  {
    question: "What is a component in React?",
    options: ["A function or class that returns HTML", "A database table", "A server route", "A CSS file"],
    answer: "A function or class that returns HTML",
    explanation: "Components are the building blocks of React applications."
  },
  {
    question: "What is state in React?",
    options: ["A permanent storage", "An internal data store (object) of a component", "A global variable", "A database"],
    answer: "An internal data store (object) of a component",
    explanation: "State is an object that holds some information that may change over the lifetime of the component."
  },
  {
    question: "What are props in React?",
    options: ["Internal component data", "Arguments passed into React components", "Global variables", "Database connections"],
    answer: "Arguments passed into React components",
    explanation: "Props (properties) are read-only components."
  },
  {
    question: "How do you handle events in React?",
    options: ["Using addEventListener", "Using inline event handlers like onClick", "Using jQuery", "Using global event listeners"],
    answer: "Using inline event handlers like onClick",
    explanation: "React events are named using camelCase, rather than lowercase."
  },
  {
    question: "What is the use of useEffect hook?",
    options: ["To handle side effects in functional components", "To manage state", "To create context", "To optimize performance"],
    answer: "To handle side effects in functional components",
    explanation: "useEffect lets you perform side effects in function components."
  },
  {
    question: "What is the use of useState hook?",
    options: ["To handle side effects", "To add state to functional components", "To create context", "To optimize performance"],
    answer: "To add state to functional components",
    explanation: "useState is a Hook that lets you add React state to function components."
  },
  {
    question: "What is the Context API used for?",
    options: ["To manage global state", "To handle routing", "To make API calls", "To style components"],
    answer: "To manage global state",
    explanation: "Context provides a way to pass data through the component tree without having to pass props down manually at every level."
  },
  {
    question: "What is Redux?",
    options: ["A database", "A state management library", "A routing library", "A styling library"],
    answer: "A state management library",
    explanation: "Redux is a predictable state container for JavaScript apps."
  },
  {
    question: "What is a higher-order component (HOC)?",
    options: ["A component that returns another component", "A component that renders a list", "A component that handles errors", "A component that manages state"],
    answer: "A component that returns another component",
    explanation: "A higher-order component is a function that takes a component and returns a new component."
  },
  {
    question: "What are keys in React lists?",
    options: ["Unique identifiers for list items", "Passwords", "API keys", "Index numbers"],
    answer: "Unique identifiers for list items",
    explanation: "Keys help React identify which items have changed, are added, or are removed."
  },
  {
    question: "What is the purpose of refs in React?",
    options: ["To access DOM nodes directly", "To manage state", "To handle routing", "To style components"],
    answer: "To access DOM nodes directly",
    explanation: "Refs provide a way to access DOM nodes or React elements created in the render method."
  },
  {
    question: "What is React Router?",
    options: ["A library for routing in React apps", "A database", "A state management library", "A styling library"],
    answer: "A library for routing in React apps",
    explanation: "React Router is the standard routing library for React."
  },
  {
    question: "What is a fragment in React?",
    options: ["A way to group a list of children without adding extra nodes to the DOM", "A piece of code", "A broken component", "A database record"],
    answer: "A way to group a list of children without adding extra nodes to the DOM",
    explanation: "Fragments let you group a list of children without adding extra nodes to the DOM."
  },
  {
    question: "What is the difference between a class component and a functional component?",
    options: ["Class components have lifecycle methods, functional components use hooks", "Functional components are faster", "Class components are deprecated", "There is no difference"],
    answer: "Class components have lifecycle methods, functional components use hooks",
    explanation: "Before Hooks, functional components were stateless."
  },
  {
    question: "What is the significance of keys in React?",
    options: ["They help React identify which items have changed", "They are used for encryption", "They are used for authentication", "They are used for styling"],
    answer: "They help React identify which items have changed",
    explanation: "Keys help React identify which items have changed, are added, or are removed."
  },
  {
    question: "What is the use of useMemo hook?",
    options: ["To memoize expensive calculations", "To manage state", "To handle side effects", "To create context"],
    answer: "To memoize expensive calculations",
    explanation: "useMemo returns a memoized value."
  },
  {
    question: "What is the use of useCallback hook?",
    options: ["To memoize functions", "To manage state", "To handle side effects", "To create context"],
    answer: "To memoize functions",
    explanation: "useCallback returns a memoized callback."
  },
  {
    question: "What is prop drilling?",
    options: ["Passing props through multiple levels of components", "Drilling holes in props", "Deleting props", "Creating props"],
    answer: "Passing props through multiple levels of components",
    explanation: "Prop drilling refers to the process of passing data from a parent component down to a deep child component."
  },
  {
    question: "What is the difference between state and props?",
    options: ["State is internal and mutable, props are external and immutable", "State is external, props are internal", "State is immutable, props are mutable", "There is no difference"],
    answer: "State is internal and mutable, props are external and immutable",
    explanation: "Props get passed to the component, whereas state is managed within the component."
  },
  {
    question: "What is the lifecycle method componentDidMount used for?",
    options: ["To perform actions after the component is rendered", "To update state", "To handle errors", "To render the component"],
    answer: "To perform actions after the component is rendered",
    explanation: "componentDidMount is invoked immediately after a component is mounted."
  },
  {
    question: "What is the lifecycle method componentDidUpdate used for?",
    options: ["To perform actions after the component updates", "To initialize state", "To handle errors", "To render the component"],
    answer: "To perform actions after the component updates",
    explanation: "componentDidUpdate is invoked immediately after updating occurs."
  },
  {
    question: "What is the lifecycle method componentWillUnmount used for?",
    options: ["To perform cleanup before the component is removed", "To update state", "To handle errors", "To render the component"],
    answer: "To perform cleanup before the component is removed",
    explanation: "componentWillUnmount is invoked immediately before a component is unmounted and destroyed."
  },
  {
    question: "What is React Fiber?",
    options: ["The new reconciliation engine in React 16", "A styling library", "A database", "A routing library"],
    answer: "The new reconciliation engine in React 16",
    explanation: "React Fiber is the new reconciliation algorithm in React 16."
  },
  {
    question: "What is a portal in React?",
    options: ["A way to render children into a DOM node that exists outside the DOM hierarchy of the parent component", "A way to transport data", "A database connection", "A routing mechanism"],
    answer: "A way to render children into a DOM node that exists outside the DOM hierarchy of the parent component",
    explanation: "Portals provide a first-class way to render children into a DOM node that exists outside the DOM hierarchy of the parent component."
  },
  {
    question: "What is strict mode in React?",
    options: ["A tool for highlighting potential problems in an application", "A way to enforce strict typing", "A way to secure the app", "A way to optimize performance"],
    answer: "A tool for highlighting potential problems in an application",
    explanation: "StrictMode is a tool for highlighting potential problems in an application."
  },
  {
    question: "What is the use of useRef hook?",
    options: ["To access DOM elements and persist values", "To manage state", "To handle side effects", "To create context"],
    answer: "To access DOM elements and persist values",
    explanation: "useRef returns a mutable ref object whose .current property is initialized to the passed argument."
  },
  {
    question: "What is the use of useReducer hook?",
    options: ["To manage complex state logic", "To handle side effects", "To create context", "To optimize performance"],
    answer: "To manage complex state logic",
    explanation: "useReducer is usually preferable to useState when you have complex state logic."
  },
  {
    question: "What is the use of useLayoutEffect hook?",
    options: ["To read layout from the DOM and synchronously re-render", "To handle side effects", "To manage state", "To create context"],
    answer: "To read layout from the DOM and synchronously re-render",
    explanation: "The signature is identical to useEffect, but it fires synchronously after all DOM mutations."
  },
  {
    question: "What is the use of useImperativeHandle hook?",
    options: ["To customize the instance value that is exposed to parent components when using ref", "To manage state", "To handle side effects", "To create context"],
    answer: "To customize the instance value that is exposed to parent components when using ref",
    explanation: "useImperativeHandle customizes the instance value that is exposed to parent components when using ref."
  },
  {
    question: "What is the use of useDebugValue hook?",
    options: ["To display a label for custom hooks in React DevTools", "To debug the app", "To log errors", "To manage state"],
    answer: "To display a label for custom hooks in React DevTools",
    explanation: "useDebugValue can be used to display a label for custom hooks in React DevTools."
  },
  {
    question: "What is lazy loading in React?",
    options: ["Loading components only when they are needed", "Loading components slowly", "Loading data lazily", "None of the above"],
    answer: "Loading components only when they are needed",
    explanation: "React.lazy function lets you render a dynamic import as a regular component."
  },
  {
    question: "What is Suspense in React?",
    options: ["A component that lets you wait for some code to load", "A state management library", "A routing library", "A styling library"],
    answer: "A component that lets you wait for some code to load",
    explanation: "Suspense lets your components 'wait' for something before they can render."
  },
  {
    question: "What is Error Boundary in React?",
    options: ["A component that catches JavaScript errors anywhere in their child component tree", "A way to handle API errors", "A way to validate props", "A way to secure the app"],
    answer: "A component that catches JavaScript errors anywhere in their child component tree",
    explanation: "Error boundaries are React components that catch JavaScript errors anywhere in their child component tree."
  },
  {
    question: "What is the difference between controlled and uncontrolled components?",
    options: ["Controlled components are handled by React state, uncontrolled components are handled by the DOM", "Controlled components are faster", "Uncontrolled components are deprecated", "There is no difference"],
    answer: "Controlled components are handled by React state, uncontrolled components are handled by the DOM",
    explanation: "In a controlled component, form data is handled by a React component."
  },
  {
    question: "What is the use of forwardRef?",
    options: ["To pass a ref through a component to one of its children", "To move forward in history", "To reference the next component", "To manage state"],
    answer: "To pass a ref through a component to one of its children",
    explanation: "Ref forwarding is a technique for automatically passing a ref through a component to one of its children."
  },
  {
    question: "What is the use of React.memo?",
    options: ["To memoize a component", "To memoize a function", "To memoize a value", "To manage state"],
    answer: "To memoize a component",
    explanation: "React.memo is a higher order component for memoizing functional components."
  },
  {
    question: "What is the use of React.PureComponent?",
    options: ["To implement shouldComponentUpdate with a shallow prop and state comparison", "To create a pure function", "To manage state", "To handle side effects"],
    answer: "To implement shouldComponentUpdate with a shallow prop and state comparison",
    explanation: "React.PureComponent is similar to React.Component but it implements shouldComponentUpdate()."
  },
  {
    question: "What is the use of React.createElement?",
    options: ["To create a React element", "To create a DOM element", "To create a component", "To create a state"],
    answer: "To create a React element",
    explanation: "React.createElement() creates and returns a new React element."
  },
  {
    question: "What is the use of React.cloneElement?",
    options: ["To clone and return a new React element using an element as the starting point", "To clone a component", "To clone the DOM", "To clone state"],
    answer: "To clone and return a new React element using an element as the starting point",
    explanation: "React.cloneElement() clones and returns a new React element."
  },
  {
    question: "What is the use of React.Children?",
    options: ["To deal with the this.props.children opaque data structure", "To access child components", "To manage state", "To handle side effects"],
    answer: "To deal with the this.props.children opaque data structure",
    explanation: "React.Children provides utilities for dealing with the this.props.children opaque data structure."
  },
  {
    question: "What is the use of React.isValidElement?",
    options: ["To verify if an object is a React element", "To validate props", "To validate state", "To validate context"],
    answer: "To verify if an object is a React element",
    explanation: "React.isValidElement() verifies that the object is a React element."
  },
  {
    question: "What is the use of React.Fragment?",
    options: ["To group a list of children without adding extra nodes to the DOM", "To create a fragment of code", "To break the app", "To manage state"],
    answer: "To group a list of children without adding extra nodes to the DOM",
    explanation: "React.Fragment lets you group a list of children without adding extra nodes to the DOM."
  },
  {
    question: "What is the use of React.createRef?",
    options: ["To create a ref", "To create a state", "To create a context", "To create a component"],
    answer: "To create a ref",
    explanation: "React.createRef() creates a ref that can be attached to React elements via the ref attribute."
  },
  {
    question: "What is the use of React.createContext?",
    options: ["To create a Context object", "To create a state", "To create a ref", "To create a component"],
    answer: "To create a Context object",
    explanation: "React.createContext() creates a Context object."
  },
  {
    question: "What is the use of React.lazy?",
    options: ["To define a component that is loaded dynamically", "To load data lazily", "To optimize performance", "To manage state"],
    answer: "To define a component that is loaded dynamically",
    explanation: "React.lazy() lets you define a component that is loaded dynamically."
  }
];

module.exports = questions;

module.exports = questions;
