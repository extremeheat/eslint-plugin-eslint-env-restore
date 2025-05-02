# eslint-plugin-eslint-env-restore
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-eslint-env-restore.svg)](http://npmjs.com/package/eslint-plugin-eslint-env-restore)
[![Build Status](https://github.com/extremeheat/eslint-plugin-eslint-env-restore/actions/workflows/ci.yml/badge.svg)](https://github.com/extremeheat/eslint-plugin-eslint-env-restore/actions/workflows/)
[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/extremeheat/eslint-plugin-eslint-env-restore)

ESLint plugin to restore `/* eslint-env */` comment functionality in ESLint v9+.

As documented in  https://eslint.org/docs/latest/use/configure/migration-guide#eslint-env-configuration-comments,
ESLint v9 removes `/* eslint-env */` comment support to dynamically set the environment on a file-by-file basis.
Instead, you have to manually declare the globals you use which is quite ugly. This plugin restores the old functionality
of eslint-env -- **assuming your `/* eslint-env name */` comment is at the top of the file**.

## Install
```js
npm i -D eslint-plugin-eslint-env-restore
```

## Usage

Add inside your `plugins` and at the level of `rules`:

```diff
+const eslintEnvRestorePlugin = require('eslint-plugin-eslint-env-restore')
module.exports = [
  {
    plugins: {
+      'eslint-env-restore': eslintEnvRestorePlugin
    },
+   processor: 'eslint-env-restore/js',
    rules: {
        ...otherRules,
+      'no-unused-vars': ['error', { vars: 'local' /*, ... */ }]
    }
```

Also, to prevent getting errors about unused globals (as we add all of them for the specified env regardless of use), you must 
set `no-unused-vars`'s `vars` to ignore globals with `vars: 'local'`, per https://eslint.org/docs/latest/rules/no-unused-vars#vars.

Then, you can run `eslint` or `eslint --fix` as usual on code like this:

```js
/* eslint-env mocha */

describe('basic', () => {
  it('test', () => {
    console.log('it works~')
  })
})
```

without getting errors.
