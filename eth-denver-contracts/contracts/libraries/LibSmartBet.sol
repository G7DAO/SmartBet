pragma solidity ^0.8.17;

library LibSmartBet {

    // customisable
    enum Moves{
        PlayMove, //  a normal move
        FinalMove, // a move that calls the checker
        FirstMove //  a first move ( skips some checkers )
    }
    bytes32 constant STORAGE_POSITION = keccak256("g7dao.eth.storage.SmartBet");
    

    struct Game {
        address tokenAddr; // address of the 1155 to mint to the winner
        uint256 validUntil; // deadline for members of the DAO to play the game
        uint256[] rules; // list of rules the game is based on
        string cid; // CID of the ipfs proposal we want to share
    }
    struct Combination {
        address player; // the playet to whom this combination belongs
        bytes combinationData;  // combination data is customizable i.e. (uint256[])
    }
    struct Session {
        address[] players; // list of players in the session
        bytes32[] combinationHashes; // list of inital combinations
        uint256 turnOf; //index of the player who plays now
        bool canPlay; //whether the game can be started
        uint256 gameId; // id of the game this is playing for 
        bool finalStep; // whether this is the final step , will require you to submit combinations 
        bool isActive; // will be inactive after the session was closed
        address winner; // the winner of the closed session
        uint256 moveCount;
    }
    struct Move {
        bytes moveData; // move data is customizable i.e. (uint256, uint256)
        Moves moveType; // type of the move
        address player; // player that executes a move
    }
    struct SmartBetStorage {
        address movesRegistry; // contract containing a list of declared / available moves
        address gameEngine; // contract containing the logic to choose the winner of the game
        uint256 gameCount; // keeps track of the number of games
        uint256 sessionCount; // keeps track of the number of sessions

        //      gameId             addr      yes/no
        mapping(uint256 => mapping(address => bool)) hasPlayedGame; // tracks weather a player has played the game

        //      sessionId   CombinationData
        mapping(uint256 => Combination[]) combinationBook; // combinations of the players of each session

        //      gameId     gameData
        mapping(uint256 => Game) gameBook; // list of games in the contract

        //      sessionId    SessionData 
        mapping(uint256  => Session) sessionBook; // list of sessions in the contract

        //      sessionId  Move
        mapping(uint256 => Move) sessionCurrMove; // tracks the current move of a session
    }

    function smartBetStorage()
        internal
        pure
        returns (SmartBetStorage storage ds)
    {
        bytes32 position = STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }
}