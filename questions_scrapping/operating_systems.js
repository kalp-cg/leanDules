const questions = [
  {
    question: "What is an Operating System?",
    options: ["Interface between user and hardware", "A type of hardware", "A word processor", "A web browser"],
    answer: "Interface between user and hardware",
    explanation: "An Operating System (OS) is system software that manages computer hardware and software resources and provides common services for computer programs."
  },
  {
    question: "What is the kernel?",
    options: ["The core component of an OS", "A type of corn", "A shell", "A user application"],
    answer: "The core component of an OS",
    explanation: "The kernel is the central part of an operating system. It manages the operations of the computer and the hardware."
  },
  {
    question: "What is a process?",
    options: ["A program in execution", "A file on disk", "A hardware component", "A user"],
    answer: "A program in execution",
    explanation: "A process is an instance of a computer program that is being executed."
  },
  {
    question: "What is a thread?",
    options: ["A lightweight process", "A string", "A file", "A directory"],
    answer: "A lightweight process",
    explanation: "A thread is the smallest sequence of programmed instructions that can be managed independently by a scheduler."
  },
  {
    question: "What is multitasking?",
    options: ["Executing multiple tasks simultaneously", "Doing one thing at a time", "Writing code", "Browsing the web"],
    answer: "Executing multiple tasks simultaneously",
    explanation: "Multitasking is the concurrent execution of multiple tasks (also known as processes) over a certain period of time."
  },
  {
    question: "What is virtual memory?",
    options: ["A memory management technique", "Real memory", "A hard drive", "A CPU"],
    answer: "A memory management technique",
    explanation: "Virtual memory is a memory management technique that provides an idealized abstraction of the storage resources that are actually available on a given machine."
  },
  {
    question: "What is paging?",
    options: ["A memory management scheme", "A book reading technique", "A CPU scheduling algorithm", "A disk scheduling algorithm"],
    answer: "A memory management scheme",
    explanation: "Paging is a memory management scheme that eliminates the need for contiguous allocation of physical memory."
  },
  {
    question: "What is segmentation?",
    options: ["A memory management scheme", "A marketing strategy", "A CPU scheduling algorithm", "A disk scheduling algorithm"],
    answer: "A memory management scheme",
    explanation: "Segmentation is a memory management scheme that supports this user view of memory."
  },
  {
    question: "What is a deadlock?",
    options: ["A situation where a set of processes are blocked", "A broken lock", "A crashed computer", "A slow network"],
    answer: "A situation where a set of processes are blocked",
    explanation: "Deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process."
  },
  {
    question: "What is a semaphore?",
    options: ["A variable used to control access to a common resource", "A flag", "A signal", "A message"],
    answer: "A variable used to control access to a common resource",
    explanation: "A semaphore is a variable or abstract data type used to control access to a common resource by multiple processes in a concurrent system."
  },
  {
    question: "What is a mutex?",
    options: ["A mutual exclusion object", "A type of variable", "A function", "A class"],
    answer: "A mutual exclusion object",
    explanation: "A mutex is a program object that allows multiple program threads to share the same resource, such as file access, but not simultaneously."
  },
  {
    question: "What is context switching?",
    options: ["Storing the state of a process and restoring it later", "Changing clothes", "Switching users", "Switching networks"],
    answer: "Storing the state of a process and restoring it later",
    explanation: "Context switching is the process of storing the state of a process or thread, so that it can be restored and resume execution at a later point."
  },
  {
    question: "What is a system call?",
    options: ["A programmatic way a program requests a service from the kernel", "A phone call", "A function call", "A variable"],
    answer: "A programmatic way a program requests a service from the kernel",
    explanation: "A system call is the programmatic way in which a computer program requests a service from the kernel of the operating system it is executed on."
  },
  {
    question: "What is a shell?",
    options: ["A user interface for access to an operating system's services", "A sea shell", "A kernel", "A file"],
    answer: "A user interface for access to an operating system's services",
    explanation: "A shell is a user interface for access to an operating system's services."
  },
  {
    question: "What is a file system?",
    options: ["Method and data structure that the operating system uses to control how data is stored and retrieved", "A database", "A network", "A hardware"],
    answer: "Method and data structure that the operating system uses to control how data is stored and retrieved",
    explanation: "A file system controls how data is stored and retrieved."
  },
  {
    question: "What is fragmentation?",
    options: ["A condition in which storage space is used inefficiently", "Breaking things", "A file type", "A virus"],
    answer: "A condition in which storage space is used inefficiently",
    explanation: "Fragmentation occurs when storage space is used inefficiently, reducing capacity or performance."
  },
  {
    question: "What is thrashing?",
    options: ["A situation where the OS spends more time paging than executing", "Beating something", "A fast computer", "A slow network"],
    answer: "A situation where the OS spends more time paging than executing",
    explanation: "Thrashing occurs when a computer's virtual memory resources are overused, leading to a constant state of paging and page faults."
  },
  {
    question: "What is a scheduler?",
    options: ["A system software that handles process scheduling", "A calendar", "A person", "A clock"],
    answer: "A system software that handles process scheduling",
    explanation: "The scheduler is the part of the OS that decides which process runs at a certain point in time."
  },
  {
    question: "What is FCFS?",
    options: ["First-Come, First-Served", "First-Come, First-Saved", "Fast-Computer, Fast-Server", "None of the above"],
    answer: "First-Come, First-Served",
    explanation: "FCFS is the simplest scheduling algorithm."
  },
  {
    question: "What is Round Robin scheduling?",
    options: ["A scheduling algorithm where each process gets a small unit of CPU time", "A bird", "A game", "A sport"],
    answer: "A scheduling algorithm where each process gets a small unit of CPU time",
    explanation: "Round Robin is a CPU scheduling algorithm where each process is assigned a fixed time slot in a cyclic way."
  },
  {
    question: "What is a critical section?",
    options: ["A part of code that accesses shared resources", "A dangerous place", "A VIP area", "A file"],
    answer: "A part of code that accesses shared resources",
    explanation: "A critical section is a piece of code that accesses a shared resource that must not be concurrently accessed by more than one thread of execution."
  },
  {
    question: "What is a race condition?",
    options: ["A situation where the output depends on the sequence or timing of other uncontrollable events", "A car race", "A running competition", "A fast computer"],
    answer: "A situation where the output depends on the sequence or timing of other uncontrollable events",
    explanation: "A race condition occurs when two or more threads can access shared data and they try to change it at the same time."
  },
  {
    question: "What is a zombie process?",
    options: ["A process that has completed execution but still has an entry in the process table", "A dead process", "A virus", "A game"],
    answer: "A process that has completed execution but still has an entry in the process table",
    explanation: "A zombie process is a process that has completed execution but still has an entry in the process table."
  },
  {
    question: "What is an orphan process?",
    options: ["A process whose parent process has finished or terminated", "A child process", "A lost process", "A file"],
    answer: "A process whose parent process has finished or terminated",
    explanation: "An orphan process is a computer process whose parent process has finished or terminated, though it remains running itself."
  },
  {
    question: "What is spooling?",
    options: ["Simultaneous Peripheral Operations On-Line", "Spinning", "Pooling", "Cooling"],
    answer: "Simultaneous Peripheral Operations On-Line",
    explanation: "Spooling is a specialized form of multi-programming for the purpose of copying data between different devices."
  },
  {
    question: "What is a device driver?",
    options: ["A computer program that operates or controls a particular type of device", "A car driver", "A screw driver", "A hardware"],
    answer: "A computer program that operates or controls a particular type of device",
    explanation: "A device driver is a computer program that operates or controls a particular type of device that is attached to a computer."
  },
  {
    question: "What is BIOS?",
    options: ["Basic Input/Output System", "Basic Internet Operating System", "Binary Input/Output System", "None of the above"],
    answer: "Basic Input/Output System",
    explanation: "BIOS is firmware used to perform hardware initialization during the booting process."
  },
  {
    question: "What is booting?",
    options: ["The process of starting a computer", "Putting on boots", "Kicking something", "Running a program"],
    answer: "The process of starting a computer",
    explanation: "Booting is the process of starting a computer."
  },
  {
    question: "What is a monolithic kernel?",
    options: ["An OS architecture where the entire operating system runs in kernel space", "A single kernel", "A large kernel", "A small kernel"],
    answer: "An OS architecture where the entire operating system runs in kernel space",
    explanation: "A monolithic kernel is an operating system architecture where the entire operating system is working in kernel space."
  },
  {
    question: "What is a microkernel?",
    options: ["An OS architecture where the kernel is kept as small as possible", "A small kernel", "A large kernel", "A single kernel"],
    answer: "An OS architecture where the kernel is kept as small as possible",
    explanation: "A microkernel is the near-minimum amount of software that can provide the mechanisms needed to implement an operating system."
  },
  {
    question: "What is RAID?",
    options: ["Redundant Array of Independent Disks", "Random Array of Independent Disks", "Rapid Array of Independent Disks", "None of the above"],
    answer: "Redundant Array of Independent Disks",
    explanation: "RAID is a data storage virtualization technology that combines multiple physical disk drive components into one or more logical units."
  },
  {
    question: "What is a page fault?",
    options: ["An exception raised by computer hardware when a program accesses a memory page that is not currently mapped by the memory management unit", "A mistake", "A crash", "A bug"],
    answer: "An exception raised by computer hardware when a program accesses a memory page that is not currently mapped by the memory management unit",
    explanation: "A page fault is a type of exception raised by computer hardware when a running program accesses a memory page that is not currently mapped by the memory management unit (MMU) into the virtual address space of a process."
  },
  {
    question: "What is LRU?",
    options: ["Least Recently Used", "Last Recently Used", "Least Randomly Used", "Last Randomly Used"],
    answer: "Least Recently Used",
    explanation: "LRU is a page replacement algorithm."
  },
  {
    question: "What is FIFO?",
    options: ["First-In, First-Out", "First-In, First-Off", "Fast-In, Fast-Out", "None of the above"],
    answer: "First-In, First-Out",
    explanation: "FIFO is a method for organizing and manipulating a data buffer."
  },
  {
    question: "What is a socket?",
    options: ["An endpoint for sending or receiving data across a computer network", "A plug", "A hole", "A file"],
    answer: "An endpoint for sending or receiving data across a computer network",
    explanation: "A network socket is an internal endpoint for sending or receiving data at a single node in a computer network."
  },
  {
    question: "What is DMA?",
    options: ["Direct Memory Access", "Direct Media Access", "Digital Memory Access", "Digital Media Access"],
    answer: "Direct Memory Access",
    explanation: "DMA is a feature of computer systems that allows certain hardware subsystems to access main system memory independently of the central processing unit (CPU)."
  },
  {
    question: "What is an interrupt?",
    options: ["A signal to the processor emitted by hardware or software indicating an event that needs immediate attention", "A break", "A pause", "A stop"],
    answer: "A signal to the processor emitted by hardware or software indicating an event that needs immediate attention",
    explanation: "An interrupt is a signal to the processor emitted by hardware or software indicating an event that needs immediate attention."
  },
  {
    question: "What is polling?",
    options: ["The process where the computer or controlling device waits for an external device to check for its readiness or state", "Voting", "Asking questions", "None of the above"],
    answer: "The process where the computer or controlling device waits for an external device to check for its readiness or state",
    explanation: "Polling is the process where the computer or controlling device waits for an external device to check for its readiness or state."
  },
  {
    question: "What is a buffer overflow?",
    options: ["An anomaly where a program, while writing data to a buffer, overruns the buffer's boundary and overwrites adjacent memory locations", "A full buffer", "A spilled buffer", "A crash"],
    answer: "An anomaly where a program, while writing data to a buffer, overruns the buffer's boundary and overwrites adjacent memory locations",
    explanation: "A buffer overflow is an anomaly where a program, while writing data to a buffer, overruns the buffer's boundary and overwrites adjacent memory locations."
  },
  {
    question: "What is a distributed operating system?",
    options: ["An OS that manages a group of distinct computers and makes them appear to be a single computer", "A network OS", "A web OS", "A cloud OS"],
    answer: "An OS that manages a group of distinct computers and makes them appear to be a single computer",
    explanation: "A distributed operating system is a software over a collection of independent, networked, communicating, and physically separate computational nodes."
  },
  {
    question: "What is a real-time operating system (RTOS)?",
    options: ["An OS intended to serve real-time applications that process data as it comes in", "A fast OS", "A slow OS", "A clock OS"],
    answer: "An OS intended to serve real-time applications that process data as it comes in",
    explanation: "A real-time operating system (RTOS) is an operating system intended to serve real-time applications that process data as it comes in, typically without buffer delays."
  },
  {
    question: "What is a batch operating system?",
    options: ["An OS where users do not interact with the computer directly", "A group OS", "A cookie OS", "A file OS"],
    answer: "An OS where users do not interact with the computer directly",
    explanation: "In a batch operating system, users do not interact with the computer directly. Each user prepares his job on an off-line device like punch cards and submits it to the computer operator."
  },
  {
    question: "What is time-sharing?",
    options: ["Sharing of a computing resource among many users by means of multiprogramming and multi-tasking", "Sharing time", "Sharing a watch", "Sharing a clock"],
    answer: "Sharing of a computing resource among many users by means of multiprogramming and multi-tasking",
    explanation: "Time-sharing is the sharing of a computing resource among many users by means of multiprogramming and multi-tasking."
  },
  {
    question: "What is a command line interface (CLI)?",
    options: ["A means of interacting with a computer program where the user issues commands to the program in the form of successive lines of text", "A GUI", "A mouse", "A keyboard"],
    answer: "A means of interacting with a computer program where the user issues commands to the program in the form of successive lines of text",
    explanation: "A command-line interface (CLI) processes commands to a computer program in the form of lines of text."
  },
  {
    question: "What is a graphical user interface (GUI)?",
    options: ["A form of user interface that allows users to interact with electronic devices through graphical icons and audio indicator", "A CLI", "A text interface", "A code interface"],
    answer: "A form of user interface that allows users to interact with electronic devices through graphical icons and audio indicator",
    explanation: "A graphical user interface (GUI) allows users to interact with electronic devices through graphical icons and audio indicator such as primary notation."
  },
  {
    question: "What is a path?",
    options: ["A string of characters used to uniquely identify a location in a directory structure", "A road", "A way", "A direction"],
    answer: "A string of characters used to uniquely identify a location in a directory structure",
    explanation: "A path is a string of characters used to uniquely identify a location in a directory structure."
  },
  {
    question: "What is a permission?",
    options: ["Access rights to a file or directory", "A request", "A question", "A rule"],
    answer: "Access rights to a file or directory",
    explanation: "Permissions are access rights to a file or directory."
  },
  {
    question: "What is a user account?",
    options: ["A location on a network server used to store a computer username, password, and other information", "A bank account", "A social media account", "A email account"],
    answer: "A location on a network server used to store a computer username, password, and other information",
    explanation: "A user account is a location on a network server used to store a computer username, password, and other information."
  },
  {
    question: "What is a superuser?",
    options: ["A special user account used for system administration", "A hero", "A boss", "A manager"],
    answer: "A special user account used for system administration",
    explanation: "A superuser is a special user account used for system administration."
  },
  {
    question: "What is a daemon?",
    options: ["A computer program that runs as a background process", "A demon", "A ghost", "A virus"],
    answer: "A computer program that runs as a background process",
    explanation: "A daemon is a computer program that runs as a background process, rather than being under the direct control of an interactive user."
  }
];

module.exports = questions;
