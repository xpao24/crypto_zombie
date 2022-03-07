// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./ownable.sol";
import "./SafeMath.sol";

// 僵尸工厂合约
contract ZombieFactory is Ownable {
  using SafeMath for uint256;
  // 创造僵尸事件
  event NewZombie(uint zombieId,string name,uint dna);
  // dna位数
  uint dnaDigits = 16;
  
  uint dnaModulus = 10 ** dnaDigits;

  uint cooldownTime = 1 days;

  bytes32 public keyHash;
  uint256 public fee;
  uint256 public randomResult;
  
  //僵尸定义
  struct Zombie {
      string name;
      uint dna;
      uint32 level;
      uint32 readyTime;
      uint16 winCount;
      uint16 lossCount;
  }

  Zombie[] public zombies;
  //僵尸owner
  mapping ( uint => address) public zombieToOwner;
  mapping ( address => uint) public ownerZombieCount;

  function _createZombie(string memory _name, uint _dna) internal {
      zombies.push(Zombie(_name, _dna,1,uint32(block.timestamp + cooldownTime),0, 0));
      uint id = zombies.length - 1;
      zombieToOwner[id] = msg.sender;
      ownerZombieCount[msg.sender]++;
      emit NewZombie(id, _name, _dna);
  }
  //根据名字随机生成dna
  function _generateRandomDna(string memory _str) private view returns(uint) {
    uint rand = uint(keccak256(abi.encodePacked(_str)));
    return rand % dnaModulus;
  }
  //创造僵尸外部入口
  function createRandomZombie(string memory _name) public {
    require(ownerZombieCount[msg.sender]==0);
    uint randDna = _generateRandomDna(_name);
    _createZombie(_name,randDna); 
  }
  // 自我销毁
  function kill() public onlyOwner {
    address payable addr = payable(owner());
    selfdestruct(addr);
  }
}