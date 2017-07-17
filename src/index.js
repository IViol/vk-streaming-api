import Promise from 'bluebird'
import request from 'request-promise'
import WebSocket from 'ws'
import _debug from 'debug'

const debug = _debug('vk-streaming-api:info')
const debugError = _debug('vk-streaming-api:error')
const apiUrl = 'https://api.vk.com/method/'

class VKStreamingAPI {
  constructor(props) {
    this.props = props
    this.__endpoint = null
    this.__key = null
    this.__defaultApiVersion = 5.67
  }

  authorize() {
    const { serviceKey, apiVersion } = this.props

    if (!(serviceKey || serviceKey.length)) {
      return Promise.reject(new Error('serviceKey parameter is required'))
    }

    if (apiVersion == null) {
      debugError('apiVersion parameter was not provided, but it is highly recommended')
      debug(`Default version (${this.__defaultApiVersion}) of API will be used`)
    }

    const options = {
      url: `${apiUrl}/streaming.getServerUrl`,
      json: true,
      qs: {
        v: apiVersion || this.__defaultApiVersion,
        access_token: serviceKey,
      },
    }

    return request(options).then(({ response, error }) => {
      if (error) {
        return Promise.reject(new Error(error.error_msg))
      }

      return response
    }).then(({ key, endpoint }) => {
      this.__key = key
      this.__endpoint = endpoint

      debug('[VK Streaming API] Successfully authorised')

      return null
    })
  }

  addRules(rules) {
    const _rules = this.props.rules || rules

    if (!(_rules || _rules.length)) {
      return Promise.reject(new Error('Rules to add were not provided'))
    }

    return Promise.mapSeries(_rules, rule => this.addRule(rule))
  }

  addRule(rule) {
    return this.__streamingRequest('rules', { rule }, 'POST')
  }

  getRules() {
    return this.__streamingRequest('rules')
  }

  getRule(tag) {
    return this.__streamingRequest('rules').then(({ rules }) => {
      if (!(rules || rules.length)) {
        return null
      }

      return rules.filter(rule => rule.tag === tag)[0] || null
    })
  }

  deleteRules() {
    return Promise
      .bind(this)
      .then(this.getRules)
      .then(({ rules }) => {
        if (!(rules || rules.length)) {
          return null
        }

        Promise.mapSeries(rules, ({ tag }) => this.deleteRule(tag))
      })
  }

  deleteRule(tag) {
    return this.__streamingRequest('rules', { tag }, 'DELETE')
  }

  getStream() {
    const wss = new WebSocket(`wss://${this.__endpoint}/stream?key=${this.__key}`)

    wss.on('open', () => this.__onOpen())
    wss.on('close', () => this.__onClose())
    wss.on('error', err => this.__onError(err))
    wss.on('unexpected-response', (...args) => this.__onUnexpectedResponse(...args))
    wss.on('message', data => this.__onMessage(data))

    return Promise.resolve(wss)
  }

  __streamingRequest(name, payload, method = 'GET') {
    debug(`[VK Streaming API] Method ${name} (${method}) is about to execute with following ` +
      `params: ${JSON.stringify(payload)}`)

    const options = {
      method,
      url: `https://${this.__endpoint}/${name}?key=${this.__key}`,
      json: true,
    }

    if (payload != null && Object.keys(payload).length) {
      if (method === 'GET') {
        options.qs = payload
      }

      options.body = payload
    }

    return request(options).then((res) => {
      if (res && res.error) {
        return Promise.reject(new Error(res.error.message))
      }

      debug(`[VK Streaming API] Method ${name} (${method}) success. Result:`)
      debug(JSON.stringify(res))

      return res
    })
  }

  __onOpen() {
    debug('[VK Streaming API] WebSocket stream opened')

    if (this.props.onOpen) {
      this.props.onOpen()
    }
  }

  __onMessage(data) {
    debug('[VK Streaming API] Message received')

    let message

    try {
      message = JSON.parse(data)
    } catch (e) {
      return Promise.reject(new Error('Can\'t parse incoming JSON message'))
    }

    const { code, event, service_message: serviceMessage } = message

    if (code === 100) {
      this.__onEvent(event)
    } else if (code === 300) {
      this.__onServiceMessage(serviceMessage)
    } else {
      debugError('[VK Streaming API] Unrecognised type of message received')
    }
  }

  __onEvent(event) {
    debug('[VK Streaming API] Event received')

    if (this.props.onMessage) {
      this.props.onMessage(event)
    }
  }

  __onServiceMessage(serviceMessage) {
    debug('[VK Streaming API] Service message received')

    if (this.props.onServiceMessage) {
      this.props.onServiceMessage(serviceMessage)
    }
  }

  __onClose() {
    debug('[VK Streaming API] WebSocket stream closed')

    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  __onError(error) {
    debugError(`[VK Streaming API] WebSocket stream error:`)
    debugError(error)

    if (this.props.onError) {
      this.props.onError(error)
    }
  }

  __onUnexpectedResponse(req, res) {
    debugError(`[VK Streaming API] WebSocket stream unexpected response:`)
    debugError(req)
    debugError(res)
  }
}

export default VKStreamingAPI
