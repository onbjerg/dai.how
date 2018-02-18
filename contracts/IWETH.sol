pragma solidity 0.4.18;

interface IWETH {
    function deposit() public payable;
    function withdraw(uint wad) public;
}
