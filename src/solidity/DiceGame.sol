//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DiceGameERC1155 is ERC1155URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenId;

    uint256 public MST;
    uint256 private MSTSupply = 1000000;
    uint256 public amountFaucet = 20000;
    uint256 public _totalNFT = 0;
    uint256 public gameId;
    uint256 public lastGameId;

    mapping(string => uint256) public tokenIds;
    mapping(uint256 => Game) public games;
    mapping(address => uint256) public lockTime;

    event Result(
        uint256 id,
        string bet,
        uint256 amount,
        address player,
        bool resultBet,
        bool specialReward,
        uint256 time
    );
    event receivemoney(
        string textCode,
        address playerReceive,
        uint256 amountFaucet
    );
    event ExChange(
        uint256[] id,
        uint256[] amount,
        bool resultExchange,
        uint256 money
    );

    struct Game {
        uint256 id;
        string bet;
        bool resultBet;
        uint256 amount;
        bool specialReward;
        address payable player;
    }

    constructor() ERC1155("") {
        MST = _tokenId.current();
        _setURI(
            MST,
            "https://ipfs.io/ipfs/bafkreiaekze3pd5ewhmoqjoeupr3syflqpfbsxgxhgouh23qbvtwu6z764"
        );
        _mint(msg.sender, MST, MSTSupply, "");
        mintToken(
            1000,
            "bafkreigvnzecjm6e4ulawr72jxixr27og2a55t4ertrzcg2yt25if733au"
        );
        mintToken(
            1000,
            "bafkreia5use54hn4d6narqpvmvotlajm2jq6aehfpjqhy252s7usbzpgle"
        );
        mintToken(
            1000,
            "bafkreigoxekcv7elyovbzo6wjad4jfprsksjk3v42l2fidbptdwebf6f6m"
        );
    }

    function mintToken(
        uint256 amount,
        string memory tokenCID
    ) public onlyOwner returns (bool) {
        _tokenId.increment();
        _totalNFT++;

        _setURI(
            _tokenId.current(),
            string(abi.encodePacked("https://ipfs.io/ipfs/", tokenCID))
        );
        _mint(msg.sender, _tokenId.current(), amount, "");

        return true;
    }

    function specialCaculateReward(
        uint256 valueReward,
        uint256 betValue
    ) public pure returns (uint256) {
        if (valueReward != 0) {
            return (betValue + ((betValue * (valueReward * 100)) / 10000));
        } else {
            return betValue;
        }
    }

    function game(
        uint256 reward,
        string memory bet,
        uint256 betValue,
        uint256 random,
        uint256 tokenId
    ) external payable returns (bool) {
        // Required to start game
        require(betValue >= 1, "Error, you must bet higher or equal 1");
        require(
            keccak256(bytes(bet)) == keccak256("HIGH") ||
                keccak256(bytes(bet)) == keccak256("LOW"),
            "Error, only accept HIGH or LOW"
        );
        require(
            balanceOf(msg.sender, MST) > betValue,
            "Error, your balances must higher than your bet value"
        );

        // Each bet has unique id
        games[gameId] = Game(
            gameId,
            bet,
            false,
            betValue,
            false,
            payable(msg.sender)
        );

        // Increase gameId for the next bet
        gameId = gameId + 1;

        // Check bets from latest betting round,  one by one
        for (uint256 i = lastGameId; i < gameId; i++) {
            if (random < 11) {
                if (keccak256(bytes(bet)) == keccak256("LOW")) {
                    if (random == 3) {
                        games[i].resultBet = true;
                        games[i].specialReward = true;
                        games[i].amount = specialCaculateReward(
                            reward,
                            betValue
                        );
                        _safeTransferFrom(
                            owner(),
                            msg.sender,
                            MST,
                            specialCaculateReward(reward, betValue),
                            ""
                        );
                        _safeTransferFrom(owner(), msg.sender, tokenId, 1, "");
                    } else {
                        if (reward != 0) {
                            games[i].resultBet = true;
                            games[i].specialReward = true;
                            games[i].amount = specialCaculateReward(
                                reward,
                                betValue
                            );
                            _safeTransferFrom(
                                owner(),
                                msg.sender,
                                MST,
                                specialCaculateReward(reward, betValue),
                                ""
                            );
                        } else {
                            games[i].resultBet = true;
                            games[i].specialReward = false;
                            games[i].amount = betValue * 2;
                            _safeTransferFrom(
                                owner(),
                                msg.sender,
                                MST,
                                specialCaculateReward(reward, betValue),
                                ""
                            );
                        }
                    }
                } else {
                    games[i].resultBet = false;
                    games[i].specialReward = false;
                    _safeTransferFrom(msg.sender, owner(), MST, betValue, "");
                    games[i].amount = betValue;
                }
            } else {
                if (keccak256(bytes(bet)) == keccak256("HIGH")) {
                    if (random == 18) {
                        games[i].resultBet = true;
                        games[i].specialReward = true;
                        games[i].amount = specialCaculateReward(
                            reward,
                            betValue
                        );
                        _safeTransferFrom(
                            owner(),
                            msg.sender,
                            MST,
                            specialCaculateReward(reward, betValue),
                            ""
                        );
                        _safeTransferFrom(owner(), msg.sender, tokenId, 1, "");
                    } else {
                        if (reward != 0) {
                            games[i].resultBet = true;
                            games[i].specialReward = true;
                            games[i].amount = specialCaculateReward(
                                reward,
                                betValue
                            );
                            _safeTransferFrom(
                                owner(),
                                msg.sender,
                                MST,
                                specialCaculateReward(reward, betValue),
                                ""
                            );
                        } else {
                            games[i].resultBet = true;
                            games[i].specialReward = false;
                            games[i].amount = betValue * 2;
                            _safeTransferFrom(
                                owner(),
                                msg.sender,
                                MST,
                                specialCaculateReward(reward, betValue),
                                ""
                            );
                        }
                    }
                } else {
                    games[i].resultBet = false;
                    games[i].specialReward = false;
                    _safeTransferFrom(msg.sender, owner(), MST, betValue, "");
                    games[i].amount = betValue;
                }
            }
            emit Result(
                games[i].id,
                games[i].bet,
                games[i].amount,
                games[i].player,
                games[i].resultBet,
                games[i].specialReward,
                block.timestamp
            );
        }
        lastGameId = gameId;

        return true;
    }

    function withdrawToken(
        uint256[] memory _id,
        uint256[] memory amount,
        uint256[] memory _value
    ) external {
        require(msg.sender != owner());
        require(amount.length > 0, "Error amount");
        uint256 money = 0;
        uint sumMoney = 0;
        for (uint256 i = 0; i < _id.length; i++) {
            _safeTransferFrom(
                owner(),
                msg.sender,
                MST,
                _value[i] * amount[i],
                ""
            );
            money = _value[i] * amount[i];
            sumMoney += money;
        }
        _safeBatchTransferFrom(msg.sender, owner(), _id, amount, "");
        emit ExChange(_id, amount, true, sumMoney);
    }

    function receiveMoney(
        string memory textCode,
        address playerReceive
    ) external returns (bool) {
        // priority code
        if (keccak256(bytes(textCode)) == keccak256("code123")) {
            _safeTransferFrom(owner(), msg.sender, MST, amountFaucet, "");
        } else {
            require(
                keccak256(bytes(textCode)) == keccak256("code"),
                "wrong token"
            );
            require(
                block.timestamp > lockTime[playerReceive],
                "lock time has not expired"
            );
            lockTime[playerReceive] = block.timestamp + 1 days;

            _safeTransferFrom(owner(), msg.sender, MST, amountFaucet, "");
        }
        emit receivemoney(textCode, playerReceive, amountFaucet);
        return true;
    }

    function isOwner() public view returns (bool) {
        if (owner() == msg.sender) {
            return true;
        } else {
            return false;
        }
    }
}
