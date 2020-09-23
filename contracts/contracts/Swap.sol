pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Swap {
    IERC20 tokenA;
    IERC20 tokenB;

    constructor(IERC20 _tokenA, IERC20 _tokenB, uint256 _liquidityToEscrow) public {
        tokenA = _tokenA;
        tokenB = _tokenB;

        // bring in liquidity
        address self = address(this);
        tokenA.transferFrom(msg.sender, self, _liquidityToEscrow);
        tokenB.transferFrom(msg.sender, self, _liquidityToEscrow);
    }

    function swap(IERC20 _input, uint256 _amount) external {
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
        _input.transferFrom(msg.sender, self, _amount);
        output.transfer(msg.sender, _amount);
    }
}
