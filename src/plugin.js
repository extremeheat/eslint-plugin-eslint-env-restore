// ./env-restore.js
const envGlobals = require('globals')

// Store prepended lengths for each file
const prependedLengths = new Map()

function extractEslintEnv (text) {
  const firstLine = text.split('\n')[0].trim()
  if (firstLine.startsWith('/* eslint-env ') && firstLine.endsWith('*/')) {
    const envPart = firstLine.slice(14, -2).trim()
    return envPart.split(',').map(env => env.trim())
  }
  return []
}

function mapEnvsToGlobals (envs) {
  const globals = {}
  envs.forEach(env => {
    if (envGlobals[env]) {
      Object.assign(globals, envGlobals[env])
    }
  })
  return globals
}

module.exports = {
  processors: {
    js: {
      preprocess (text, filename) {
        const envs = extractEslintEnv(text)
        if (envs.length === 0) return [text]

        const globals = mapEnvsToGlobals(envs)
        const globalNames = Object.keys(globals).filter(globalName => text.includes(globalName))
        const prefix = `/* global ${globalNames.join(', ')} */`
        const prepended = `${prefix} `
        const injectedComment = prepended + text
        // Store the length of the prepended string
        prependedLengths.set(filename, prepended.length)
        return [injectedComment]
      },
      postprocess (messages, filename) {
        const prependedLength = prependedLengths.get(filename)
        if (prependedLength == null) {
          return messages[0]
        }
        // Adjust fix ranges in messages
        const adjustedMessages = messages[0].map(message => {
          if (message.fix && message.fix.range[0] >= prependedLength) {
            return {
              ...message,
              fix: {
                ...message.fix,
                range: [
                  message.fix.range[0] - prependedLength,
                  message.fix.range[1] - prependedLength
                ]
              }
            }
          } else {
            // Discard fixes within the prepended part
            return { ...message, fix: undefined }
          }
        })
        // Clean up
        prependedLengths.delete(filename)
        return adjustedMessages
      },
      supportsAutofix: true
    }
  }
}

// ESlint limits length of globals so we need to chunk them
// const chunks = chunk(globalNames, 512)
// let prefix = ''
// for (const chunk of chunks) {
//   prefix += `/* global ${chunk.join(', ')} */ `
// }
// function chunk (arr, len) {
//   const chunks = []
//   let i = 0
//   while (i < arr.length) {
//     chunks.push(arr.slice(i, i += len))
//   }
//   return chunks
// }
