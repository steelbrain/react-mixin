/* @flow */

import React from 'react'
import ReactDOM from 'react-dom'
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
    it('calls all the decorator mixins in order', function() {
      const value1 = function() {}
      const value2 = function() {}
      const value3 = function() {}
      const value4 = function() {}

      const called = []
      const decor = mixin({ decorator: true }, [
        function(input) {
          expect(input.prototype instanceof value1).toBe(true)
          called.push('func1')
          return value2
        },
        function(input) {
          expect(input).toBe(value2)
          called.push('func2')
          return value3
        },
        function(input) {
          expect(input).toBe(value3)
          called.push('func3')
          return value4
        },
        function(input) {
          expect(input).toBe(value4)
          called.push('func4')
        },
      ])

      expect(decor(value1)).toBe(value4)
      expect(called).toEqual(['func1', 'func2', 'func3', 'func4'])
    })
    it('calls all lifecycle methods properly', function() {
      const called = []
      let myThis

      function validateMyThis(givenThis) {
        if (!givenThis || !myThis) return
        if (myThis !== givenThis) throw new Error('Invalid this passed on')
        myThis = givenThis
      }

      const decor = mixin({ decorator: true }, [{
        componentDidMount() {
          validateMyThis(this)
          called.push('componentDidMount-custom')
        },
        componentWillMount() {
          validateMyThis(this)
          called.push('componentWillMount-custom')
        },
        componentWillReceiveProps() {
          validateMyThis(this)
          called.push('componentWillReceiveProps-custom')
        },
        componentWillUpdate() {
          validateMyThis(this)
          called.push('componentWillUpdate-custom')
        },
        componentDidUpdate() {
          validateMyThis(this)
          called.push('componentDidUpdate-custom')
        },
        componentWillUnmount() {
          validateMyThis(this)
          called.push('componentWillUnmount-custom')
        },
        getChildContext() {
          validateMyThis(this)
          called.push('getChildContext-custom')
        },
      }])

      @decor
      // $FlowIgnore: IT IS A REACT COMPONENT!!!
      class MyClass { // eslint-disable-line no-unused-vars
        componentDidMount() {
          validateMyThis(this)
          called.push('componentDidMount')
        }
        componentWillMount() {
          validateMyThis(this)
          called.push('componentWillMount')
        }
        componentWillReceiveProps() {
          validateMyThis(this)
          called.push('componentWillReceiveProps')
        }
        componentWillUpdate() {
          validateMyThis(this)
          called.push('componentWillUpdate')
        }
        componentDidUpdate() {
          validateMyThis(this)
          called.push('componentDidUpdate')
        }
        componentWillUnmount() {
          validateMyThis(this)
          called.push('componentWillUnmount')
        }
        getChildContext() {
          validateMyThis(this)
          called.push('getChildContext')
        }
        render() {
          return <div>Well Damn</div>
        }
      }

      const parent = document.createElement('div')
      ReactDOM.render(<MyClass a="hi" />, parent)

      expect(parent.outerHTML).toBe('<div><div data-reactroot="">Well Damn</div></div>')
      expect(called).toEqual([
        'componentWillMount-custom',
        'componentWillMount',
        'getChildContext-custom',
        'getChildContext',
        'componentDidMount-custom',
        'componentDidMount',
      ])
    })
  })
})
