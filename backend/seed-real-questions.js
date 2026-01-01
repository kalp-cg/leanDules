const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const questionsData = {
  mathematics: [
    {
      content: "What is the value of Pi to two decimal places?",
      options: ["3.14", "3.12", "3.16", "3.18"],
      correctAnswer: "3.14",
      difficulty: "easy"
    },
    {
      content: "What is 15 * 15?",
      options: ["200", "225", "250", "275"],
      correctAnswer: "225",
      difficulty: "medium"
    },
    {
      content: "What is the square root of 144?",
      options: ["10", "11", "12", "13"],
      correctAnswer: "12",
      difficulty: "easy"
    },
    {
      content: "What is 7 cubed (7^3)?",
      options: ["343", "243", "443", "143"],
      correctAnswer: "343",
      difficulty: "hard"
    },
    {
      content: "Solve for x: 2x + 5 = 15",
      options: ["5", "10", "2", "7"],
      correctAnswer: "5",
      difficulty: "medium"
    },
    {
      content: "What is the sum of angles in a triangle?",
      options: ["180 degrees", "360 degrees", "90 degrees", "270 degrees"],
      correctAnswer: "180 degrees",
      difficulty: "easy"
    },
    {
      content: "What is the next prime number after 7?",
      options: ["9", "10", "11", "13"],
      correctAnswer: "11",
      difficulty: "medium"
    },
    {
      content: "What is 20% of 50?",
      options: ["5", "10", "15", "20"],
      correctAnswer: "10",
      difficulty: "easy"
    },
    {
      content: "What is the perimeter of a square with side length 5?",
      options: ["20", "25", "15", "10"],
      correctAnswer: "20",
      difficulty: "easy"
    },
    {
      content: "What is 2 to the power of 5?",
      options: ["16", "32", "64", "128"],
      correctAnswer: "32",
      difficulty: "medium"
    }
  ],
  geography: [
    {
      content: "What is the capital of France?",
      options: ["London", "Berlin", "Madrid", "Paris"],
      correctAnswer: "Paris",
      difficulty: "easy"
    },
    {
      content: "Which is the largest continent?",
      options: ["Africa", "North America", "Asia", "Europe"],
      correctAnswer: "Asia",
      difficulty: "easy"
    },
    {
      content: "Which river is the longest in the world?",
      options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
      correctAnswer: "Nile",
      difficulty: "medium"
    },
    {
      content: "What is the capital of Japan?",
      options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
      correctAnswer: "Tokyo",
      difficulty: "easy"
    },
    {
      content: "Which country is known as the Land of the Rising Sun?",
      options: ["China", "Japan", "Thailand", "Vietnam"],
      correctAnswer: "Japan",
      difficulty: "medium"
    },
    {
      content: "What is the smallest country in the world?",
      options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
      correctAnswer: "Vatican City",
      difficulty: "hard"
    },
    {
      content: "Which ocean is the largest?",
      options: ["Atlantic", "Indian", "Arctic", "Pacific"],
      correctAnswer: "Pacific",
      difficulty: "easy"
    },
    {
      content: "Mount Everest is located in which mountain range?",
      options: ["Andes", "Rockies", "Alps", "Himalayas"],
      correctAnswer: "Himalayas",
      difficulty: "medium"
    },
    {
      content: "What is the capital of Australia?",
      options: ["Sydney", "Melbourne", "Canberra", "Perth"],
      correctAnswer: "Canberra",
      difficulty: "hard"
    },
    {
      content: "Which country has the most islands?",
      options: ["Sweden", "Indonesia", "Philippines", "Canada"],
      correctAnswer: "Sweden",
      difficulty: "hard"
    }
  ],
  science: [
    {
      content: "What is the chemical symbol for Gold?",
      options: ["Ag", "Au", "Fe", "Cu"],
      correctAnswer: "Au",
      difficulty: "medium"
    },
    {
      content: "What planet is known as the Red Planet?",
      options: ["Venus", "Jupiter", "Mars", "Saturn"],
      correctAnswer: "Mars",
      difficulty: "easy"
    },
    {
      content: "What is the hardest natural substance on Earth?",
      options: ["Gold", "Iron", "Diamond", "Platinum"],
      correctAnswer: "Diamond",
      difficulty: "medium"
    },
    {
      content: "What gas do plants absorb from the atmosphere?",
      options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
      correctAnswer: "Carbon Dioxide",
      difficulty: "easy"
    },
    {
      content: "What is the speed of light?",
      options: ["300,000 km/s", "150,000 km/s", "1,000 km/s", "Sound speed"],
      correctAnswer: "300,000 km/s",
      difficulty: "hard"
    },
    {
      content: "What is the center of an atom called?",
      options: ["Electron", "Proton", "Nucleus", "Neutron"],
      correctAnswer: "Nucleus",
      difficulty: "medium"
    },
    {
      content: "Which organ pumps blood throughout the human body?",
      options: ["Lungs", "Brain", "Heart", "Liver"],
      correctAnswer: "Heart",
      difficulty: "easy"
    },
    {
      content: "What is H2O more commonly known as?",
      options: ["Salt", "Sugar", "Water", "Air"],
      correctAnswer: "Water",
      difficulty: "easy"
    },
    {
      content: "Which planet is closest to the Sun?",
      options: ["Venus", "Earth", "Mercury", "Mars"],
      correctAnswer: "Mercury",
      difficulty: "medium"
    },
    {
      content: "What force keeps us on the ground?",
      options: ["Magnetism", "Friction", "Gravity", "Tension"],
      correctAnswer: "Gravity",
      difficulty: "easy"
    }
  ],
  history: [
    {
      content: "Who was the first President of the United States?",
      options: ["Abraham Lincoln", "Thomas Jefferson", "George Washington", "John Adams"],
      correctAnswer: "George Washington",
      difficulty: "easy"
    },
    {
      content: "In which year did World War II end?",
      options: ["1943", "1944", "1945", "1946"],
      correctAnswer: "1945",
      difficulty: "medium"
    },
    {
      content: "Who discovered America?",
      options: ["Vasco da Gama", "Christopher Columbus", "Ferdinand Magellan", "James Cook"],
      correctAnswer: "Christopher Columbus",
      difficulty: "easy"
    },
    {
      content: "Which empire built the Colosseum?",
      options: ["Greek Empire", "Roman Empire", "Ottoman Empire", "British Empire"],
      correctAnswer: "Roman Empire",
      difficulty: "medium"
    },
    {
      content: "Who wrote the Declaration of Independence?",
      options: ["George Washington", "Benjamin Franklin", "Thomas Jefferson", "John Hancock"],
      correctAnswer: "Thomas Jefferson",
      difficulty: "hard"
    },
    {
      content: "Who was the first man to walk on the moon?",
      options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "Michael Collins"],
      correctAnswer: "Neil Armstrong",
      difficulty: "easy"
    },
    {
      content: "The Titanic sank in which year?",
      options: ["1910", "1912", "1914", "1916"],
      correctAnswer: "1912",
      difficulty: "medium"
    },
    {
      content: "Who painted the Mona Lisa?",
      options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
      correctAnswer: "Leonardo da Vinci",
      difficulty: "easy"
    },
    {
      content: "Which ancient civilization built the pyramids?",
      options: ["Romans", "Greeks", "Egyptians", "Mayans"],
      correctAnswer: "Egyptians",
      difficulty: "easy"
    },
    {
      content: "Who was the British Prime Minister during World War II?",
      options: ["Neville Chamberlain", "Winston Churchill", "Clement Attlee", "Tony Blair"],
      correctAnswer: "Winston Churchill",
      difficulty: "medium"
    }
  ],
  programming: [
    {
      content: "What does HTML stand for?",
      options: ["HyperText Markup Language", "HighText Machine Language", "HyperText and Links Markup", "None of these"],
      correctAnswer: "HyperText Markup Language",
      difficulty: "easy"
    },
    {
      content: "Which language is primarily used for Android development?",
      options: ["Swift", "C#", "Java", "Ruby"],
      correctAnswer: "Java",
      difficulty: "medium"
    },
    {
      content: "What is the main function of a compiler?",
      options: ["Execute code line by line", "Translate source code to machine code", "Debug code", "Manage memory"],
      correctAnswer: "Translate source code to machine code",
      difficulty: "medium"
    },
    {
      content: "What does SQL stand for?",
      options: ["Structured Question Language", "Structured Query Language", "Simple Query Language", "Standard Query Language"],
      correctAnswer: "Structured Query Language",
      difficulty: "easy"
    },
    {
      content: "What is a boolean?",
      options: ["A number", "A text string", "A data type with two values: true or false", "A list of items"],
      correctAnswer: "A data type with two values: true or false",
      difficulty: "easy"
    },
    {
      content: "Which symbol is used for comments in Python?",
      options: ["//", "/* */", "#", "--"],
      correctAnswer: "#",
      difficulty: "easy"
    },
    {
      content: "What is an array?",
      options: ["A single variable", "A collection of items stored at contiguous memory locations", "A function", "A database"],
      correctAnswer: "A collection of items stored at contiguous memory locations",
      difficulty: "medium"
    },
    {
      content: "Which of these is NOT a programming language?",
      options: ["Python", "Java", "HTML", "C++"],
      correctAnswer: "HTML",
      difficulty: "medium"
    },
    {
      content: "What does CSS stand for?",
      options: ["Computer Style Sheets", "Creative Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"],
      correctAnswer: "Cascading Style Sheets",
      difficulty: "easy"
    },
    {
      content: "What is the output of 10 % 3?",
      options: ["3", "1", "0", "10"],
      correctAnswer: "1",
      difficulty: "medium"
    }
  ],
  algebra: [
    {
      content: "If 3x = 12, what is x?",
      options: ["3", "4", "5", "6"],
      correctAnswer: "4",
      difficulty: "easy"
    },
    {
      content: "Expand (x + 2)(x - 2).",
      options: ["x^2 + 4", "x^2 - 4", "x^2 + 2x - 4", "x^2 - 2x + 4"],
      correctAnswer: "x^2 - 4",
      difficulty: "medium"
    },
    {
      content: "What is the slope of the line y = 2x + 3?",
      options: ["3", "2", "5", "1"],
      correctAnswer: "2",
      difficulty: "medium"
    },
    {
      content: "Solve for x: x/2 = 10.",
      options: ["5", "10", "15", "20"],
      correctAnswer: "20",
      difficulty: "easy"
    },
    {
      content: "What is the value of 5! (5 factorial)?",
      options: ["120", "100", "60", "25"],
      correctAnswer: "120",
      difficulty: "hard"
    },
    {
      content: "Simplify: 2(x + 3) - 6",
      options: ["2x", "2x + 6", "2x - 6", "x"],
      correctAnswer: "2x",
      difficulty: "medium"
    },
    {
      content: "What is the value of x if x + 5 = 12?",
      options: ["5", "6", "7", "8"],
      correctAnswer: "7",
      difficulty: "easy"
    },
    {
      content: "Solve for x: 4x - 8 = 0",
      options: ["1", "2", "3", "4"],
      correctAnswer: "2",
      difficulty: "easy"
    },
    {
      content: "What is the y-intercept of y = 3x + 7?",
      options: ["3", "7", "0", "10"],
      correctAnswer: "7",
      difficulty: "medium"
    },
    {
      content: "If x = 3 and y = 2, what is x^2 + y^2?",
      options: ["10", "12", "13", "15"],
      correctAnswer: "13",
      difficulty: "medium"
    }
  ],
  physics: [
    {
      content: "What is the unit of force?",
      options: ["Joule", "Watt", "Newton", "Pascal"],
      correctAnswer: "Newton",
      difficulty: "easy"
    },
    {
      content: "Who developed the theory of relativity?",
      options: ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Nikola Tesla"],
      correctAnswer: "Albert Einstein",
      difficulty: "medium"
    },
    {
      content: "What is the formula for kinetic energy?",
      options: ["mv", "ma", "1/2 mv^2", "mgh"],
      correctAnswer: "1/2 mv^2",
      difficulty: "hard"
    },
    {
      content: "What is the acceleration due to gravity on Earth?",
      options: ["9.8 m/s^2", "10.5 m/s^2", "8.9 m/s^2", "12 m/s^2"],
      correctAnswer: "9.8 m/s^2",
      difficulty: "medium"
    },
    {
      content: "What is the unit of electrical resistance?",
      options: ["Volt", "Ampere", "Ohm", "Watt"],
      correctAnswer: "Ohm",
      difficulty: "medium"
    },
    {
      content: "What is the speed of sound in air (approx)?",
      options: ["343 m/s", "300,000 km/s", "100 m/s", "1000 m/s"],
      correctAnswer: "343 m/s",
      difficulty: "medium"
    },
    {
      content: "Which particle has a negative charge?",
      options: ["Proton", "Neutron", "Electron", "Photon"],
      correctAnswer: "Electron",
      difficulty: "easy"
    },
    {
      content: "What is the first law of thermodynamics related to?",
      options: ["Entropy", "Conservation of Energy", "Absolute Zero", "Heat Transfer"],
      correctAnswer: "Conservation of Energy",
      difficulty: "hard"
    },
    {
      content: "What is the unit of power?",
      options: ["Joule", "Newton", "Watt", "Volt"],
      correctAnswer: "Watt",
      difficulty: "easy"
    },
    {
      content: "What type of lens is used to correct short-sightedness?",
      options: ["Convex", "Concave", "Planar", "Cylindrical"],
      correctAnswer: "Concave",
      difficulty: "hard"
    }
  ]
};

