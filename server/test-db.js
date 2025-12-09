const { Client } = require('pg')
const client = new Client({
    connectionString: 'postgresql://postgres:9314@localhost:5432/rqi_erp?schema=public'
})

client.connect()
    .then(() => {
        console.log('Connected to database successfully!')
        client.end()
        process.exit(0)
    })
    .catch(err => {
        console.error('Connection error', err.stack)
        client.end()
        process.exit(1)
    })
