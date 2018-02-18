pragma solidity 0.4.18;

import "./IMaker.sol";
import "./ERC20.sol";
import "./IWETH.sol";

contract DaiMaker {
    IMaker public maker;
    ERC20 public weth;
    ERC20 public peth;
    ERC20 public dai;

    event MakeDai(address indexed daiOwner, address indexed cdpOwner, uint256 ethAmount, uint256 daiAmount);

    function DaiMaker(IMaker _maker) {
        maker = _maker;
        weth = maker.gem();
        peth = maker.skr();
        dai = maker.sai();
    }

    function makeDai(uint256 daiAmount, address cdpOwner, address daiOwner) payable public returns (bytes32 cdpId) {
        IWETH(weth).deposit.value(msg.value)();     // wrap eth in weth token
        weth.approve(maker, msg.value);             // allow maker to pull weth

        maker.join(maker.ask(msg.value));           // convert weth to peth
        uint256 pethAmount = peth.balanceOf(this);
        peth.approve(maker, pethAmount);            // allow maker to pull peth

        cdpId = maker.open();                       // create cdp in maker
        maker.lock(cdpId, pethAmount);              // lock peth into cdp
        maker.draw(cdpId, daiAmount);               // create dai from cdp

        dai.transfer(daiOwner, daiAmount);          // transfer dai to owner
        maker.give(cdpId, cdpOwner);                // transfer cdp to owner

        MakeDai(daiOwner, cdpOwner, msg.value, daiAmount);
    }
}
