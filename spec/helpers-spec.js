/* @flow */

import * as Helpers from '../lib/helpers'

describe('Heplers', function() {
  describe('fillOptions', function() {
    it('throws when options is not an object', function() {
      expect(function() {
        Helpers.fillOptions()
      }).toThrow('Options must be a valid object')
    })
    it('defaults react to true', function() {
      expect(Helpers.fillOptions({}).react).toBe(true)
      expect(Helpers.fillOptions({ react: null }).react).toBe(false)
      expect(Helpers.fillOptions({ react: false }).react).toBe(false)
      expect(Helpers.fillOptions({ react: true }).react).toBe(true)
    })
    it('defaults decorator to false', function() {
      expect(Helpers.fillOptions({}).decorator).toBe(false)
      expect(Helpers.fillOptions({ decorator: null }).decorator).toBe(false)
      expect(Helpers.fillOptions({ decorator: false }).decorator).toBe(false)
      expect(Helpers.fillOptions({ decorator: true }).decorator).toBe(true)
    })
  })
  describe('invokeFrom', function() {
    it('invokes and returns results of functions correctly', function() {
      const customThis = {}
      const objA = {
        a() {
          if (this !== customThis) throw new Error('Invalid this provided')
          return 'Hi!'
        },
      }
      const objB = {
        a() {
          if (this !== customThis) throw new Error('Invalid this provided')
          return 'Ola!'
        },
      }
      const objC = {
        a() {
          if (this !== customThis) throw new Error('Invalid this provided')
          return 'Salam!'
        },
      }

      spyOn(objA, 'a').andCallThrough()
      spyOn(objB, 'a').andCallThrough()
      spyOn(objC, 'a').andCallThrough()

      const arr = [objA, { a: null }, objC, { a: 'something' }, objB]
      const args = [{}, {}, {}, true, null]
      expect(Helpers.invokeFrom(arr, 'a', customThis, args)).toEqual(['Hi!', 'Salam!', 'Ola!'])

      expect(objA.a).toHaveBeenCalledWith(...args)
      expect(objB.a).toHaveBeenCalledWith(...args)
      expect(objC.a).toHaveBeenCalledWith(...args)
    })
  })
})
