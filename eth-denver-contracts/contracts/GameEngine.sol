pragma solidity ^0.8.17;

import {IGameEngine} from "./interfaces/IGameEngine.sol";
import {LibSmartBet} from "./libraries/LibSmartBet.sol";
contract GameEngine is IGameEngine {
    function checkIsFinalMove(LibSmartBet.Move memory move) external view returns (bool) {
        return (move.moveType == LibSmartBet.Moves.FinalMove);
    }
    function getWinner(LibSmartBet.Combination[] memory combinations, LibSmartBet.Move memory move, address endCaller) external pure returns (address){
        (uint256[] memory combination1) = abi.decode(combinations[0].combinationData,(uint256[]));
        (uint256[] memory combination2) = abi.decode(combinations[1].combinationData,(uint256[]));
        address player1 = combinations[0].player;
        address player2 = combinations[1].player;
        (uint256 qty, uint256 num) = abi.decode(move.moveData,(uint256,uint256));
        uint256 _qty;
        for(uint256 i=0;i<combination1.length;i++){
            if(combination1[i]==num){
                _qty++;
            }
        }
        for(uint256 i=0;i<combination2.length;i++){
            if(combination2[i]==num){
                _qty++;
            }
        }
        if(_qty >= qty ){
            if(player1 == endCaller){
                return player2;
            }else{
                return player1;
            }
        }
        return endCaller;
    }
    /**
     * @dev this is a customizable function
     * @param previousMove - last move done
     * @param newMove - incoming move
     * @notice checks if a move is valid based on the previous move
     *         in this example, qty should be less than 6 and number should be from 1-6
     *         also the incoming move has to be greater than the previous one
     *         the first move starts with at least qty 2 or num 2
     */
    function checkIsValidMove(LibSmartBet.Move memory previousMove, LibSmartBet.Move memory newMove) external pure returns (bool){
        (uint256 qty, uint256 num) = abi.decode(newMove.moveData,(uint256,uint256));
        if(newMove.moveType == LibSmartBet.Moves.FirstMove){
            return (qty >= 2 && num >= 2 && qty <= 12 && num <= 6);
        }
        (uint256 _qty, uint256 _num) = abi.decode(previousMove.moveData,(uint256,uint256));
        return(qty + num > _qty + _num && qty < 12 && num < 6);
        // return true;
    }
 
}

contract GameEngineTest {
    struct Move{
        bytes moveData;
        uint256 moveType;
        address player;
    }

    function checkIsValidMove(Move memory _move) external view returns (uint256, uint256) {
        (uint256 qty,uint256 number) = abi.decode(_move.moveData,(uint256,uint256));
        return (qty, number);
    }
    function getList(bytes memory combination) external view returns (uint256[] memory list) {
        (list) = abi.decode(combination,(uint256[]));
    }
    function getWinner(LibSmartBet.Combination[] memory combinations, LibSmartBet.Move memory move, address endCaller) external pure returns (address){
        (uint256[] memory combination1) = abi.decode(combinations[0].combinationData,(uint256[]));
        (uint256[] memory combination2) = abi.decode(combinations[1].combinationData,(uint256[]));
        address player1 = combinations[0].player;
        address player2 = combinations[1].player;
        (uint256 qty, uint256 num) = abi.decode(move.moveData,(uint256,uint256));
        uint256 _qty;
        for(uint256 i=0;i<combination1.length;i++){
            if(combination1[i]==num){
                _qty++;
            }
        }
        for(uint256 i=0;i<combination2.length;i++){
            if(combination2[i]==num){
                _qty++;
            }
        }
        if(_qty >= qty ){
            if(player1 == endCaller){
                return player2;
            }else{
                return player1;
            }
        }
        return endCaller;
    }
}