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
  const MAX_LEN = 5
  const THRESHOLD = 5
  const TRAIL_LENGTH = 4 // half breaths in & out, should be multiple of 2
  const history = []
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
    get() {
      return state
    },
    update(val) {
      const now = Date.now()
      history.push({value: val, timestamp: now})
      if (history.length < MAX_LEN) {
        if (history.length === (MAX_LEN - 1)) {
          // INITIALIZE
          const avg = history.reduce((sum, current) => sum + current, 0) / history.length
          const direction = avg > 0 ? 'out' : 'in'
          const startedAt = history[0].timestamp
          state = {
            direction,
            startedAt,
          }
        }
        return
      }
      if (history.length > MAX_LEN) {
        history.splice(0, 1)
      }
      
      return this.detectChange()
    },
    detectChange() {
      const sign = state.direction === 'in' ? 1 : -1
      const min = sign * Math[sign > 0 ? 'min' : 'max'](history[0].value, history[1].value)
      const max = sign * Math[sign > 0 ? 'max' : 'min'](history[1].value, history[2].value)
      let didChange = true
      if (min > 0) {
        didChange = false
      } else if (max < 0) {
        didChange = false
      } else if ((max - min) < THRESHOLD) {
        didChange = false
      } else if ((sign * averageOf([history[2].value, history[3].value, history[4].value])) < 0) {
        didChange = false
      } else if (history.indexOf(changeItem) > 0) {
        didChange = false
      }
      if (didChange) {
        state = {
          direction: (state.direction === 'in' ? 'out' : 'in'),
          startedAt: Date.now(),
        }
        changeItem = history[MAX_LEN - 1]
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
      }
      return didChange
    }
  }
})()

const KalmanFilter = require('kalmanjs').default
const kalmanFilter = new KalmanFilter({R: 0.05, Q: -0.7})
function processData (data) {
  const {
    Timestamp,
    ArrayGyro,
  } = data
  // console.log(Timestamp, ArrayGyro)
  const { x, y, z } = ArrayGyro[0]
  alphaSmooth.update(x)
  const val = kalmanFilter.filter(x)
  const normalized = alphaSmooth.normalize(val)
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