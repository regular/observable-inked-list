function oll(obs, extractLink, obsFromLink) {
  let listeners = []
  let unsubscribe
  let currentLink
  let unsubscribeLink
  let innerOll

  const ret = function(listener) {
    if (!listener) return value()
    listeners.push(listener)
    if (!unsubscribe) startObserving()
    return () => {
      listeners = listeners.filter( x => x !== listener)
      if (!listeners.length && unsubscribe) stopObserving()
    }
  }
  return ret

  function getInnerOll(v) {
    const link = extractLink && extractLink(v)
    if (!link) return
    const linkedObs = obsFromLink && obsFromLink(link)
    if (!linkedObs) return
    return oll(linkedObs, extractLink, obsFromLink)
  }

  function value() {
    const v = obs()
    const io = innerOll || getInnerOll(v)
    return io ? [v].concat(io()) : [v]
  }

  function publish() {
    const v = value()
    listeners.forEach(l => l(v) )
  }

  function startObserving() {
    observeLink(obs())
    unsubscribe = obs( v => {
      observeLink(v)
      publish()
    })
  }

  function observeLink(v) {
    const link = extractLink && extractLink(v)
    if (link !== currentLink) {
      if (currentLink) {
        stopObservingLink()
      }
      currentLink = link
      if (link) {
        const linkedObs = obsFromLink(link)
        if (linkedObs) {
          innerOll = oll(linkedObs, extractLink, obsFromLink)
          unsubscribeLink = innerOll(publish)
        }
      }
    }
  }

  function stopObserving() {
    unsubscribe()
    unsubscribe = null
    stopObservingLink()
  }

  function stopObservingLink() {
    if (innerOll) {
      unsubscribeLink()
      unsubscribeLink = null
      innerOll = null
    }
  }

}

module.exports = oll
