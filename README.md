# observable-linked-list

Observable for a linked list. Subscribe to changes of any part of the chain of linked objects.

## API

`observable = oll(root, link, getObs)`

- `root` - the root of the chain, an observable
- `link` - function that extracts a link from an object. Links should be comparable with `==` (strings, numbers ...)
- `getObs` - called with result of `link()`, must return observable for the linked object.

## Example

``` js
const oll = require('observable-linked-list')
const Value = require('mutant/value')

const obs = {
  a: Value({link: 'b'}),
  b: Value('foo'),
  c: Value('baz')
}

const listObs = oll(obs.a, x => x.link, x => obs[x])
console.log(listObs()) // --> [ { link: 'b' }, 'foo' ]

listObs( list => {
  console.log(list)
})

obs.b.set('bar') // --> [ { link: 'b' }, 'bar' ]
obs.a.set({link: 'c'}) // --> [ { link: 'c' }, 'baz' ]
obs.c.set({link: 'b'}) // --> [ { link: 'c' }, { link: 'b' }, 'bar' ]
```
