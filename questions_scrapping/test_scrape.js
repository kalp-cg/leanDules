const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
  try {
    const url = 'https://www.sanfoundry.com/python-questions-answers-variable-names/';
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);
    
    const entryContent = $('.entry-content');
    const questions = [];
    
    // Sanfoundry structure is often just paragraphs.
    // 1. Question...
    // a) ...
    // b) ...
    // View Answer
    // Answer: a
    // Explanation: ...
    
    let currentQuestion = null;
    
    entryContent.children('p').each((i, el) => {
      const text = $(el).text().trim();
      
      // Check for question number
      if (/^\d+\./.test(text)) {
        if (currentQuestion) {
            questions.push(currentQuestion);
        }
        currentQuestion = {
            question: text.replace(/^\d+\.\s*/, ''),
            options: [],
            answer: '',
            explanation: ''
        };
      } else if (currentQuestion) {
        if (/^[a-d]\)/.test(text)) {
            currentQuestion.options.push(text);
        } else if (text.startsWith('Answer:')) {
            currentQuestion.answer = text.replace('Answer:', '').trim();
        } else if (text.startsWith('Explanation:')) {
            currentQuestion.explanation = text.replace('Explanation:', '').trim();
        }
      }
    });
    
    if (currentQuestion) questions.push(currentQuestion);
    
    console.log(JSON.stringify(questions.slice(0, 3), null, 2));
    
  } catch (error) {
    console.error(error);
  }
}

testScrape();
