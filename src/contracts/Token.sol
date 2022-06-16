// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
// using SafeMath for uint256;

// contract SafeMath {
//     function safeAdd(uint a, uint b) public pure returns (uint c) {
//         c = a + b;
//         require(c >= a);
//     }
//     function safeSub(uint a, uint b) public pure returns (uint c) {
//         require(b <= a); c = a - b; } function safeMul(uint a, uint b) public pure returns (uint c) { c = a * b; require(a == 0 || c / a == b); } function safeDiv(uint a, uint b) public pure returns (uint c) { require(b > 0);
//         c = a / b;
//     }
// }

contract Token {
    // This tells smart contract that we're using SafeMath for the balanceOf below
        // SafeMath is the import from above
    using SafeMath for uint;

    string public name = "My Token Name";
    string public symbol = "MTN";
    uint256 public decimals = 18;
    uint256 public totalSupply;

        // Track Balances
        // Associates address to token balance on the blockchain
        // uses state variable but also exposes public balanceOf() method
        // accepts owner and returns balance.
        // uint256 means that a number can't have a sign,
        // This makes things such as decimals and totalSupply not possible to be negative
    mapping(address => uint256) public balanceOf;

// Events
    // indexed keyword subscribes to events only 
    // Transfer event includes 3 params including to address, from address, 
    // and value being transferred.
    // To call event, use keyword emit as done in transfer() below
event Transfer(address indexed from, address indexed to, uint256 value);


    // Use constructor to define totalSupply, can't and shouldn't be defined above
        // constructors have to have public keyword, supply always needs to be in this format
            // 10 to the power of 18 times the number of tokens you want, which in this instance is 1,000,000
    constructor()public {
        totalSupply = 1000000 * (10**decimals);
        // [], way to access the mapping(); access by just using [msg.sender]
            // assign value by = sign
            // KVP, [] is key and value is what it's assigned to which in this instance 
            // is totalSupply; sender is person deploying this smart contract
            // which is the 1st account in ganache
        balanceOf[msg.sender] = totalSupply;
    }
    
    // Send Tokens
    function transfer(address _to, uint256 _value) public returns (bool success) {
        // Require check to make sure the to address isn't null or an address it shouldn't be
            // Could there be more checks to this?
        require(_to != address(0));
        // Will only run statements after require() if require() evaluates to true
        // Can only send tokens if they have exactly enoguyh or mroe tokens than value being sent
        require(balanceOf[msg.sender] >= _value);
        // Remove balance from sender and add balance to _to address
            // .sub() is subtract method, this sets senders balance equal to 
                // sender balance minus _value param seen above(how much is being sent is _value)
                    // This is probably a more current way to do and use safeMath
                    // balanceOf[msg.sender] = safeAdd(balanceOf[msg.sender],_value);
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);

        // Add balance to _to address param
            // Pretty simple again, use .add() method and add _value instead
            // of subtracting -> seems easy to test
                // This is probably a more current way to do and use safeMath
                // balanceOf[_to] = safeSub(balanceOf[_to],_value);
         balanceOf[_to] = balanceOf[_to].add(_value);

        // required part of transfer() method -> Transfer event
        // don't need brackets here, can just use variables names as they're addresses
        emit Transfer(msg.sender, _to, _value);
        // expects return true by bool success returns
        return true;
    }


    // Approve Tokens with approve event.

    // Transfer from with transfer event.
}
