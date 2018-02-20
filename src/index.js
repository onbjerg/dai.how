const { createStore } = require('redux')

// DOM
const loadingScreen = document.getElementById('loading')
const appScreen = document.getElementById('app')

const issueButton = document.getElementById('issue')
const collateralInput = document.getElementById('collateral')
const daiInput = document.getElementById('dai')

const daiDisplay = document.getElementById('dai-amount')
const liquidationDisplay = document.getElementById('liquidation')
const etherPriceDisplay = document.getElementById('ether-price')
const pricesDisplay = document.getElementById('prices')
const warningDisplay = document.getElementById('collaterization-warning')

// State
function reducer (state = {
  dai: 0,
  collateral: 0.5,
  etherPrice: 945,
  state: 'loading'
}, action) {
  switch (action.type) {
    case 'SET_COLLATERAL':
      state.collateral = action.value
      break
    case 'SET_DAI':
      state.dai = action.value
      break
    case 'SET_STATE':
      state.state = action.value
      break
  }

  return state
}

const store = createStore(
  reducer
)

// UI
collateralInput.oninput = function (evt) {
  store.dispatch({ type: 'SET_COLLATERAL', value: evt.target.value })
}
daiInput.oninput = function (evt) {
  store.dispatch({ type: 'SET_DAI', value: evt.target.value })
}
function render (state) {
  const liquidationPrice = (state.dai * 1.5) / state.collateral
  const maxDaiIssuance = (state.collateral * state.etherPrice)

  // States
  if (state.state === 'loading') {
    loadingScreen.style.display = 'flex'
    appScreen.style.display = 'none'
  } else {
    loadingScreen.style.display = 'none'
    appScreen.style.display = 'flex'
  }

  // Update UI
  liquidationDisplay.innerHTML = state.collateral * 100
  daiDisplay.innerHTML = state.dai
  etherPriceDisplay.innerHTML = `$${state.etherPrice}`
  liquidationDisplay.innerHTML = `$${liquidationPrice}`
  daiInput.setAttribute('max', maxDaiIssuance)
  daiInput.value = state.dai
  collateralInput.value = state.collateral

  if (liquidationPrice >= state.etherPrice) {
    warningDisplay.style.display = 'block'
    pricesDisplay.style.display = 'none'
    issueButton.disabled = true
  } else {
    warningDisplay.style.display = 'none'
    pricesDisplay.style.display = 'block'
    issueButton.disabled = false
  }
}

// Send transaction
function issueDai () {}

// Hook it up
store.subscribe(
  () => render(store.getState())
)

// RPC provider detection
window.onload = function () {
  if (typeof web3 !== 'undefined') {
    console.log('Detected inpage provider')
    store.dispatch({ type: 'SET_STATE', value: 'inpage' })
  } else {
    console.log('Ledger detected')
    store.dispatch({ type: 'SET_STATE', value: 'ledger' })
  }
}

// Initial render
render(store.getState())
