const Anthropic = require('@anthropic-ai/sdk');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const winston = require('winston');
const Joi = require('joi');
const allCountries = require('./src/data/countries');
const allPlatforms = require('./src/data/platforms');
const envKeys = ['ANTHROPIC_API_KEY', 'MONGODB_URI', 'NODE_ENV'];
for (const key of envKeys) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}
const logService = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app-errors.log', level: 'error' }),
    new winston.transports.File({ filename: 'full-log.log' })
  ]
});

const aiClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
let dbClient = null;
async function getDbConnection() {
  if (dbClient) return dbClient;
  try {
    dbClient = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    return dbClient;
  } catch (err) {
    logService.error('Database connection failed:', err);
    throw err;
  }
}

const platformDataValidator = Joi.object({
  platform: Joi.string().required(),
  best_time: Joi.string().required(),
  prediction_date: Joi.string().isoDate().required(),
  timestamp: Joi.string().isoDate().required(),
});

const countryPredictionValidator = Joi.object({
  country: Joi.string().required(),
  platforms: Joi.array().items(platformDataValidator).min(1).required(),
});

async function fetchOptimalTimes(countryList, platformList) {
  try {
    const queryPrompt = `Based on past social media engagement, identify the best times to post today for maximum user interaction.
      Focus on these countries: ${countryList.join(', ')}
      and platforms: ${platformList.join(', ')}.
      Provide the result in the following format:
      {
        "Country": {
          "Platform": { "best_time": "HH:MM" }
        }
      }`;

    const result = await aiClient.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0,
      system: "You are an expert in social media analytics. Provide accurate timing recommendations.",
      messages: [
        { role: 'user', content: queryPrompt }
      ],
    });
    const rawResponse = result.content[0].text;
    const startIdx = rawResponse.indexOf('{');
    const endIdx = rawResponse.lastIndexOf('}') + 1;
    const dataString = rawResponse.slice(startIdx, endIdx);
    return JSON.parse(dataString);
  } catch (err) {
    logService.error('Error in fetching predictions:', err);
    throw err;
  }
}

async function savePredictions(data) {
  const dbConnection = await getDbConnection();
  const dbSession = dbConnection.startSession();

  try {
    await dbSession.withTransaction(async () => {
      const database = dbConnection.db('social_media_stats');
      const collection = database.collection('post_predictions');
      const today = new Date().toISOString().split('T')[0];
      const timestamp = new Date().toISOString();

      const records = [];

      for (const [nation, platformInfo] of Object.entries(data)) {
        const record = {
          country: nation,
          platforms: Object.entries(platformInfo).map(([platform, details]) => ({
            platform,
            best_time: details.best_time,
            prediction_date: today,
            timestamp,
          })),
        };

        const validation = countryPredictionValidator.validate(record);
        if (validation.error) {
          throw new Error(`Data validation failed: ${validation.error.details[0].message}`);
        }

        records.push(record);
      }

      const operations = records.map(item => ({
        updateOne: {
          filter: { country: item.country, 'platforms.prediction_date': today },
          update: { $set: item },
          upsert: true,
        },
      }));

      const result = await collection.bulkWrite(operations);
      logService.info('Database update results:', result);

      return result;
    });
  } catch (err) {
    logService.error('Error saving predictions:', err);
    throw err;
  } finally {
    await dbSession.endSession();
  }
}

async function closeResources() {
  try {
    if (dbClient) {
      await dbClient.close();
    }
  } catch (err) {
    logService.error('Resource cleanup failed:', err);
  }
}

exports.socialMediaTimingPrediction = async (req, res) => {
  try {
    const predictionResults = await fetchOptimalTimes(allCountries, allPlatforms);
    await savePredictions(predictionResults);
    res.status(200).send('Predictions processed and stored successfully');
  } catch (err) {
    res.status(500).send('Error during execution: ' + err.message);
  }
}