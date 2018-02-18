pragma solidity 0.4.18;

import "./ERC20.sol";

interface IMaker {
    function sai() public view returns (ERC20);
    function skr() public view returns (ERC20);
    function gem() public view returns (ERC20);

    function open() public returns (bytes32 cup);
    function give(bytes32 cup, address guy) public;

    function ask(uint wad) public view returns (uint);

    function join(uint wad) public;
    function lock(bytes32 cup, uint wad) public;
    function free(bytes32 cup, uint wad) public;
    function draw(bytes32 cup, uint wad) public;
    function cage(uint fit_, uint jam) public;
}
