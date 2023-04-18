import mqtt from 'mqtt'
import express from 'express'
import cors from 'cors'
import fs from 'fs'

const app = express()

// Broker MQTT V3.1.1
// IP: 143.107.102.8
// Port: 1883
// Username: automacao-2023
// Password: auto835192
// Topic: garsoft/dev/je05/dados
// TLS: none

// Connect to MQTT broker with credentials above
const host = '143.107.102.8'
const port = '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const topic = 'garsoft/dev/je05/dados'
const connectUrl = `mqtt://${host}:${port}`

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'automacao-2023',
  password: 'auto835192',
  reconnectPeriod: 1000,
})

client.on('connect', () => {
  console.log('[MQTT] Client connected to HOST')
  client.subscribe([topic], () => {
    console.log(`[MQTT] Subscribe to topic '${topic}'`)
  })

  client.on('message', (topic, payload) => {
    try {
      console.log('Received Message:', topic, JSON.stringify(JSON.parse(payload.toString()), null, 2))  
      let rawdata = fs.readFileSync('data.json')
      const data = JSON.parse(rawdata as any)

      console.log('dados: ', JSON.parse(payload.toString()))

      if (JSON.parse(payload.toString()).DATA) {
        data.push({
          ...JSON.parse(payload.toString()).DATA,
          created_at: new Date(new Date().setHours(new Date().getHours() - 3))
        })
        
        fs.writeFileSync('data.json', JSON.stringify(data));
      }
    } catch (err) {
      console.log(err)
    }
  })
})

app.use(cors())

app.get('/', (req, res) => {
  let rawdata = fs.readFileSync('data.json');
  let data = JSON.parse(rawdata as any)

  return res.json({
    data
  })
})

app.get('/reset-cache', (req, res) => {
  fs.writeFileSync('data.json', '');

  return res.json()
})

app.listen(8088, () => {
  console.log('app running on port 8088')
})