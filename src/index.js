/* @flow */

import React from 'react'
import { fillOptions, invokeFrom } from './helpers'
import type { Options } from './types'

const BLACKLISTED_KEYS = new Set(['length', 'prototype', 'contextTypes', 'prototype', 'arguments', 'caller'])
export function process(options: Options, source: Function, givenMixins: Array<any>): Function {
  const mixins = givenMixins.filter(i => i)
  const methodMixins = mixins.filter(i => typeof i === 'object')

  // NOTE: This adds the builtin methods, AFTER mixing methods
  methodMixins.push(source.prototype)

  class ChildComponent {
    get name() {
      return source.name
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
    getChildContext() {
      const result = {}
      invokeFrom(methodMixins, 'getChildContext', this, []).forEach(function(entry) {
        Object.assign(result, entry)
      })
      return result
    }
    getDefaultProps() {
      const result = {}
      invokeFrom(methodMixins, 'getDefaultProps', this, []).forEach(function(entry) {
        Object.assign(result, entry)
      })
      return result
    }
  }
  Object.getOwnPropertyNames(source).forEach(function(key) {
    if (BLACKLISTED_KEYS.has(key)) return
    Object.defineProperty(ChildComponent, key, {
      enumerable: {}.propertyIsEnumerable.call(source, key),
      get() { console.log('accessed', key); return source[key] },
      // eslint-disable-next-line no-param-reassign
      set(value) { source[key] = value },
    })
  })
  Object.setPrototypeOf(ChildComponent.prototype, source.prototype)

  // NOTE: Make sure that mixins can be overwritten by the class contextTypes
  const contextTypes = {}
  methodMixins.forEach(function(entry) {
    if (entry.contextTypes && typeof entry.contextTypes === 'object') {
      Object.assign(contextTypes, entry.contextTypes)
    }
  })
  Object.assign(contextTypes, source.contextTypes)
  // $FlowIgnore: React class prop
  ChildComponent.contextTypes = contextTypes

  if (options.react) {
    Object.setPrototypeOf(source.prototype, React.Component.prototype)
  }

  const decoratorMixins = mixins.filter(i => typeof i === 'function')
  return decoratorMixins.reduce((prev, entry) => {
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
