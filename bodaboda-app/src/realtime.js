import mqtt from 'mqtt'

const defaultRealtimeUrl = () => {
  if (typeof window === 'undefined') {
    return 'ws://127.0.0.1:9001/mqtt'
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/mqtt`
}

const MQTT_WS_URL = import.meta.env.VITE_MQTT_WS_URL || defaultRealtimeUrl()
const MQTT_TOPIC_PREFIX = import.meta.env.VITE_MQTT_TOPIC_PREFIX || 'bodaboda'

const topic = (suffix) => `${MQTT_TOPIC_PREFIX}/${suffix}`

export const connectRealtime = ({ user, onRideRequest, onRideStatus, onConnectionChange }) => {
  const driverRequestTopic = topic(`driver/${user?.id}/ride/request`)
  const driverStatusTopic = topic(`driver/${user?.id}/ride/status`)
  const client = mqtt.connect(MQTT_WS_URL, {
    clientId: `bodaboda-web-${user?.id || 'guest'}-${Math.random().toString(16).slice(2, 10)}`,
    reconnectPeriod: 3000,
    clean: true,
  })

  const parsePayload = (message) => {
    try {
      return JSON.parse(message.toString())
    } catch (error) {
      console.error('Invalid MQTT payload', error)
      return null
    }
  }

  client.on('connect', () => {
    onConnectionChange?.('connected')
    client.subscribe([driverRequestTopic, driverStatusTopic], { qos: 1 }, (error) => {
      if (error) {
        console.error('MQTT subscribe failed', error)
      }
    })
  })

  client.on('reconnect', () => onConnectionChange?.('reconnecting'))
  client.on('close', () => onConnectionChange?.('disconnected'))
  client.on('offline', () => onConnectionChange?.('offline'))
  client.on('error', (error) => {
    console.error('MQTT connection error', error)
    onConnectionChange?.('error')
  })

  client.on('message', (receivedTopic, message) => {
    const payload = parsePayload(message)
    if (!payload) {
      return
    }

    if (receivedTopic === driverRequestTopic) {
      onRideRequest?.(payload)
    }

    if (receivedTopic === driverStatusTopic) {
      onRideStatus?.(payload)
    }
  })

  return () => {
    client.end(true)
  }
}
