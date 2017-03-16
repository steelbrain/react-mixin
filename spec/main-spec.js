/* @flow */

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
})
