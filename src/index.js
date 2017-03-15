/* @flow */

import React from 'react'
import { invokeFrom } from './helpers'
import type { MixinOptions } from './types'

export function process(options: MixinOptions, source: Function, givenMixins: Array<any>): Function {
  const mixins = givenMixins.filter(i => i)
  const methodMixins = mixins.filter(i => typeof i === 'object')

  // NOTE: This adds the builtin methods, AFTER mixing methods
  methodMixins.push(source.prototype)

  // $FlowIgnore: Gotta extend a Function-typed class, sorry
  class ChildComponent extends source {
    static get name() {
      return super.name
    }
    get name() {
      return super.name
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

  // NOTE: Make sure that mixins can be overwritten by the class contextTypes
  const contextTypes = {}
  methodMixins.forEach(function(entry) {
    if (entry.contextTypes && typeof entry.contextTypes === 'object') {
      Object.assign(contextTypes, entry.contextTypes)
    }
  })
  Object.assign(contextTypes, ChildComponent.contextTypes)
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

export default function mixin(options: MixinOptions, sourceOrMixins: Function | Array<any>, mixins: Array<any> = []): any {
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
