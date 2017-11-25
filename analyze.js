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

const MIN_BREATH_DURATION = 1000
const NBR_OF_ITEMS = 5

const memory = []
function calculateDelta (val) {
  memory.push(val)
  if (memory.length < 2) {
    return 0
  } else if (memory.length > NBR_OF_ITEMS) {
    memory.splice(0, 1)
  }
  const nbrOfItems = memory.length
  let deltaSum = 0
  memory.reduce((prev, current) => {
    if (!prev) return
    const delta = current - prev
    deltaSum += delta
    return current
  })
  return deltaSum / nbrOfItems
}

function processData (data) {
  const {
    Timestamp,
    ArrayGyro,
  } = data
  // console.log(Timestamp, ArrayGyro)
  const { x, y, z } = ArrayGyro[0]
  // console.log(x, y, z)
  const delta = calculateDelta(x)
  console.log(delta)
}

