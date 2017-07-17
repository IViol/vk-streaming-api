<p align="center"><h1>vk-streaming-api</h1></p>
<p align="center">
<a href="https://www.npmjs.com/package/vk-streaming-api"><img src="https://img.shields.io/npm/v/vk-streaming-api.svg?style=flat-square" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/vk-streaming-api"><img src="https://img.shields.io/npm/dt/vk-streaming-api.svg?style=flat-square" alt="NPM downloads"></a>
</p>

vk-streaming-api - это [Node.js](https://nodejs.org) модуль для взаимодействия с [VK Streaming API](https://vk.com/dev/streaming_api_docs)

## Установка

### NPM
```shell
npm install vk-streaming-api --save
```

### Yarn
```shell
yarn add vk-streaming-api
```

## Зависимости

- [Promise](https://www.npmjs.com/package/bluebird)
- [request](https://www.npmjs.com/package/request-promise)
- [WebSocket](https://www.npmjs.com/package/ws)
- [debug](https://www.npmjs.com/package/debug)

## Инициализация
```javascript
import VKStreamingAPI from 'vk-streaming-api'

const vkStreaming = new VKStreamingAPI(options)
```

| Параметр | Тип    | Описание                |
|----------|--------|-------------------------|
| options  | object | [Параметры](#Параметры) |

### Параметры
| Параметр         | Тип      | Описание                                                             |
|------------------|----------|----------------------------------------------------------------------|
| onOpen           | function | Коллбэк, вызывающийся при открытии соединения websocket              |
| onMessage        | function | Коллбэк, вызывающийся при получении данных по websocket              |
| onServiceMessage | function | Коллбэк, вызывающийся при получении сервисных сообщений по websocket |
| onError          | function | Коллбэк, вызывающийся при получении ошибки по websocket              |
| onClose          | function | Коллбэк, вызывающийся при зыкрытии соединения websocket              |
| serviceKey       | string   | Сервисный ключ доступа (access_token)                                |
| apiVersion       | number   | Версия VKontakte API                                                 |
| rules            | array    | Список правил, которые должны быть добавлены в поток                 |

Все параметры опциональны, за исключением `serviceKey`.

## Список поддерживаемых методов

### [authorize()](https://vk.com/dev/streaming_api_docs?f=1.%20%D0%90%D0%B2%D1%82%D0%BE%D1%80%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D1%8F)

Возвращает Promise, который будет разрешен со значением null в успешном случае, иначе отклонен с ошибкой (например, если параметр serviceKey не был передан при инициализации).

### [addRules([rules])](https://vk.com/dev/streaming_api_docs?f=5.%20%D0%94%D0%BE%D0%B1%D0%B0%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D0%BB)

Последовательно добавляет правила в поток. Будет отклонен с ошибкой если правила не были переданы ни при инициализации, ни в качестве параметра при вызове.

### [addRule(rule)](https://vk.com/dev/streaming_api_docs?f=5.%20%D0%94%D0%BE%D0%B1%D0%B0%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D0%BB)

Добавляет правило в поток.

### [getRules()](https://vk.com/dev/streaming_api_docs?f=4.%20%D0%9F%D0%BE%D0%BB%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D0%BB)

Получает список правил, добавленных в поток.

### [getRule(tag)](https://vk.com/dev/streaming_api_docs?f=4.%20%D0%9F%D0%BE%D0%BB%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D0%BB)

Получает правило по его тэгу.

### [deleteRules](https://vk.com/dev/streaming_api_docs?f=6.%20%D0%A3%D0%B4%D0%B0%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D0%BB)

Удаляет все правила из потока. Удаление происходит последовательно.

### [deleteRule(tag)](https://vk.com/dev/streaming_api_docs?f=6.%20%D0%A3%D0%B4%D0%B0%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D0%BB)

Удаляет правило из потока по его тэгу.

### [getStream()](https://vk.com/dev/streaming_api_docs_2?f=7.%2B%D0%A7%D1%82%D0%B5%D0%BD%D0%B8%D0%B5%2B%D0%BF%D0%BE%D1%82%D0%BE%D0%BA%D0%B0)

Устанавливает соединение для получения данных и возвращает объект [WebSocket](https://github.com/websockets/ws/blob/master/doc/ws.md#class-websocket).

## Пример использования

```javascript
Promise
  .bind(vkStreaming)
  .then(vkStreaming.authorize)
  .then(vkStreaming.deleteRules)
  .then(vkStreaming.addRules)
  .then(vkStreaming.getRules)
  .then(vkStreaming.getStream)
  .then((stream) => {
    // do something with stream
  }).catch((err) => {
    // error handling
  })
```

## Логирование

Для того что бы получать данные логирования в консоль, необходимо установить переменную окружения DEBUG

```shell
DEBUG=vk-streaming-api:*
```

## Обратная связь
По всем вопросам/замечаниям/предложениям прошу написать мне [ВКонтакте](https://vk.com/id14949958) либо сделать pull request
