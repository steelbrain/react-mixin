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

export function mergeIntoComponent(name: string, component: Function, source: Function, mixins: Array<Object>): void {
  const together = {}
  mixins.filter(i => typeof i === 'object' && i).forEach(function(entry) {
    if (entry[name] && typeof entry[name] === 'object') {
      Object.assign(together, entry[name])
    }
  })
  Object.assign(together, source[name])
  // eslint-disable-next-line no-param-reassign
  component[name] = together
}
