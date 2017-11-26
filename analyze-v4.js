const samples = require('./sample')

// {"Timestamp":96524,"ArrayGyro":[{"z":0.5600000023841858,"x":-1.330000042915344,"y":0.9800000190734863}]}

const SPEED_UP = 1

let lastTimestamp = null
setNextInterval()

function setNextInterval() {
  const [sample] = samples.splice(0, 1)
  const {
    Timestamp,
  } = sample

  const delta = lastTimestamp ? (Timestamp - lastTimestamp) / SPEED_UP : 0
  lastTimestamp = Timestamp
  setTimeout(() => {
    processData(sample)
    setNextInterval()
  }, delta)

}

// const movingAverage = (() => {
//   const MAX = 100
//   const history = []
//   return {
//     get() {
//       if (!history.length) {
//         return 0
//       }
//       return history.reduce((sum, val) => sum + val, 0) / history.length
//     },
//     update(val) {
//       history.push(val)
//       if (history.length > MAX) {
//         history.splice(0, 1)
//       }
//       return this.get()
//     }
//   }
// })()

const alphaSmooth = (() => {
  const ALPHA = 0.005
  let estimate = -0.7
  return {
    get() {
      return estimate
    },
    update(val) {
      const err = val - estimate
      estimate += ALPHA*err
      return this.get()
    },
    normalize(val) {
      return val - estimate
    }
  }
})()

function averageOf(arr) {
  return arr.reduce((sum, current) => sum + current, 0) / arr.length
}

const detectChange = (() => {
  const ZERO_COUNT_THRESHOLD = 2/3
  const ALT_SWITCH_THRESHOLD = 4
  const ALT_SWITCH_THRESHOLD_SUM = 3.0
  const THRESHOLD = 5
  let history = []
  let alternativeHistory = []
  const TRAIL_LENGTH = 4 // half breaths in & out, should be multiple of 2
  const trail = []
  let state = {
    direction: 'in',
    startedAt: Date.now(),
  }
  let listener
  let changeItem
  return {
    setListener(callback) {
      listener = callback
    },
    refreshAltHistory() {
      let newAltHistory = []
      let startFrom = 0
      let zeroCount = 0
      let shouldCut = false
      for (let i = 0, max = alternativeHistory.length; i < max; i++) {
        const item = alternativeHistory[i]
        newAltHistory.push(item)
        if (!item.value) {
          zeroCount++
          const itemsLookedAt = i - startFrom
          if (itemsLookedAt && (zeroCount / itemsLookedAt) > ZERO_COUNT_THRESHOLD) {
            shouldCut = true
          }
        } else {
          if (shouldCut) {
            shouldCut = false
            newAltHistory = [item]
            startFrom = i
            zeroCount = 0
          }
        }

        return newAltHistory.length === alternativeHistory.length ? alternativeHistory : newAltHistory
      }
    },
    update(val) {
      const sign = state.direction === 'out' ? 1 : -1

      const isCurrent = val * sign > 0
      history.push({
        value: isCurrent ? val : 0,
        timestamp: Date.now(),
      })
      alternativeHistory.push({
        value: isCurrent ? 0 : val,
        timestamp: Date.now(),
      })
      alternativeHistory = this.refreshAltHistory()

      if (alternativeHistory.length < ALT_SWITCH_THRESHOLD) {
        console.log('not enough', alternativeHistory.length)
        return false
      }

      // const sum = alternativeHistory.reduce((sum, item) => sum + item.value, 0)
      // if (sum < ALT_SWITCH_THRESHOLD_SUM) {
      //   return false
      // }

      const newHistory = alternativeHistory
      alternativeHistory = history
      history = newHistory
      alternativeHistory = this.refreshAltHistory()
      
      state = {
        direction: (state.direction === 'in' ? 'out' : 'in'),
        startedAt: Date.now(),
      }
      trail.push(state)
      if (trail.length > TRAIL_LENGTH) {
        trail.splice(0, 1)
      }
      let breathLength = null
      if (trail.length === TRAIL_LENGTH) {
        breathLength = (trail[TRAIL_LENGTH - 1].startedAt - trail[0].startedAt) / TRAIL_LENGTH * 2
      }
      state.breathLength = breathLength
      console.log('                 ', state)
      if (listener) {
        listener(state)
      }

      return true
    }
  }
})()

function processData (data) {
  const {
    Timestamp,
    ArrayGyro,
  } = data
  // console.log(Timestamp, ArrayGyro)
  const { x, y, z } = ArrayGyro[0]
  alphaSmooth.update(x)
  const normalized = alphaSmooth.normalize(x)
  detectChange.update(normalized)
  printVal(x, normalized, normalized)
}

function padToLength (x, length) {
  let prev = x.toString().substring(0, length - 1)
  if (prev.length < (length - 1)) {
    prev = new Array(length - prev.length).join(' ') + prev
  }
  return prev
}

function printVal (orig, x, val) {
  let originalValue = padToLength(orig, 7)
  let prev = padToLength(x, 7)
  // const next = val.toString().substring(0, 6)
  const SCALE = 2
  const MAX = 20
  const rounded = parseInt(Math.max(Math.min(val * SCALE, MAX), -MAX), 10)
  const next = new Array(Math.abs(rounded)).join(rounded > 0 ? '#' : 'o')
  let toPrint = new Array(MAX).join(' ')
  if (rounded < 0) {
    toPrint = toPrint.substring(0, MAX + rounded)
  }
  toPrint += next
  console.log(`${originalValue} -> ${prev}: ${toPrint}`)
}