async function seedRealQuestions() {
  console.log('Starting to seed real questions...');

  // Get the admin user to be the author
  const admin = await prisma.user.findFirst({
    where: { role: 'admin' }
  });
  
  // Fallback if no admin exists, use the first user or create a dummy one (not implemented here for brevity)
  const authorId = admin ? admin.id : 1; 

  for (const [slug, questions] of Object.entries(questionsData)) {
    console.log(`Processing topic: ${slug}`);
    
    const topic = await prisma.topic.findFirst({
      where: { slug: slug }
    });

    if (!topic) {
      console.log(`Topic ${slug} not found, skipping...`);
      continue;
    }

    console.log(`Found topic ${topic.name} (ID: ${topic.id}). Adding ${questions.length} questions...`);

    for (const q of questions) {
      // Check if question already exists to avoid duplicates
      const existing = await prisma.question.findFirst({
        where: {
          content: q.content,
          topics: {
            some: {
              topicId: topic.id
            }
          }
        }
      });

      if (existing) {
        // console.log(`Question "${q.content}" already exists.`);
        continue;
      }

      await prisma.question.create({
        data: {
          content: q.content,
          options: q.options,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
          authorId: authorId,
          status: 'published',
          topics: {
            create: {
              topicId: topic.id
            }
          }
        }
      });
    }
    console.log(`Finished adding questions for ${topic.name}`);
  }

  console.log('Seeding completed!');
}

seedRealQuestions()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
