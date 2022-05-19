pragma solidity ^0.8.7;
// SPDX-License-Identifier: MIT

//@godmodeinvestor => 308399201
//@decentrewardbot => 1518535984320851968

import "../openzeppelin-contracts/contracts/access/Ownable.sol";

contract IDPairing is Ownable {
    mapping(address => uint256) adressToContestID;
    mapping(address => uint256) addressBalance;

    event contestOwnerIDUpdated(address indexed _from, uint256 ID);
    
    function setContestOwnerID(address _address, uint256 ID)
        public
        onlyOwner
    {
        require(ID > 0);
        adressToContestID[_address] = ID;
        emit contestOwnerIDUpdated(_address, ID);
    }
    
    function getContestID() public view returns(uint256)
    {
        return adressToContestID[msg.sender];
    }
}