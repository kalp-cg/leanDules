const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import questions from scrapping folder
const scrapedQuestions = require('../questions_scrapping/javascript.js');

async function seedJavaScriptQuestions() {
  try {
    console.log('🚀 Starting JavaScript questions seed...');

    // Find or create JavaScript topic
    let jsTopic = await prisma.topic.findFirst({
      where: { slug: 'javascript' }
    });

    if (!jsTopic) {
      // Find programming parent
      let programmingTopic = await prisma.topic.findFirst({
        where: { slug: 'programming' }
      });

      if (!programmingTopic) {
        programmingTopic = await prisma.topic.create({
          data: { name: 'Programming', slug: 'programming' }
        });
      }

      jsTopic = await prisma.topic.create({
        data: {
          name: 'JavaScript',
          slug: 'javascript',
          description: 'JavaScript programming language',
          parentId: programmingTopic.id
        }
      });
    }

    // Find admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!admin) {
      console.error('❌ No admin user found. Please create an admin first.');
      return;
    }

    console.log(`✅ Found JavaScript topic (ID: ${jsTopic.id})`);
    console.log(`✅ Using admin user (ID: ${admin.id})`);

    // Transform scraped questions to proper format
    const jsQuestions = scrapedQuestions.map((q, index) => {
      // Create options array with ids
      const optionsArray = q.options.map((opt, i) => ({
        id: String.fromCharCode(97 + i), // a, b, c, d
        text: opt
      }));

      // Find correct answer id
      const correctIndex = q.options.indexOf(q.answer);
      const correctAnswerId = String.fromCharCode(97 + correctIndex);

      // Determine difficulty based on position (distribute evenly)
      let difficulty = 'easy';
      if (index % 3 === 1) difficulty = 'medium';
      if (index % 3 === 2) difficulty = 'hard';

      return {
        content: q.question,
        options: optionsArray,
        correctAnswer: correctAnswerId,
        difficulty: difficulty,
        explanation: q.explanation,
        timeLimit: difficulty === 'hard' ? 45 : 30
      };
    });

    console.log(`\n📝 Creating ${jsQuestions.length} JavaScript questions...\n`);
      {
        content: 'Which method is used to add elements to the end of an array?',
        options: [
          { id: 'a', text: 'push()' },
          { id: 'b', text: 'pop()' },
          { id: 'c', text: 'shift()' },
          { id: 'd', text: 'unshift()' }
        ],
        correctAnswer: 'a',
        difficulty: 'easy',
        explanation: 'The push() method adds one or more elements to the end of an array and returns the new length.',
        timeLimit: 30
      },
      {
        content: 'What is the result of: 2 + 2 + "2"?',
        options: [
          { id: 'a', text: '"42"' },
          { id: 'b', text: '6' },
          { id: 'c', text: '"222"' },
          { id: 'd', text: '"22"' }
        ],
        correctAnswer: 'a',
        difficulty: 'medium',
        explanation: 'JavaScript evaluates left to right. First 2+2=4, then 4+"2" converts 4 to string and concatenates, resulting in "42".',
        timeLimit: 30
      },
      {
        content: 'Which keyword is used to declare a block-scoped variable?',
        options: [
          { id: 'a', text: 'let' },
          { id: 'b', text: 'var' },
          { id: 'c', text: 'const' },
          { id: 'd', text: 'Both a and c' }
        ],
        correctAnswer: 'd',
        difficulty: 'medium',
        explanation: 'Both let and const declare block-scoped variables, unlike var which is function-scoped.',
        timeLimit: 30
      },
      {
        content: 'What does "===" check in JavaScript?',
        options: [
          { id: 'a', text: 'Value and type equality' },
          { id: 'b', text: 'Only value equality' },
          { id: 'c', text: 'Only type equality' },
          { id: 'd', text: 'Reference equality' }
        ],
        correctAnswer: 'a',
        difficulty: 'easy',
        explanation: 'The strict equality operator (===) checks both value and type without type coercion.',
        timeLimit: 30
      },
      {
        content: 'What is a closure in JavaScript?',
        options: [
          { id: 'a', text: 'A function with access to outer scope variables' },
          { id: 'b', text: 'A loop structure' },
          { id: 'c', text: 'A type of object' },
          { id: 'd', text: 'A class method' }
        ],
        correctAnswer: 'a',
        difficulty: 'hard',
        explanation: 'A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned.',
        timeLimit: 45
      },
      {
        content: 'Which method is used to parse a JSON string?',
        options: [
          { id: 'a', text: 'JSON.parse()' },
          { id: 'b', text: 'JSON.stringify()' },
          { id: 'c', text: 'JSON.decode()' },
          { id: 'd', text: 'parseJSON()' }
        ],
        correctAnswer: 'a',
        difficulty: 'easy',
        explanation: 'JSON.parse() converts a JSON string into a JavaScript object.',
        timeLimit: 30
      },
      {
        content: 'What is the output of: [1, 2, 3].map(x => x * 2)?',
        options: [
          { id: 'a', text: '[2, 4, 6]' },
          { id: 'b', text: '[1, 2, 3]' },
          { id: 'c', text: '6' },
          { id: 'd', text: 'undefined' }
        ],
        correctAnswer: 'a',
        difficulty: 'medium',
        explanation: 'The map() method creates a new array with the results of calling a function for every element. Here it multiplies each element by 2.',
        timeLimit: 30
      },
      {
        content: 'What does the "async" keyword do?',
        options: [
          { id: 'a', text: 'Makes a function return a Promise' },
          { id: 'b', text: 'Makes a function synchronous' },
          { id: 'c', text: 'Creates a callback' },
          { id: 'd', text: 'Delays execution' }
        ],
        correctAnswer: 'a',
        difficulty: 'medium',
        explanation: 'The async keyword makes a function return a Promise, allowing the use of await inside it.',
        timeLimit: 30
      },
      {
        content: 'What is the difference between "null" and "undefined"?',
        options: [
          { id: 'a', text: 'null is assigned, undefined is uninitialized' },
          { id: 'b', text: 'They are the same' },
          { id: 'c', text: 'null is a string, undefined is not' },
          { id: 'd', text: 'undefined is assigned, null is uninitialized' }
        ],
        correctAnswer: 'a',
        difficulty: 'medium',
        explanation: 'null is an assignment value representing no value, while undefined means a variable has been declared but not assigned a value.',
        timeLimit: 30
      },
      {
        content: 'What does the spread operator (...) do?',
        options: [
          { id: 'a', text: 'Expands an iterable into individual elements' },
          { id: 'b', text: 'Creates a range of numbers' },
          { id: 'c', text: 'Multiplies values' },
          { id: 'd', text: 'Concatenates strings' }
        ],
        correctAnswer: 'a',
        difficulty: 'medium',
        explanation: 'The spread operator (...) allows an iterable (like an array) to be expanded into individual elements.',
        timeLimit: 30
      },
      {
        content: 'What is event bubbling in JavaScript?',
        options: [
          { id: 'a', text: 'Events propagate from child to parent elements' },
          { id: 'b', text: 'Events are cancelled' },
          { id: 'c', text: 'Events are delayed' },
          { id: 'd', text: 'Events execute in parallel' }
        ],
        correctAnswer: 'a',
        difficulty: 'hard',
        explanation: 'Event bubbling is when an event triggers on the deepest element, then bubbles up through its ancestors in the DOM tree.',
        timeLimit: 45
      },
      {
        content: 'What is the output of: console.log(0.1 + 0.2 === 0.3)?',
        options: [
          { id: 'a', text: 'false' },
          { id: 'b', text: 'true' },
          { id: 'c', text: 'undefined' },
          { id: 'd', text: 'NaN' }
        ],
        correctAnswer: 'a',
        difficulty: 'hard',
        explanation: 'Due to floating-point precision issues, 0.1 + 0.2 equals 0.30000000000000004, not exactly 0.3.',
        timeLimit: 45
      },
      {
        content: 'Which statement creates an arrow function?',
        options: [
          { id: 'a', text: 'const func = () => {}' },
          { id: 'b', text: 'function func() {}' },
          { id: 'c', text: 'const func = function() {}' },
          { id: 'd', text: 'func => {}' }
        ],
        correctAnswer: 'a',
        difficulty: 'easy',
        explanation: 'Arrow functions use the syntax: const func = () => {}. They have a shorter syntax and lexically bind "this".',
        timeLimit: 30
      },
      {
        content: 'What does "this" refer to in a regular function?',
        options: [
          { id: 'a', text: 'The calling context/object' },
          { id: 'b', text: 'The function itself' },
          { id: 'c', text: 'The global object always' },
          { id: 'd', text: 'undefined always' }
        ],
        correctAnswer: 'a',
        difficulty: 'medium',
        explanation: 'In a regular function, "this" refers to the object that called the function (the calling context).',
        timeLimit: 30
      },
      {
        content: 'What is the purpose of Promise.all()?',
        options: [
          { id: 'a', text: 'Wait for all promises to resolve' },
          { id: 'b', text: 'Wait for any promise to resolve' },
          { id: 'c', text: 'Cancel all promises' },
          { id: 'd', text: 'Create multiple promises' }
        ],
        correctAnswer: 'a',
        difficulty: 'hard',
        explanation: 'Promise.all() takes an array of promises and returns a single Promise that resolves when all input promises have resolved.',
        timeLimit: 45
      },
      {
        content: 'What is hoisting in JavaScript?',
        options: [
          { id: 'a', text: 'Moving declarations to the top of scope' },
          { id: 'b', text: 'Deleting variables' },
          { id: 'c', text: 'Sorting arrays' },
          { id: 'd', text: 'Compressing code' }
        ],
        correctAnswer: 'a',
        difficulty: 'medium',
        explanation: 'Hoisting is JavaScript\'s behavior of moving variable and function declarations to the top of their scope before code execution.',
        timeLimit: 30
      },
      {
        content: 'Which method removes the last element from an array?',
        options: [
          { id: 'a', text: 'pop()' },
          { id: 'b', text: 'push()' },
          { id: 'c', text: 'shift()' },
          { id: 'd', text: 'splice()' }
        ],
        correctAnswer: 'a',
        difficulty: 'easy',
        explanation: 'The pop() method removes the last element from an array and returns that element.',
        timeLimit: 30
      },
      {
        content: 'What is the output of: console.log([...new Set([1, 1, 2, 3, 3])])?',
        options: [
          { id: 'a', text: '[1, 2, 3]' },
          { id: 'b', text: '[1, 1, 2, 3, 3]' },
          { id: 'c', text: '5' },
          { id: 'd', text: 'Set {1, 2, 3}' }
        ],
        correctAnswer: 'a',
        difficulty: 'medium',
        explanation: 'Set removes duplicates, and spread operator converts it back to an array: [1, 2, 3].',
        timeLimit: 30
      },
      {
        content: 'What is the difference between "call" and "apply"?',
        options: [
          { id: 'a', text: 'call takes args individually, apply takes array' },
          { id: 'b', text: 'They are identical' },
          { id: 'c', text: 'apply is async, call is sync' },
          { id: 'd', text: 'call is for objects, apply is for arrays' }
        ],
        correctAnswer: 'a',
        difficulty: 'hard',
        explanation: 'Both invoke a function with a given "this" value, but call takes arguments individually while apply takes an array of arguments.',
        timeLimit: 45
    let created = 0;
    let skipped = 0;

    for (const q of jsQuestions) {
      // Check if question already exists
      const existing = await prisma.question.findFirst({
        where: {
          content: q.content,
          deletedAt: null
        }
      });

      if (existing) {
        console.log(`⏭️  Skipped: "${q.content.substring(0, 50)}..."`);
        skipped++;
        continue;
      }

      // Create question
      const question = await prisma.question.create({
        data: {
          content: q.content,
          options: q.options,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
          explanation: q.explanation,
          timeLimit: q.timeLimit,
          type: 'mcq',
          status: 'published',
          authorId: admin.id,
          topics: {
            create: {
              topicId: jsTopic.id
            }
          }
        }
      });

      console.log(`✅ Created: "${q.content.substring(0, 60)}..." (${q.difficulty})`);
      created++;
    }

    console.log(`\n✅ Seed complete!`);
    console.log(`   Created: ${created} questions`);
    console.log(`   Skipped: ${skipped} questions (already exist)`);
    console.log(`   Total: ${jsQuestions.length} questions\n`);

  } catch (error) {
    console.error('❌ Error seeding JavaScript questions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedJavaScriptQuestions();
