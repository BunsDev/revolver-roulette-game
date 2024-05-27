// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Revolver is VRFConsumerBaseV2Plus {

    event RequestFulfilled(uint256 indexed requestId, uint256[] randomWords);

    event RequestSent(address sender, uint256 indexed requestId);
    
    event Deposit(address indexed from, uint256 amount, bytes32 indexed sessionId);
    
    event Withdrawal(address indexed to, uint256 amount, bytes32 indexed sessionId);

    event GameCreated(address indexed player1, bytes32 indexed sessionId);

    IVRFCoordinatorV2Plus immutable COORDINATOR;
    IERC20 linkToken;

    uint256 immutable s_subscriptionId;

    bytes32 immutable s_keyHash;

    uint32 constant CALLBACK_GAS_LIMIT = 1000000;

    uint16 constant REQUEST_CONFIRMATIONS = 3;

    uint32 constant NUM_WORDS = 1;

    uint256[] public s_randomWords;
    uint256 public s_requestId;
    address s_owner;

    /* requestId --> requestStatus */
    mapping(uint256 => RequestStatus) public s_requests;

    struct RequestStatus {
        bool fulfilled; // whether the request has been successfully fulfilled
        bool exists; // whether a requestId exists
        uint256[] randomWords;
    }   

    struct GameSession {
        bytes32 sessionId; //unique game indentifier 
        address player1; //player1 creates the game
        address player2; //player2 joins the game
        address winner; //game is over when winner != address(0)
        address turn; //whose turn it is
        uint256 roundCount; //how many times the revolver has been passed
        address lastSpinner; //last user to make a VRF request
        uint256 wager; //wager required to join game
        uint256 pot; //total wagers on game
        uint256 timestamp; //last action
        uint256 turnTimer; //time before a game is considered abandoned

    }

    mapping(bytes32 => GameSession) public gameSessions;
    bytes32[] public sessionIds;
    //gamesession => address => wager
    mapping(bytes32 => mapping(address => uint256)) public wagers;

    constructor(
        uint256 subscriptionId,
        address vrfCoordinator,
        bytes32 keyHash,
        address _link
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        COORDINATOR = IVRFCoordinatorV2Plus(vrfCoordinator);
        s_keyHash = keyHash;
        s_owner = msg.sender;
        s_subscriptionId = subscriptionId;
        linkToken = IERC20(_link);

    }

    //must approve spending first via LINK contract
    //wager in juels, turn timer in seconds
    function createGame(uint256 wager, uint256 turnTimer) public returns (bytes32 sessionId) {
        sessionId = keccak256(abi.encodePacked(block.timestamp, msg.sender));
        sessionIds.push(sessionId);
        gameSessions[sessionId] = GameSession(
            sessionId,
            msg.sender,
            address(0),
            address(0),
            msg.sender,
            1,
            address(0),
            wager,
            0,
            0,
            turnTimer
            
        );

        if (wager > 0) {
            setWager(sessionId, wager);
        }

        emit GameCreated(msg.sender, sessionId);

        return sessionId;

    }
    //must approve spending first via LINK contract
    function joinGame(bytes32 sessionId) public {
        GameSession memory gs = gameSessions[sessionId];
        require(gs.player2 == address(0), "game session is full!");

        gameSessions[sessionId].player2 = msg.sender;
        if (gs.wager > 0) {
            setWager(sessionId, gs.wager);
        }
        
    }


    //wager LINK tokens on game
    //must approve spending first via LINK contract
    function setWager(bytes32 sessionId, uint256 value) public {

        GameSession memory gs = gameSessions[sessionId];
        require(gs.lastSpinner == address(0), "game already started!");
        require(msg.sender == gs.player1 || msg.sender == gs.player2, "you're not a participant of this game!");

        require(linkToken.transferFrom(msg.sender, address(this), value), "deposit failed!");
        wagers[sessionId][msg.sender] += value;
        gameSessions[sessionId].pot += value;

        emit Deposit(msg.sender, value, sessionId);
        
    }

    //can only be called before a game has started
    function withdrawWager(bytes32 sessionId) public {
        GameSession memory gs = gameSessions[sessionId];
        require(msg.sender == gs.player1 || msg.sender == gs.player2, "you're not a player in this game!");
        require(gs.lastSpinner == address(0), "game has started!");
        
        require(linkToken.transfer(msg.sender, gs.wager), "withdraw failed!");


    }

    //can only be called by winner
    function withdrawPot(bytes32 sessionId) public  {
        GameSession memory gs = gameSessions[sessionId];

        require(msg.sender == gs.winner, "only the winner can withdraw!");
        require(gs.pot > 0, "no balance to withdraw!");

        uint256 withdrawAmount = gs.pot;
        gameSessions[sessionId].pot = 0;
        require(linkToken.transfer(msg.sender, withdrawAmount), "withdraw failed!");

        emit Withdrawal(msg.sender, withdrawAmount, sessionId);

        
    }

    //called in case a player abandons the game
    //player with a pending turn is declared loser
    function abortGame(bytes32 sessionId) public {
        GameSession memory gs = gameSessions[sessionId];
        require(msg.sender == gs.player1 || msg.sender == gs.player2, "you're not a player in this game!");
        require(block.timestamp >= gs.timestamp - gs.turnTimer, "still within turn timer");

        if (gs.turn == gs.player1) {
            gameSessions[sessionId].winner = gs.player2;
        } else {
            gameSessions[sessionId].winner = gs.player1;
        }
    }

    //get random number from VRF
    function spinCylinder(bytes32 sessionId) public returns (uint256 requestId){
        
        GameSession memory gs = gameSessions[sessionId];
        require(gs.player1 != address(0) && gs.player2 != address(0), "session does not have two players!");
        require(gs.winner == address(0), "game over!");
        require(msg.sender == gs.turn, "not your turn!");
        require(msg.sender != gs.lastSpinner, "you've already spun the cylinder!");
        require(wagers[sessionId][gs.player1] == wagers[sessionId][gs.player2], "wagers must be of equivalent value!");

        requestId = requestRandomWords();
        gameSessions[sessionId].lastSpinner = msg.sender;
        gameSessions[sessionId].timestamp = block.timestamp;

        emit RequestSent(msg.sender, requestId);

        return requestId;

    }

    function fireRevolver(bytes32 sessionId, uint256 requestId) public {
        GameSession memory gs = gameSessions[sessionId];
        RequestStatus memory request = s_requests[requestId];

        require(gs.lastSpinner == msg.sender, "not your turn to fire!");
        require(request.fulfilled, "VRF request not fulfilled!");

        uint256 randomNumber = request.randomWords[0] % 6;

        //if bullet is fired
        if (randomNumber == 3) {
            if (msg.sender == gs.player1) {
            //if player 1 -> winner player 2
            gameSessions[sessionId].winner = gs.player2;
            } else {
            //if player 2 -> winner player 1
            gameSessions[sessionId].winner = gs.player1;
            }
            return;
        }


        //change turns
        if (msg.sender == gs.player1) {
        gameSessions[sessionId].turn = gs.player2;
        } else {
        gameSessions[sessionId].turn = gs.player1;
        }
        gameSessions[sessionId].roundCount++;

        gameSessions[sessionId].timestamp = block.timestamp;

    }


    function requestRandomWords() public returns (uint256 requestId) {

        requestId = COORDINATOR.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
            keyHash: s_keyHash,
            subId: s_subscriptionId,
            requestConfirmations: REQUEST_CONFIRMATIONS,
            callbackGasLimit: CALLBACK_GAS_LIMIT,
            numWords: NUM_WORDS,
            extraArgs: VRFV2PlusClient._argsToBytes(
                VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
            )
            })

        );

        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });

        return requestId;
    }


    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords)
        internal
        override
    {
        s_requests[requestId].fulfilled = true;
        s_requests[requestId].randomWords = randomWords;


        emit RequestFulfilled(requestId,randomWords);
    }


}