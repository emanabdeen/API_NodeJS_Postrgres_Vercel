require('dotenv').config();
const express = require('express');
const postgres = require('postgres');
const GreetingRequest= require('./Models/GreetingRequest');
const GreetingResponse= require('./Models/GreetingResponse');


const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PG_PORT } = process.env;
const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: PG_PORT,
  ssl: 'require',
});

const app = express();

// for parsing JSON
app.use(express.json());

//-----------------------------------
async function getPgVersion() {
  const result = await sql`select version()`;
  console.log(result[0]);
}
getPgVersion();
//---------------------------------------------

// Initialize PostgreSQL database
(async () => {
  try {
    // Create the 'Greetings' table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS Greetings (
        id SERIAL PRIMARY KEY,
        TimeOfDay TEXT NOT NULL,
        Language TEXT NOT NULL,
        GreetingMessage TEXT NOT NULL,
        Tone TEXT NOT NULL
      )
    `;

    // Seed data
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
      const exists = await sql`
        SELECT 1 
        FROM Greetings 
        WHERE TimeOfDay = ${TimeOfDay} AND Language = ${Language} AND Tone = ${Tone}
      `;

      // if the record doesn't exist seed it
      if (exists.length === 0) {
        await sql`
          INSERT INTO Greetings (TimeOfDay, Language, GreetingMessage, Tone)
          VALUES (${TimeOfDay}, ${Language}, ${GreetingMessage}, ${Tone})
        `;
      }
    }

    console.log('Database initialized and seeded.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
})();


// GreetUser Endpoint
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
      const result = await sql`
      SELECT GreetingMessage
      FROM Greetings
      WHERE TimeOfDay = ${TimeOfDay} AND Language = ${Language} AND Tone = ${Tone}
      `;
      
      if (!result) {
        return res.status(404).json({ error: 'Greeting not found' });
      }
      else{
        const greetingResponse = new GreetingResponse(result[0].greetingmessage); // Note that result=[{"greetingmessage": "Good Morning!"}]
        res.json({ greetingMessage: greetingResponse.GreetingMessage });  //results should have object key. So we have to use key for the JSON object 'greetingMessage:'
      }
      
    } catch (error) {
      res.status(500).json({ error: 'Greeting not found' });
    }
  });




  // GetAllTimesOfDay Endpoint
  app.get('/api/Greetings/GetAllTimesOfDay', async (req, res) => {
    try {

      //The result from db.all will be an array of objects. Each object will have a timeOfDay property. 
      const result = await sql`
      SELECT DISTINCT TimeOfDay
      FROM Greetings
      `;
      
      
      if (!result) {
        return res.status(404).json({ error: 'TimeOfDay not found' });
      }
      else{
        // extract only the 'timeOfDay' values from each object and put them into a new array. (note the Case Sensitivity 'timeofday' not 'TimeOfDay')
        const timesOfDay = result.map(row => row.timeofday);
        
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
      const result = await sql`
      SELECT DISTINCT Language
      FROM Greetings
      `;
      
      if (!result) {
        return res.status(404).json({ error: 'language not found' });
      }
      else{
        // extract only the 'language' values from each object and put them into a new array. (note the Case Sensitivity 'language' not 'Language')
        const language = result.map(row => row.language);
        
        //wrap the timesOfDay array in an object before sending it as the JSON response 
        res.status(200).json(language);
      }
      
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving supported languages' });
    }
  });

  app.get('/',(req,res)=>{
    res.send('eman abdeen');
  });


// Export the app for Vercel
module.exports = app;

