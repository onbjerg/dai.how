pragma solidity 0.4.18;

import "./IMaker.sol";
import "./ERC20.sol";
import "./IWETH.sol";
import "./DSMath.sol";

contract DaiMaker is DSMath {
    IMaker public maker;
    ERC20 public weth;
    ERC20 public peth;
    ERC20 public dai;

    event MakeDai(address indexed daiOwner, address indexed cdpOwner, uint256 ethAmount, uint256 daiAmount, uint256 pethAmount);

    function DaiMaker(IMaker _maker) {
        maker = _maker;
        weth = maker.gem();
        peth = maker.skr();
        dai = maker.sai();
    }

    function makeDai(uint256 daiAmount, address cdpOwner, address daiOwner) payable public returns (bytes32 cdpId) {
        IWETH(weth).deposit.value(msg.value)();      // wrap eth in weth token
        weth.approve(maker, msg.value);              // allow maker to pull weth

        // calculate how much peth we need to enter with
        uint256 inverseAsk = rdiv(msg.value, wmul(maker.gap(), maker.per())) - 1;

        maker.join(inverseAsk);                      // convert weth to peth
        uint256 pethAmount = peth.balanceOf(this);

        peth.approve(maker, pethAmount);             // allow maker to pull peth

        cdpId = maker.open();                        // create cdp in maker
        maker.lock(cdpId, pethAmount);               // lock peth into cdp
        maker.draw(cdpId, daiAmount);                // create dai from cdp

        dai.transfer(daiOwner, daiAmount);           // transfer dai to owner
        maker.give(cdpId, cdpOwner);                 // transfer cdp to owner

        // just in case transfer everything to the cdp owner
        uint256 ethBalance = address(this).balance;
        if (ethBalance > 0) {
            cdpOwner.transfer(ethBalance);
        }

        uint256 wethBalance = weth.balanceOf(this);
        if (wethBalance > 0) {
            weth.transfer(cdpOwner, wethBalance);
        }

        uint256 pethBalance = peth.balanceOf(this);
        if (wethBalance > 0) {
            peth.transfer(cdpOwner, pethBalance);
        }

        MakeDai(daiOwner, cdpOwner, msg.value, daiAmount, pethAmount);
    }
}
