// ./env-restore.js
const envGlobals = require('globals')

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
        // Check that code includes the global name somewhere to cut down on globals size
        const globalNames = Object.keys(globals).filter(globalName => text.includes(globalName))
        const prefix = `/* global ${globalNames.join(', ')} */`
        const injectedComment = `${prefix} ${text}`
        return [injectedComment]
      },
      postprocess (messages) {
        return messages[0]
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
