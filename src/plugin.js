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
        const globalNames = Object.keys(globals).join(', ')
        const injectedComment = `/* global ${globalNames} */ ${text}`
        return [injectedComment]
      },
      postprocess (messages) {
        return messages[0]
      },
      supportsAutofix: true
    }
  }
}
