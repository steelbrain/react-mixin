/* @flow */

export function invokeFrom(mixins: Array<Object>, name: string, thisArg: any, args: Array<any>): Array<any> {
  const results = []
  mixins.forEach((entry) => {
    if (typeof entry[name] === 'function') results.push(entry[name].apply(thisArg, args))
  })
  return results
}
