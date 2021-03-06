pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MockERC20.sol";

contract Swap {
    IERC20 public tokenA;
    IERC20 public tokenB;

    constructor() public {
        // Each contract will mint 1m tokens on construction
        tokenA = new MockERC20("FakeDAI", "DAI");
        tokenB = new MockERC20("FakexDAI", "xDAI");

        // give sender some tokens to trade
        uint256 _liquidityToSend = 500000000000000000000000; // 500k tokens
        tokenA.transfer(msg.sender, _liquidityToSend);
        tokenB.transfer(msg.sender, _liquidityToSend);
    }

    function swap(IERC20 _input, uint256 _amount, uint256 _fee, address _beneficiary) external {
        // make sure input is one of the tokens we have
        address inputAddress = address(_input);
        bool isTokenA = inputAddress == address(tokenA);
        require(isTokenA || inputAddress == address(tokenB), "Invalid input");

        // figure out what the output token is
        IERC20 output = isTokenA ? tokenB : tokenA;

        // make sure we have enough output
        address self = address(this);
        require(output.balanceOf(self) >= _amount, "not enough output");

        // swap the tokens
        _input.transferFrom(_beneficiary, self, _amount);
        output.transfer(_beneficiary, _amount - _fee);
    }

    // Will allow external callers to sense check if `_tokenAddress` is either tokenA or tokenB which would allow trading
    function isValidInputOrOutputToken(address _tokenAddress) external view returns (bool) {
        address tokenAAddress = address(tokenA);
        address tokenBAddress = address(tokenB);
        return _tokenAddress == tokenAAddress || _tokenAddress == tokenBAddress;
    }
}
