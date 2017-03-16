/* @flow */

import React from 'react'
import mixin from '../lib'

describe('react-mixin', function() {
  describe('input validation', function() {
    it('throws if source is not a function/class in non-decorator mode', function() {
      expect(function() {
        mixin({})
      }).toThrow('Invalid source provided in non-decorator mode to mixin()')
    })
    it('throws if mixins is not an array in non-decorator mode', function() {
      expect(function() {
        mixin({}, function() {}, 1)
      }).toThrow('Invalid mixins provided in non-decorator mode to mixin()')
    })
    it('does not throw if all parameters in non-decorator-mode are valid', function() {
      expect(function() {
        mixin({}, function() {}, [])
      }).not.toThrow()
    })

    it('throws if mixins is not an array in decorator-mode', function() {
      expect(function() {
        mixin({ decorator: true }, 1)
      }).toThrow('Invalid mixins provided in decorator mode to mixin()')
    })
    it('throws if we provide third parameter in decorator-mode', function() {
      expect(function() {
        mixin({ decorator: true }, [], [{}])
      }).toThrow('Unexpected third parameter in decorator mode to mixin()')
    })
    it('does not throw if parameters are valid in decorator-mode', function() {
      expect(function() {
        mixin({ decorator: true }, [])
      }).not.toThrow()
    })
  })

  describe('features', function() {
    it('merges all context types together', function() {
      const decor = mixin({ decorator: true }, [{
        contextTypes: {
          some: React.PropTypes.number,
        },
      }])

      @decor
      class MyComponent {
        static contextTypes = {
          color: React.PropTypes.string,
        }
      }

      expect(MyComponent.contextTypes).toEqual({
        some: React.PropTypes.number,
        color: React.PropTypes.string,
      })
    })
    it('overwrites mixin prop types with component ones when they have same name', function() {
      const decor = mixin({ decorator: true }, [{
        contextTypes: {
          some: React.PropTypes.number,
          thing: React.PropTypes.number,
        },
      }])

      @decor
      class MyComponent {
        static contextTypes = {
          thing: React.PropTypes.string,
        }
      }

      expect(MyComponent.contextTypes).toEqual({
        some: React.PropTypes.number,
        thing: React.PropTypes.string,
      })
    })
    it('extends component with React when we tell it to', function() {
      const decor = mixin({ decorator: true, react: true })

      @decor
      class MyComponent {
        render() { return <div>Hi!</div> }
      }

      expect(MyComponent.prototype instanceof React.Component).toBe(true)
    })
    it('copies static properties from the source', function() {
      const decor = mixin({ decorator: true })
      const priv = {}

      @decor
      class MyComponent {
        static wow = priv
      }

      expect(MyComponent.wow).toBe(priv)
    })
    it('copies even non-enumerable properties from source, as non-enumerable', function() {
      const decor = mixin({ decorator: true })
      const priv = {}

      @decor
      class MyComponent { }
      // $FlowIgnore: Custom Prop
      Object.defineProperty(MyComponent, 'someVal', {
        enumerable: false,
        value: priv,
      })

      // $FlowIgnore: Custom Prop
      expect(MyComponent.someVal).toBe(priv)
      expect({}.propertyIsEnumerable.call(MyComponent, 'someVal')).toBe(false)
    })
    it('copies static functions from source', function() {
      const decor = mixin({ decorator: true })
      function myFunction() {}

      @decor
      class MyComponent {
        static myFunc = myFunction
      }

      expect(MyComponent.myFunc).toBe(myFunction)
    })
  })
})
