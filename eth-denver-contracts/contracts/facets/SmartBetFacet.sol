pragma solidity ^0.8.17;

import {LibSmartBet} from "../libraries/LibSmartBet.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import {IMockERC1155} from "../interfaces/IMockERC1155.sol";
import {IGameEngine} from "../interfaces/IGameEngine.sol";

/**
 * @title SmartFacet Smart Contract
 * @author Carlos Ramos
 * @notice Development in progress - can contribute to the repo https://github.com/jrcarlos2000/eth-denver-contracts
 * @dev contract needs to check weather the caller is a member of the DAO - need to add terminus 
 */

contract SmartBetFacet {

    uint256 constant MIN_TIME = 3 days; // minimun duration of a game

    /**
     * @notice Emitted when Game is opened by the owner
     * @param gameId - the index of the new game
     * @param  gameData - data of the new game created
     */
    event GameOpened(uint256 gameId, LibSmartBet.Game gameData);

    /**
     * @notice Emitted when a new session is created
     * @param sessionId - the index of the new session
     * @param sessionData - data of the session, data contains weather a session can be started
     * @param player - the one who opened the session
     */
    event SessionOpened(uint256 sessionId, LibSmartBet.Session sessionData, address player);

    /**
     * @notice Emitted when a user joins a session
     * @param sessionId - the index of the session
     * @param sessionData - data of the session
     * @param player - the one who joins the session
     */
    event SessionJoined(uint256 sessionId, LibSmartBet.Session sessionData, address player);

    /**
     * @notice Emitted when a move is submitted
     * @param sessionId - the index of the session
     * @param moveData - data of the session
     * @param player - the one who submits the move
     * @param isFinalMove - weather will require you to submit combination
     */
    event MoveSubmitted(uint256 sessionId, LibSmartBet.Move moveData, address player, bool isFinalMove);

    /**
     * @notice Emitted when combination is submitted
     * @param sessionId - index of the session
     * @param player - the one owner of the combination
     * @param combination - the combination submitted
     */
    event CombinationSumitted(uint256 sessionId, address player, bytes combination);

    /**
     * @notice Emitted when session finishes
     * @param sessionId - index of the session
     * @param winner - the winner of the game
     */
    event SessionEnded(uint256 sessionId, address winner);

    function _onlyOwner() internal view {
        require(LibDiamond.contractOwner() == msg.sender, "SmartBetFacet : Function can only be called by owner");
    }

    modifier isActiveSession(uint256 sessionId) {
        require(LibSmartBet.smartBetStorage().sessionBook[sessionId].isActive,"SmartBetFacet : Session not active");
        _;
    }

    modifier canMakeMove(uint256 sessionId) {
        LibSmartBet.Session memory session = LibSmartBet.smartBetStorage().sessionBook[sessionId];
        require(session.players[session.turnOf] == msg.sender, "not turn of the sender");
        require(session.canPlay, "session hasnt started");
        _;
    }

    /**
     * @notice owner creates a new game
     * @param _tokenAddr - the address of the 1155 to give after completing this game
     * @param _validUntil - the deadline to play this game
     * @param _rules - the set of rules that the game has to follow
     * @param cid - the pdf stored in ipfs
     */
    function openGame(address _tokenAddr, uint256 _validUntil, uint256[] calldata _rules, string calldata cid) external {
        require(block.timestamp + MIN_TIME < _validUntil, "SmartBet : End time is too soon");
        LibSmartBet.Game memory newGame = LibSmartBet.Game({
            tokenAddr : _tokenAddr,
            validUntil : _validUntil,
            rules : _rules,
            cid : cid
        });
        LibSmartBet.SmartBetStorage storage ds = LibSmartBet.smartBetStorage();
        ds.gameCount ++;
        ds.gameBook[ds.gameCount] = newGame;
        emit GameOpened(ds.gameCount,newGame);
    }

    /**
     * @notice creates a session for the a given game
     * @param gameId - the index of the game to open a session for
     * @param combinationHash - the combination hash of the first player
     */
    function openSession(uint256 gameId, bytes32 combinationHash) external {
        LibSmartBet.SmartBetStorage storage ds = LibSmartBet.smartBetStorage();
        ds.hasPlayedGame[gameId][msg.sender] = true;
        address[] memory players;        
        bytes32[] memory combinationHashes;
        ds.sessionCount ++;
        ds.sessionBook[ds.sessionCount] = LibSmartBet.Session({
            players : players,
            combinationHashes : combinationHashes,
            turnOf : 0,
            canPlay : false,
            gameId : gameId,
            finalStep : false,
            isActive : true,
            winner : address(0),
            moveCount : 0
        });
        ds.sessionBook[ds.sessionCount].players.push(msg.sender);
        ds.sessionBook[ds.sessionCount].combinationHashes.push(combinationHash);
        emit SessionOpened(ds.sessionCount,ds.sessionBook[ds.sessionCount],msg.sender);
    }   
    /**
     * @notice joins a session that is already existing and pending
     * @param sessionId - the index of the session
     * @param combinationHash - the combination hash of the player who joins this session
     */
    //TODO : check if the user is already in the session
    function joinSession(uint256 sessionId, bytes32 combinationHash) external {
        LibSmartBet.SmartBetStorage storage ds = LibSmartBet.smartBetStorage();
        ds.sessionBook[sessionId].players.push(msg.sender);
        ds.sessionBook[ds.sessionCount].combinationHashes.push(combinationHash);
        ds.hasPlayedGame[ds.sessionBook[sessionId].gameId][msg.sender] = true;
        ds.sessionBook[sessionId].canPlay = true;
        //TODO RANDOM NUMBER to choose who starts
        emit SessionJoined(sessionId, ds.sessionBook[sessionId], msg.sender);
    }

    /**
     * @notice submits a move for the ongoing session
     *         only if is the turn of the caller
     * @param _move - the data of the move being submitted
     * @param sessionId - the index of the session
     */
    function submitMove(LibSmartBet.Move memory _move, uint256 sessionId) external canMakeMove(sessionId) {
        LibSmartBet.SmartBetStorage storage ds = LibSmartBet.smartBetStorage();
        IGameEngine gameEngine = IGameEngine(ds.gameEngine);
        require(gameEngine.checkIsValidMove(ds.sessionCurrMove[sessionId],_move),"SmartBet : Move not valid");
        ds.sessionBook[sessionId].turnOf = ~ds.sessionBook[sessionId].turnOf & 0x1;
        ds.sessionBook[sessionId].moveCount++;
        bool isFinalMove = gameEngine.checkIsFinalMove(_move);
        if(isFinalMove) {
            ds.sessionBook[sessionId].finalStep = true;
            ds.sessionBook[sessionId].canPlay = false;
        }else {
            ds.sessionCurrMove[sessionId] = _move;
        }
        ds.sessionCurrMove[sessionId].player = msg.sender;

        emit MoveSubmitted(sessionId, ds.sessionCurrMove[sessionId], msg.sender, isFinalMove);
    }

    /**
     * @dev submits a combination to be verified with the initial hashed combination
     * @param sessionId - the index of the session
     * @param key - the key the user used to submit when joined the game
     * @param combination - the combination submitted when joined the game
     */
    function submitCombitation(uint256 sessionId, string memory key, bytes memory combination) external {
        LibSmartBet.SmartBetStorage storage ds = LibSmartBet.smartBetStorage();
        require(ds.sessionBook[sessionId].finalStep,"SmartBet : havent reached the final step");
        bytes32 combinationHash = keccak256(abi.encodePacked(key,combination));
        // TODO : improve using mapping
        uint256 index;
        for(uint256 i;i<ds.sessionBook[sessionId].players.length;i++){
            if(ds.sessionBook[sessionId].players[i] == msg.sender){
                index = i;
            }
        }
        require(ds.sessionBook[sessionId].combinationHashes[index] == combinationHash, "SmartBet : Combination and key dont match");
        ds.combinationBook[sessionId].push(LibSmartBet.Combination(msg.sender,combination));
        emit CombinationSumitted(sessionId, msg.sender, combination);
        // check if combinations are met 
        if(ds.sessionBook[sessionId].players.length == ds.combinationBook[sessionId].length){
            _endSession(sessionId, ds.combinationBook[sessionId], ds.sessionCurrMove[sessionId].player,ds.sessionCurrMove[sessionId]);
        }
    }

    /**
     * @dev Finalizes session after all combinations have been submitted
     * @param sessionId - the index of the session
     * @param combinations - the list of combinations of this game
     * @param endCaller - the user who claims the previous move/state ends the game
     * @param lastMove - the previous/last move/state
     */
    function _endSession(uint256 sessionId,LibSmartBet.Combination[] memory combinations, address endCaller, LibSmartBet.Move memory lastMove ) internal {
        LibSmartBet.SmartBetStorage storage ds = LibSmartBet.smartBetStorage();
        ds.sessionBook[sessionId].isActive = false;
        address winner = IGameEngine(ds.gameEngine).getWinner(combinations,lastMove,endCaller);
        ds.sessionBook[sessionId].winner = winner;
        IMockERC1155(ds.gameBook[ds.sessionBook[sessionId].gameId].tokenAddr).mint(winner,0,1,"0x0");
        emit SessionEnded(sessionId, winner);
    }

    /**
     * @dev Owner can set the game engine Addr
     * @param gameEngineAddr - 
     */
    function setGameEngine(address gameEngineAddr) external {
        _onlyOwner();
        LibSmartBet.smartBetStorage().gameEngine = gameEngineAddr;
    }
    function getGameEngine() external view returns (address) {
        return LibSmartBet.smartBetStorage().gameEngine;
    }
    function getGameInfo (uint256 gameId) public view returns (LibSmartBet.Game memory){
        return LibSmartBet.smartBetStorage().gameBook[gameId];
    }

    //delete function
    function compare(bytes32 _inputHash, string memory key, uint256[] calldata combination) external pure returns (bool){
        bytes32 hash = keccak256(abi.encodePacked(key,combination));
        return(hash == _inputHash);
    }
    function getSessionInfo(uint256 sessionId) public view returns(LibSmartBet.Session memory session, LibSmartBet.Combination[] memory combinations, LibSmartBet.Move memory currMove){
        LibSmartBet.SmartBetStorage storage ds = LibSmartBet.smartBetStorage();
        session = ds.sessionBook[sessionId];
        combinations = ds.combinationBook[sessionId];
        currMove = ds.sessionCurrMove[sessionId];
    }
    function getAllSessionsInfo() external view returns (LibSmartBet.Session[] memory sessions){
        LibSmartBet.SmartBetStorage storage ds = LibSmartBet.smartBetStorage();
        sessions = new LibSmartBet.Session[](ds.sessionCount);
        for(uint256 i=1; i<=ds.sessionCount; i++){
            (sessions[i-1],,) = getSessionInfo(i);
        }
    }
    function getAllGamesInfo() external view returns (LibSmartBet.Game[] memory games){
        LibSmartBet.SmartBetStorage storage ds = LibSmartBet.smartBetStorage();
        games = new LibSmartBet.Game[](ds.gameCount);
        for(uint256 i=1; i<=ds.gameCount; i++){
            games[i-1] = getGameInfo(i);
        }
    }
}