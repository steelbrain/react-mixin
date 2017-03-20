/* @flow */

import React from 'react'
import { fillOptions, mergeIntoComponent, invokeFrom } from './helpers'
import type { Options } from './types'

const BLACKLISTED_KEYS = new Set(['length', 'prototype', 'contextTypes', 'prototype', 'arguments', 'caller'])
export function process(options: Options, source: Function, givenMixins: Array<any>): Function {
  const mixins = givenMixins.filter(i => i)
  const methodMixins = mixins.filter(i => typeof i === 'object')

  // NOTE: This adds the builtin methods, AFTER mixing methods
  methodMixins.push(source.prototype)

  let ChildComponent
  if (options.react) {
    ChildComponent = class {
      constructor(...args) {
        source.call(this, ...args)
      }
      componentDidMount(...args) {
        invokeFrom(methodMixins, 'componentDidMount', this, args)
      }
      componentWillMount(...args) {
        invokeFrom(methodMixins, 'componentWillMount', this, args)
      }
      componentWillReceiveProps(...args) {
        invokeFrom(methodMixins, 'componentWillReceiveProps', this, args)
      }
      componentWillUpdate(...args) {
        invokeFrom(methodMixins, 'componentWillUpdate', this, args)
      }
      componentDidUpdate(...args) {
        invokeFrom(methodMixins, 'componentDidUpdate', this, args)
      }
      componentWillUnmount(...args) {
        invokeFrom(methodMixins, 'componentWillUnmount', this, args)
      }
      shouldUpdateComponent(...args) {
        return invokeFrom(methodMixins, 'shouldUpdateComponent', this, args).every(i => i)
      }
      getChildContext() {
        const result = {}
        invokeFrom(methodMixins, 'getChildContext', this, []).forEach(function(entry) {
          Object.assign(result, entry)
        })
        return result
      }
    }
  } else {
    ChildComponent = class {
      constructor(...args) {
        source.call(this, ...args)
      }
    }
  }
  // $FlowIgnore: It's a custom prop bro
  ChildComponent.__sb_react_mixin_source = source // eslint-disable-line no-underscore-dangle

  Object.getOwnPropertyNames(source).forEach(function(key) {
    if (BLACKLISTED_KEYS.has(key)) return
    Object.defineProperty(ChildComponent, key, Object.getOwnPropertyDescriptor(source, key))
  })
  Object.setPrototypeOf(ChildComponent.prototype, source.prototype)

  if (options.react) {
    mergeIntoComponent('contextTypes', ChildComponent, source, mixins)
    mergeIntoComponent('childContextTypes', ChildComponent, source, mixins)
    mergeIntoComponent('defaultProps', ChildComponent, source, mixins)
    Object.setPrototypeOf(source.prototype, React.Component.prototype)
  }

  return mixins.filter(i => typeof i === 'function').reduce((prev, entry) => {
    const value = entry(prev)
    return value || prev
  }, ChildComponent)
}

export default function mixin(givenOptions: Object, sourceOrMixins: Function | Array<any> = [], mixins: Array<any> = []): any {
  const options = fillOptions(givenOptions)

  if (options.decorator) {
    const mixinsLocal = sourceOrMixins
    if (!Array.isArray(mixinsLocal)) {
      throw new Error('Invalid mixins provided in decorator mode to mixin()')
    }
    if (mixins.length) {
      throw new Error('Unexpected third parameter in decorator mode to mixin()')
    }

    return function(source: Function) {
      return process(options, source, mixinsLocal)
    }
  }
  if (typeof sourceOrMixins !== 'function') {
    throw new Error('Invalid source provided in non-decorator mode to mixin()')
  }
  if (!Array.isArray(mixins)) {
    throw new Error('Invalid mixins provided in non-decorator mode to mixin()')
  }
  return process(options, sourceOrMixins, mixins)
}
