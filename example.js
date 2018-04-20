const oll = require('.')
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

