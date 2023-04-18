import mqtt from 'mqtt'
import express from 'express'
import cors from 'cors'

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

const data: any = []

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
    console.log('Received Message:', topic, JSON.stringify(JSON.parse(payload.toString()), null, 2))
    data.push({
      ...JSON.parse(payload.toString()).DATA,
      created_at: new Date(new Date().setHours(new Date().getHours() - 3))
    })
  })
})

app.use(cors())

app.get('/', (req, res) => {
  return res.json({
    data
  })
})

app.listen(8088, () => {
  console.log('app running on port 8088')
})