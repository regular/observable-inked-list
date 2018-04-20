const test = require('tape')
const oll = require('.')
const Value = require('mutant/value')

test('Observes changes of value itself', t => {
  t.plan(1)
  const v = Value(0)
  const o = oll(v)

  o( x => {
    t.deepEqual(x, [1])
  })
  v.set(1)
})

test('Does not call listener after unsubscribing', t => {
  t.plan(1)
  const v = Value(0)
  const o = oll(v)
  let count = 0

  const unsubscribe = o( x => {
    if (count++ == 0) {
      t.deepEqual(x, [1])
      unsubscribe()
    }
    else t.fail()
  })
  v.set(1)
  v.set(2)
})

test('Starts observing linked-to value when being observed itself', t => {
  const calls = []
  let unsubscribed = 0

  const values = [
    Value(1), // 0 -> 1
    function () {
      calls.push(Array.from(arguments))
      return function() {unsubscribed++}
    }
  ]

  const o = oll(values[0], x => x, x => values[x])
  t.equal(calls.length, 0)
  t.equal(unsubscribed, 0)

  const unsubscribe = o( ()=>{})

  t.equal(calls.length, 2)
  t.notOk(calls[0][0]) // called to get value
  t.ok(calls[1][0]) // called to subscribe
  t.equal(unsubscribed, 0)

  unsubscribe()
  t.equal(unsubscribed, 1)
  
  t.end()
})

test('Calls listener when linked-to value changes', t => {
  // two integers. They are indices into their containing array,
  // forming a linked list of values (values[0] points to values[1], values[1] points to nothing)
  const values = [
    Value(1), // 0 -> 1
    Value()   // 1 -> undefined
  ]

  t.plan(1)

  const extractLink = x => x
  const obsFromLink = x => values[x]

  const o = oll(values[0], extractLink, obsFromLink)

  o( x => {
    t.deepEqual(x, [1, null])
  })
  values[1].set(null)
})

test('Calling returns entire chain', t => {
  const values = [
    Value(1), // 0 -> 1
    Value(2), // 1 -> 2
    Value()   // 2 -> null
  ]

  t.deepEqual(
    oll(values[2], x => x, x => values[x])(),
    [null]
  )

  t.deepEqual(
    oll(values[1], x => x, x => values[x])(),
    [2, null]
  )

  t.deepEqual(
    oll(values[0], x => x, x => values[x])(),
    [1, 2, null]
  )
  t.end()
})

test('Changing a link in the chain starts observing new link and ends observing old one', t => {
  const values = [
    Value(1),   // 0 -> 1
    Value(2),   // 1 -> 2
    Value(null), // 2 -> null
    Value(null) // 3 -> null
  ]

  t.plan(4)

  t.deepEqual(
    oll(values[0], x => x, x => values[x])(),
    [1, 2, null]
  )

  let count = 0
  const o = oll(values[0], x => x, x => values[x])
  o( l => {
    count++
    if (count == 1) t.deepEqual(l, [1, 3, null])
    else if (count == 2) t.deepEqual(l, [1, 3, 2, 'foo'])
    else if (count == 3) t.deepEqual(l, [1, 3, 2, 'bar'])
    else t.fail(`count is ${count}`)
  })
  values[1].set(3)
  values[2].set('foo') // ignored, not observing 2 anymore
  values[3].set(2)    // 3 should be observed now, and 2 also, again.
  values[2].set('bar')
})
