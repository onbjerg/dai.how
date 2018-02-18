var DaiMaker = artifacts.require("./DaiMaker.sol");

const makerAddr = {
  mainnet: '0x448a5065aebb8e423f0896e6c5d525c040f59af3',
  kovan:   '0xa6bfc88aa5a5981a958f9bcb885fcb3db0bf941e',
}

module.exports = async (deployer, network, accounts) => {
  const daimaker = await DaiMaker.new(makerAddr[network])
  console.log('deployed daimaker', daimaker.address)
}
