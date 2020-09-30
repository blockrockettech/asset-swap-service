pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Deposit {
    mapping(address => uint256) public balances;

    IERC20 public token;

    constructor(IERC20 _token) public {
        token = _token;
    }

    function deposit(uint256 _amount) external {
        balances[msg.sender] = _amount;
        token.transferFrom(msg.sender, address(this), _amount);
    }

    function balanceOf(address _userAddress) external view returns (uint256) {
        return balances[_userAddress];
    }
}
