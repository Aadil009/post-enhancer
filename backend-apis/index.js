require('dotenv').config()
const Hapi = require('@hapi/hapi')
const Joi = require('joi')
const mongoose = require('mongoose');
const port = process.env.PORT || 3200;

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('Connected to MongoDB')
    } catch (err) {
        console.error('Failed to connect to MongoDB', err)
    }
}

const recordSchema = new mongoose.Schema({
    platforms: [{
        platform: { type: String, required: true },
        best_time: { type: String, required: true },
        prediction_date: { type: String, required: true },
        timestamp: { type: String, required: true },
    }],
    country: { type: String, required: true }
})

const Record = mongoose.model('post_predictions', recordSchema)

    ; (async () => {
        const server = Hapi.server({
            port: port,
            host: 'localhost'
        })

        server.route({
            method: 'GET',
            path: '/best-time',
            options: {
                validate: {
                    query: Joi.object({
                        platform: Joi.string().required().description('Name of the platform'),
                        date: Joi.string()
                            .isoDate()
                            .required()
                            .description('ISO date string (e.g., 2024-12-23)'),
                    }),
                    failAction: (request, h, err) => {
                        console.error('Validation error:', err.message)
                        throw err
                    },
                },
            },
            handler: async (request, h) => {
                try {
                    const { platform, date } = request.query;
                    const formattedDate = new Date(date).toISOString().split('T')[0];
                    const record = await Record.findOne({
                        'platforms.platform': platform,
                        country: 'Global',
                        'platforms.prediction_date': formattedDate,
                    })
                    
                    console.log("record::::::", record)

                    if (!record) {
                        return h.response({ message: 'No record found for the specified platform.' }).code(404)
                    }

                    const platformData = record.platforms.find(
                        (p) => p.platform === platform && p.prediction_date === formattedDate
                    )

                    if (!platformData) {
                        return h.response({ message: 'No best time found for the specified date and platform.' }).code(404)
                    }

                    return h.response({
                        message: 'Best time fetched successfully',
                        platform: platform,
                        date: formattedDate,
                        best_time: platformData.best_time,
                    }).code(200)
                } catch (err) {
                    console.error('Error fetching records:', err.message)
                    return h.response({
                        error: 'Failed to fetch records',
                        details: err.message,
                    }).code(500)
                }
            },
        })

        await connectToDatabase()

        try {
            await server.start()
            console.log(`Server running at: ${server.info.uri}`)
        } catch (err) {
            console.error('Failed to start the server:', err.message)
        }
    })()
