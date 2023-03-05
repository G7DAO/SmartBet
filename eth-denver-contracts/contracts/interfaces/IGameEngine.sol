pragma solidity ^0.8.0;

import {LibSmartBet} from "../libraries/LibSmartBet.sol";
interface IGameEngine {
    function checkIsValidMove(LibSmartBet.Move memory,LibSmartBet.Move memory) external view returns (bool);
    function checkIsFinalMove(LibSmartBet.Move memory) external view returns (bool);
    function getWinner(LibSmartBet.Combination[] memory, LibSmartBet.Move memory, address) external view returns (address);
}