# React Mixin

[![Greenkeeper badge](https://badges.greenkeeper.io/steelbrain/react-mixin.svg)](https://greenkeeper.io/)

`sb-react-mixin` is a Helper libray for containing reusable component decorators and interfaces.

## API

```js
// NOTE: This package supports two different signatures
export default function mixin(options: { decorator: false }, source: Class | Function, mixins: Array)
export default function mixin(options: { decorator: true }, mixins: Array)
```

## Example Usage

```js
import React from 'react'
import ReactDOM from 'react-dom'
import mixin from 'sb-react-mixin'

const mixinExtraProps = {
  defaultProps: { hello: 'ola' },
}
const mixinAutobind = require('autobind-decorator')

{
  // Without decorator
  class MyComponent {
    render() {
      console.log(this.props.hello) // 'ola'
      return (<div>Hello!</div>)
    }
  }

  const MyReactComponent = mixin({ decorator: false }, MyComponent, [mixinExtraProps, mixinAutobind])
  ReactDOM.render(<MyReactComponent />, document.getElementById('app'))
}

{
  // With decorator
  const myMixin = mixin({ decorator: true }, [mixinExtraProps, mixinAutobind])

  @myMixin
  class MyComponent {
    render() {
      console.log(this.props.hello) // 'ola'
      return (<div>Hello!</div>)
    }
  }

  ReactDOM.render(<MyComponent />, document.getElementById('app'))
}

{
  // Merging child context

  const myMixin = mixin({ decorator: true }, [
    {
      childContextTypes: { some: React.PropTypes.string },
      getChildContext(){ return { some: 'thing' } }
    },
    mixinExtraProps,
    mixinAutoBind,
  ])

  @myMixin
  class MyComponent {
    static childContextTypes = {
      here: React.PropTypes.number,
    }
    getChildContext() {
      return { here: 1 }
    }
    render() {
      console.log(this.context.some) // 'thing'
      console.log(this.context.here) // 1
      return (<div>Hello!</div>)
    }
  }
}
```

## Features

This package allows merging in the following life cycle callbacks

- `componentDidMount`
- `componentWillMount`
- `componentWillReceiveProps`
- `componentWillUpdate`
- `componentDidUpdate`
- `componentWillUnmount`
- `shouldUpdateComponent`
- `getChildContext`

This package allows merging in the following static properties, any unknown properties are left on the component as-is

- `contextTypes`
- `childContextTypes`
- `defaultProps`


## License

This package is licensed under the terms of
