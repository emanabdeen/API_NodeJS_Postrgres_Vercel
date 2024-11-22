//Student Name: Eman Abdeen
//ID:8783804

const express = require('express');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path'); // give us access to the absolute path

const GreetingRequest= require('./Models/GreetingRequest');
const GreetingResponse= require('./Models/GreetingResponse');

const app = express();
const PORT = 3000;

// for parsing JSON
app.use(express.json());

// To initialize SQLite database
let db;
(async () => {
  db = await sqlite.open({
    filename: './data/database.db',
    driver: sqlite3.Database
  });

  // Create a 'Greetings' table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Greetings (
        id INTEGER PRIMARY KEY,
        TimeOfDay TEXT,
        Language TEXT,
        GreetingMessage TEXT,
        Tone TEXT
    )
  `);

  // Seed the database
  const seedData = [
    ['Morning', 'English', 'Good Morning!', 'Formal'],
    ['Morning', 'English', 'Hey, Good Morning!', 'Casual'],
    ['Afternoon', 'English', 'Good Afternoon!', 'Formal'],
    ['Afternoon', 'English', 'Hey, Good Afternoon!', 'Casual'],
    ['Evening', 'English', 'Good Evening!', 'Formal'],
    ['Evening', 'English', 'Hey, Good Evening!', 'Casual'],

    ['Morning', 'Italian', 'Buongiorno!', 'Formal'],
    ['Morning', 'Italian', 'Ehi, Buongiorno!', 'Casual'],
    ['Afternoon', 'Italian', 'Buon pomeriggio!', 'Formal'],
    ['Afternoon', 'Italian', 'Ehi, Buon pomeriggio!', 'Casual'],
    ['Evening', 'Italian', 'Buonasera!', 'Formal'],
    ['Evening', 'Italian', 'Ehi,  Buonasera!', 'Casual'],

    ['Morning', 'Spanish', 'Buenos días!', 'Formal'],
    ['Morning', 'Spanish', 'Hola, Buenos días!', 'Casual'],
    ['Afternoon', 'Spanish', 'Buenas tardes!', 'Formal'],
    ['Afternoon', 'Spanish', 'Hola, Buenas tardes!', 'Casual'],
    ['Evening', 'Spanish', 'Buenas noches!', 'Formal'],
    ['Evening', 'Spanish', 'Hola, Buenas noches!', 'Casual'],
  ];

  for (const [TimeOfDay, Language, GreetingMessage, Tone] of seedData) {
    const existingEntry = await db.get(
      `SELECT 1 FROM Greetings WHERE TimeOfDay = ? AND Language = ? AND Tone = ?`,
      [TimeOfDay, Language, Tone]
    );

    // if the record doesn't exist seed it
    if (!existingEntry) {
      await db.run(
        `INSERT INTO Greetings (TimeOfDay, Language, GreetingMessage, Tone) VALUES (?, ?, ?, ?)`,
        [TimeOfDay, Language, GreetingMessage, Tone]
      );
    }
  }

  console.log('Database seeding completed.');
})();


// Greet Endpoint
app.post('/api/Greetings/GreetUser', async (req, res) => {
   // make the default Tone = Formal if it is empty 
  if (req.body.Tone.toLowerCase() === 'formal' || !req.body.Tone) {
    req.body.Tone="Formal";
  }
  else if(req.body.Tone.toLowerCase() === 'casual'){
    req.body.Tone="Casual";
  }
  
  const greetingRequest = new GreetingRequest(req.body.TimeOfDay, req.body.Language, req.body.Tone);
    const { TimeOfDay, Language, Tone } = greetingRequest;
    
    if (!TimeOfDay || !Language ||!Tone) {
      return res.status(400).json({ error: 'TimeOfDay, Language, and Tone are required' });
    }
  
    try {
      const result = await db.get('SELECT GreetingMessage FROM Greetings WHERE TimeOfDay = ? AND Language = ? AND Tone = ?', [TimeOfDay, Language, Tone]);
      
      const greetingResponse = new GreetingResponse(result.GreetingMessage);

      if (!result) {
        return res.status(404).json({ error: 'Greeting not found' });
      }
      else{
        res.json({greetingMessage: greetingResponse.GreetingMessage});  //res.json({greetingResponse.greetingMessage}); is incorrect because it results in an anonymous object key. So we have to use key for the JSON object 'greetingMessage:'
      }
      
    } catch (error) {
      res.status(500).json({ error: 'Greeting not found' });
    }
  });




  // GetAllTimesOfDay Endpoint
  app.get('/api/Greetings/GetAllTimesOfDay', async (req, res) => {
    try {

       //The result from db.all will be an array of objects. Each object will have a timeOfDay property. 
      const result = await db.all('SELECT DISTINCT TimeOfDay FROM Greetings');
      if (!result) {
        return res.status(404).json({ error: 'TimeOfDay not found' });
      }
      else{
        // extract only the 'timeOfDay' values from each object and put them into a new array.
        const timesOfDay = result.map(row => row.TimeOfDay);
        
        //wrap the timesOfDay array in an object before sending it as the JSON response 
        res.status(200).json(timesOfDay);
      }
      
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving times of day' });
    }
  });

  
  // GetSupportedLanguages Endpoint
  app.get('/api/Greetings/GetSupportedLanguages', async (req, res) => {
    try {

       //The result from db.all will be an array of objects. Each object will have a timeOfDay property. 
      const result = await db.all('SELECT DISTINCT Language FROM Greetings');
      if (!result) {
        return res.status(404).json({ error: 'language not found' });
      }
      else{
        // extract only the 'language' values from each object and put them into a new array.
        const language = result.map(row => row.Language);
        
        //wrap the timesOfDay array in an object before sending it as the JSON response 
        res.status(200).json(language);
      }
      
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving supported languages' });
    }
  });


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
