const { createStore } = require('redux')
const contract = require('truffle-contract')
const DaiMakerContract = require('../build/contracts/DaiMaker.json')

const DaiMaker = contract(DaiMakerContract)

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
    case 'SET_ETHER_PRICE':
      state.etherPrice = action.value
      break
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
issueButton.onclick = function () {
  issueDai()
}

function render (state) {
  const liquidationPrice = (state.dai * 1.5) / state.collateral
  const maxDaiIssuance = (state.collateral * state.etherPrice)

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

  // States
  if (state.state === 'loading') {
    loadingScreen.style.display = 'flex'
    appScreen.style.display = 'none'
  } else {
    loadingScreen.style.display = 'none'
    appScreen.style.display = 'flex'

    if (state.state !== 'inpage') {
      issueButton.disabled = true
    }
  }
}

// Send transaction
function issueDai () {
  const state = store.getState()

  Promise.all([
    new Promise(r => web3.eth.getAccounts((err, accounts) => r(accounts[0]))),
    DaiMaker.at(require('../index.js').mainnet)
  ]).then(
    ([account, instance]) => instance.makeDai(web3.toWei(state.dai), account, account, { from: account, value: web3.toWei(state.collateral) })
  ).then(() => alert(`Your CDP was opened and your Dai was transferred`))
}

// Hook it up
store.subscribe(
  () => render(store.getState())
)

// RPC provider detection
window.onload = function () {
  fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
    .then((res) => res.json())
    .then(({ USD }) => {
      store.dispatch({ type: 'SET_ETHER_PRICE', value: USD })
    })
    .then(() => {
      if (typeof web3 !== 'undefined') {
        console.log('Detected inpage provider')
        DaiMaker.setProvider(web3.currentProvider)
        store.dispatch({ type: 'SET_STATE', value: 'inpage' })
      } else {
        store.dispatch({ type: 'SET_STATE', value: 'noprovider' })
      }
    })

  // TODO: Ledger support
}

// Initial render
render(store.getState())
