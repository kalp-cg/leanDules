const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const topics = [
  { name: 'React', slug: 'react', description: 'React.js library' },
  { name: 'JavaScript', slug: 'javascript', description: 'JavaScript programming language' },
  { name: 'Next.js', slug: 'nextjs', description: 'The React Framework for the Web' },
  { name: 'Express.js', slug: 'express', description: 'Fast, unopinionated, minimalist web framework for Node.js' },
  { name: 'Node.js', slug: 'nodejs', description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine' },
  { name: 'UI/UX', slug: 'ui-ux', description: 'User Interface and User Experience Design' },
];

const questions = {
  'React': [
    {
      content: 'What is the virtual DOM in React?',
      options: [
        { id: 'A', text: 'A direct copy of the real DOM' },
        { id: 'B', text: 'A lightweight copy of the real DOM' },
        { id: 'C', text: 'A database for React components' },
        { id: 'D', text: 'A browser extension' }
      ],
      correctAnswer: 'B',
      difficulty: 'medium',
      explanation: 'The virtual DOM is a lightweight copy of the real DOM that React uses to optimize updates.'
    },
    {
      content: 'Which hook is used for side effects in React?',
      options: [
        { id: 'A', text: 'useState' },
        { id: 'B', text: 'useContext' },
        { id: 'C', text: 'useEffect' },
        { id: 'D', text: 'useReducer' }
      ],
      correctAnswer: 'C',
      difficulty: 'easy',
      explanation: 'useEffect is the hook used for performing side effects in function components.'
    },
    {
      content: 'What is JSX?',
      options: [
        { id: 'A', text: 'JavaScript XML' },
        { id: 'B', text: 'Java Syntax Extension' },
        { id: 'C', text: 'JSON XML' },
        { id: 'D', text: 'JavaScript Extension' }
      ],
      correctAnswer: 'A',
      difficulty: 'easy',
      explanation: 'JSX stands for JavaScript XML. It allows us to write HTML in React.'
    },
    {
      content: 'What is the purpose of useMemo?',
      options: [
        { id: 'A', text: 'To memorize functions' },
        { id: 'B', text: 'To memoize expensive calculations' },
        { id: 'C', text: 'To store state' },
        { id: 'D', text: 'To handle side effects' }
      ],
      correctAnswer: 'B',
      difficulty: 'hard',
      explanation: 'useMemo returns a memoized value, recomputing it only when dependencies change.'
    },
    {
      content: 'What is the default behavior of useEffect?',
      options: [
        { id: 'A', text: 'Runs only on mount' },
        { id: 'B', text: 'Runs after every render' },
        { id: 'C', text: 'Runs only on unmount' },
        { id: 'D', text: 'Runs only when dependencies change' }
      ],
      correctAnswer: 'B',
      difficulty: 'medium',
      explanation: 'By default, useEffect runs after every render unless a dependency array is provided.'
    }
  ],
  'JavaScript': [
    {
      content: 'Which of these is NOT a primitive type in JavaScript?',
      options: [
        { id: 'A', text: 'String' },
        { id: 'B', text: 'Number' },
        { id: 'C', text: 'Object' },
        { id: 'D', text: 'Boolean' }
      ],
      correctAnswer: 'C',
      difficulty: 'easy',
      explanation: 'Object is a reference type, not a primitive type in JavaScript.'
    },
    {
      content: 'What is the output of "2" + 2 in JavaScript?',
      options: [
        { id: 'A', text: '4' },
        { id: 'B', text: '"22"' },
        { id: 'C', text: 'NaN' },
        { id: 'D', text: 'Error' }
      ],
      correctAnswer: 'B',
      difficulty: 'easy',
      explanation: 'The + operator concatenates strings, so "2" + 2 results in the string "22".'
    },
    {
      content: 'What does the "this" keyword refer to in a method?',
      options: [
        { id: 'A', text: 'The global object' },
        { id: 'B', text: 'The object that owns the method' },
        { id: 'C', text: 'The function itself' },
        { id: 'D', text: 'Undefined' }
      ],
      correctAnswer: 'B',
      difficulty: 'medium',
      explanation: 'In a method, "this" refers to the owner object.'
    },
    {
      content: 'What is a closure?',
      options: [
        { id: 'A', text: 'A function with no arguments' },
        { id: 'B', text: 'A function bundled with its lexical environment' },
        { id: 'C', text: 'A way to close a browser window' },
        { id: 'D', text: 'A method to stop a loop' }
      ],
      correctAnswer: 'B',
      difficulty: 'hard',
      explanation: 'A closure is the combination of a function and the lexical environment within which that function was declared.'
    },
    {
      content: 'What is the difference between == and ===?',
      options: [
        { id: 'A', text: 'No difference' },
        { id: 'B', text: '== checks value, === checks value and type' },
        { id: 'C', text: '== checks type, === checks value' },
        { id: 'D', text: '== is for strings, === is for numbers' }
      ],
      correctAnswer: 'B',
      difficulty: 'easy',
      explanation: '=== is the strict equality operator which checks both value and type.'
    }
  ],
  'Next.js': [
    {
      content: 'Which function is used for Static Site Generation (SSG) in Next.js?',
      options: [
        { id: 'A', text: 'getServerSideProps' },
        { id: 'B', text: 'getStaticProps' },
        { id: 'C', text: 'getInitialProps' },
        { id: 'D', text: 'useEffect' }
      ],
      correctAnswer: 'B',
      difficulty: 'medium',
      explanation: 'getStaticProps is used to fetch data at build time for Static Site Generation.'
    },
    {
      content: 'What is the default routing mechanism in Next.js?',
      options: [
        { id: 'A', text: 'Configuration based' },
        { id: 'B', text: 'File-system based' },
        { id: 'C', text: 'Code based' },
        { id: 'D', text: 'Database based' }
      ],
      correctAnswer: 'B',
      difficulty: 'easy',
      explanation: 'Next.js uses a file-system based router built on the concept of pages.'
    },
    {
      content: 'What is Incremental Static Regeneration (ISR)?',
      options: [
        { id: 'A', text: 'Rebuilding the whole site on every request' },
        { id: 'B', text: 'Updating static pages after you have built your site' },
        { id: 'C', text: 'Generating pages only on the client side' },
        { id: 'D', text: 'A database caching strategy' }
      ],
      correctAnswer: 'B',
      difficulty: 'hard',
      explanation: 'ISR allows you to create or update static pages after you have built your site.'
    }
  ],
  'Express.js': [
    {
      content: 'What is middleware in Express?',
      options: [
        { id: 'A', text: 'A database driver' },
        { id: 'B', text: 'Functions that have access to the request and response objects' },
        { id: 'C', text: 'A frontend framework' },
        { id: 'D', text: 'A testing tool' }
      ],
      correctAnswer: 'B',
      difficulty: 'medium',
      explanation: 'Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function.'
    },
    {
      content: 'Which method is used to handle GET requests?',
      options: [
        { id: 'A', text: 'app.post()' },
        { id: 'B', text: 'app.use()' },
        { id: 'C', text: 'app.get()' },
        { id: 'D', text: 'app.all()' }
      ],
      correctAnswer: 'C',
      difficulty: 'easy',
      explanation: 'app.get() is used to route HTTP GET requests to the specified path.'
    },
    {
      content: 'How do you handle errors globally in Express?',
      options: [
        { id: 'A', text: 'Using try-catch in every route' },
        { id: 'B', text: 'Using a middleware with 4 arguments (err, req, res, next)' },
        { id: 'C', text: 'Using app.error()' },
        { id: 'D', text: 'It is handled automatically' }
      ],
      correctAnswer: 'B',
      difficulty: 'hard',
      explanation: 'Express error-handling middleware functions are defined in the same way as other middleware functions, except they have four arguments instead of three.'
    }
  ],
  'Node.js': [
    {
      content: 'Is Node.js single-threaded?',
      options: [
        { id: 'A', text: 'Yes, but it uses an event loop for concurrency' },
        { id: 'B', text: 'No, it is multi-threaded by default' },
        { id: 'C', text: 'Yes, and it blocks on I/O' },
        { id: 'D', text: 'No, it uses Java threads' }
      ],
      correctAnswer: 'A',
      difficulty: 'medium',
      explanation: 'Node.js runs on a single thread but uses a non-blocking I/O model and event loop to handle concurrency.'
    },
    {
      content: 'What is npm?',
      options: [
        { id: 'A', text: 'Node Project Manager' },
        { id: 'B', text: 'Node Package Manager' },
        { id: 'C', text: 'New Package Manager' },
        { id: 'D', text: 'Node Process Manager' }
      ],
      correctAnswer: 'B',
      difficulty: 'easy',
      explanation: 'npm stands for Node Package Manager, which is the default package manager for Node.js.'
    },
    {
      content: 'What is the purpose of Buffer class in Node.js?',
      options: [
        { id: 'A', text: 'To buffer video streaming' },
        { id: 'B', text: 'To handle binary data' },
        { id: 'C', text: 'To cache API responses' },
        { id: 'D', text: 'To manage memory manually' }
      ],
      correctAnswer: 'B',
      difficulty: 'hard',
      explanation: 'The Buffer class in Node.js is designed to handle raw binary data.'
    }
  ],
  'UI/UX': [
    {
      content: 'What does UX stand for?',
      options: [
        { id: 'A', text: 'User Experience' },
        { id: 'B', text: 'User Extension' },
        { id: 'C', text: 'Unified Experience' },
        { id: 'D', text: 'User Xylophone' }
      ],
      correctAnswer: 'A',
      difficulty: 'easy',
      explanation: 'UX stands for User Experience, which focuses on the overall experience of a person using a product.'
    },
    {
      content: 'Which of these is a UI design tool?',
      options: [
        { id: 'A', text: 'Figma' },
        { id: 'B', text: 'VS Code' },
        { id: 'C', text: 'Postman' },
        { id: 'D', text: 'Docker' }
      ],
      correctAnswer: 'A',
      difficulty: 'easy',
      explanation: 'Figma is a popular web-based vector graphics editor and prototyping tool used for UI design.'
    },
    {
      content: 'What is the difference between UI and UX?',
      options: [
        { id: 'A', text: 'UI is coding, UX is design' },
        { id: 'B', text: 'UI is how it looks, UX is how it works' },
        { id: 'C', text: 'UI is for users, UX is for developers' },
        { id: 'D', text: 'They are the same thing' }
      ],
      correctAnswer: 'B',
      difficulty: 'medium',
      explanation: 'UI (User Interface) refers to the visual elements, while UX (User Experience) refers to the overall interaction and feel.'
    },
    {
      content: 'What is Heuristic Evaluation?',
      options: [
        { id: 'A', text: 'A user testing method' },
        { id: 'B', text: 'A usability inspection method' },
        { id: 'C', text: 'A coding standard' },
        { id: 'D', text: 'A project management tool' }
      ],
      correctAnswer: 'B',
      difficulty: 'hard',
      explanation: 'Heuristic evaluation is a usability inspection method for computer software that helps to identify usability problems in the user interface design.'
    }
  ]
};

async function main() {
  console.log('Start seeding practice questions...');

  // Get admin user for authorId
  const admin = await prisma.user.findFirst({
    where: { role: 'admin' }
  });

  if (!admin) {
    console.error('No admin user found. Please run create-admin.js first.');
    return;
  }

  for (const topicData of topics) {
    console.log(`Processing topic: ${topicData.name}`);
    
    // Create or update topic
    // First check if topic exists by name to avoid unique constraint error
    let topic = await prisma.topic.findUnique({
      where: { name: topicData.name }
    });

    if (!topic) {
      topic = await prisma.topic.upsert({
        where: { slug: topicData.slug },
        update: { name: topicData.name },
        create: topicData,
      });
    } else {
      // If found by name, ensure slug is correct (optional, but good for consistency)
      // But if slug is different and unique, we might have issues. 
      // For now, just use the found topic.
    }

    const topicQuestions = questions[topicData.name];
    if (topicQuestions) {
      for (const q of topicQuestions) {
        // Check if question exists (simple check by content)
        const existing = await prisma.question.findFirst({
          where: { content: q.content }
        });

        if (!existing) {
          await prisma.question.create({
            data: {
              content: q.content,
              options: q.options,
              correctAnswer: q.correctAnswer,
              difficulty: q.difficulty,
              explanation: q.explanation || 'No explanation provided.',
              status: 'published',
              authorId: admin.id,
              topics: {
                create: {
                  topicId: topic.id
                }
              }
            }
          });
          console.log(`Created question: ${q.content.substring(0, 30)}...`);
        } else {
          // Update existing question with new fields (explanation, status)
          await prisma.question.update({
            where: { id: existing.id },
            data: {
              options: q.options, // Update options in case we fixed typos
              correctAnswer: q.correctAnswer,
              difficulty: q.difficulty,
              explanation: q.explanation || 'No explanation provided.',
              status: 'published',
            }
          });
          console.log(`Updated question: ${q.content.substring(0, 30)}...`);
        }
      }
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
