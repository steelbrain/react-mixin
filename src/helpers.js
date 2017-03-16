/* @flow */

import type { Options } from './types'

export function invokeFrom(mixins: Array<Object>, name: string, thisArg: any, args: Array<any>): Array<any> {
  const results = []
  mixins.forEach((entry) => {
    if (typeof entry[name] === 'function') results.push(entry[name].apply(thisArg, args))
  })
  return results
}

export function fillOptions(given: Object): Options {
  if (!given || typeof given !== 'object') {
    throw new Error('Options must be a valid object')
  }

  const options = {}

  options.react = typeof given.react === 'undefined' ? true : !!given.react
  options.decorator = !!given.decorator

  return options
}
