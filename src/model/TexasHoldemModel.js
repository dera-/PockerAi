import PlayerBrain from './PlayerBrain';
import Dealer from './Dealer';
import Board from './Board';
import CardsFactory from '../factory/CardsFactory';
import {ALLIN, RAISE, CALL, CHECK, FOLD, NONE} from '../const/ActionName';
import {NEXT, END, SHOWDOWN} from '../const/GameState';
import {PRE_FLOP, FLOP, TURN, RIVER} from '../const/ActionPhase';
import RankUtil from '../util/RankUtil';

const HAND_CARDS_NUM = 2;
const FROP_CARDS_NUM = 3;
const NON_EXIST_PLAYER_INDEX = -1;

export default class TexasHoldemModel {
  constructor(playerBrains, initialBigBlind) {
    this.playerBrains = playerBrains;
    this.dealer = new Dealer((new CardsFactory()).generate());
    this.board = new Board();

    this.bigBlind = initialBigBlind;
    this.utgIndex = 0;
  }

  /**
   * ゲームが終了したかどうかの判定
   */
  isFinished() {
    return this.playerBrains.length <= 1;
  }

  /**
   * スタックが0になったプレイヤーをゲーム内から除外する処理
   * TODO: ヘッズアップならこれでいいけど、３人以上のゲームだと次にアクションが始まる位置がおかしなことになるので要修正
   */
  deleteDeadPlayer() {
    this.playerBrains = this.playerBrains.filter((brain) => {
      return brain.getPlayer().isAlive();
    });
  }

  isExistPlayer(id) {
    return this.playerBrains.some(brain => id === brain.getPlayer().id);
  }

  dealCards() {
    let playerNum = this.playerBrains.length;
    this.resetPlayersAction();
    this.board.clear();
    this.dealer.shuffleCards();
    this.utgIndex = (this.utgIndex + 1) % this.playerBrains.length;
    if (playerNum === 2) {
      this.playerBrains[(this.utgIndex + playerNum - 1) % playerNum].setAction(NONE, this.bigBlind);
      this.playerBrains[this.utgIndex].setAction(NONE, this.bigBlind/2);
    } else {
      this.playerBrains[(this.utgIndex + playerNum - 2) % playerNum].setAction(NONE, this.bigBlind);
      this.playerBrains[(this.utgIndex + playerNum - 1) % playerNum].setAction(NONE, this.bigBlind/2);
    }

    // 変な配り方しているけど、ロジック部分なので。。
    this.playerBrains.forEach((brain)=>{
      for (let i = 0; i < HAND_CARDS_NUM; i++) {
        let cards = [this.dealer.getNextCard(), this.dealer.getNextCard()];
        brain.getPlayer().setCards(cards);
      }
      //brain.getPlayer().printStack();
      //brain.getPlayer().printHand();
    });
  }

  actionPhase(actionPhase) {
    let playerNum = this.playerBrains.length,
      currentCallValue = 0,
      originalRaiserIndex = NON_EXIST_PLAYER_INDEX,
      initialPlayerIndex,
      currentPlayerIndex;
    if (actionPhase === PRE_FLOP) {
      initialPlayerIndex = this.utgIndex;
      currentCallValue = this.bigBlind;
    } else if (playerNum === 2) {
      initialPlayerIndex = ((this.utgIndex + playerNum - 1) % playerNum);
    } else {
      initialPlayerIndex = ((this.utgIndex + playerNum - 2) % playerNum);
    }
    currentPlayerIndex = initialPlayerIndex;
    while ((currentPlayerIndex = this.searchNextPlayerIndex(currentPlayerIndex, originalRaiserIndex, currentCallValue)) !== NON_EXIST_PLAYER_INDEX) {
      let brain = this.playerBrains[currentPlayerIndex],
        currentPlayerAction,
        survivor;
      brain.decideAction(actionPhase, this.playerBrains[(currentPlayerIndex + 1) % playerNum], this.board, currentCallValue);
      // 1人以外全員フォールドしたかどうか
      survivor = this.getOneSurvivor();
      if (survivor !== null) {
        this.collectChipsToPod();
        return END;
      }
      // オリジナルレイザーが変わった場合
      currentPlayerAction = brain.getAction();
      if (currentPlayerAction.name === RAISE || (currentPlayerAction.name === ALLIN && currentPlayerAction.value > currentCallValue)) {
        originalRaiserIndex = currentPlayerIndex;
        currentCallValue = currentPlayerAction.value;
      }
      //console.log(currentPlayerIndex+":"+brain.getAction().name);
      // 最後までCHECKで回ったかどうか
      if (currentPlayerIndex === ((initialPlayerIndex + playerNum - 1) % playerNum) && brain.getAction().name === CHECK) {
        break;
      }
      currentPlayerIndex = (currentPlayerIndex + 1) % playerNum;
    }
    this.collectChipsToPod();
    // コンソール表示
    //this.playerBrains.forEach((brain)=>{brain.printAction()});
    return this.isExistMultiActivePlayers() ? NEXT : SHOWDOWN;
  }

  searchNextPlayerIndex(initialPlayerIndex, originalRaiserIndex, currentCallValue) {
    let playerNum = this.playerBrains.length;
    for (let i = 0; i < playerNum; i++) {
      let currentPlayerIndex = (initialPlayerIndex + i) % playerNum,
        currentPlayerAction = this.playerBrains[currentPlayerIndex].getAction(),
        player = this.playerBrains[currentPlayerIndex].getPlayer();
      // オリジナルレイザーまで回ってきたら終了
      if (currentPlayerIndex === originalRaiserIndex) {
        return NON_EXIST_PLAYER_INDEX;
      }
      if (false === player.isActive()) {
        continue;
      }
      if (
        currentPlayerAction === null || currentPlayerAction.name === NONE ||
        (currentPlayerAction.name !== ALLIN && currentPlayerAction.name !== FOLD && currentPlayerAction.value < currentCallValue)
      ) {
        return currentPlayerIndex;
      }
    }
    return NON_EXIST_PLAYER_INDEX;
  }

  getOneSurvivor() {
    let survivors = this.playerBrains.filter((brain)=>{
      let action = brain.getAction();
      return action === null || action.name !== FOLD;
    });
    return (survivors.length === 1) ? survivors[0] : null;
  }

  isExistMultiActivePlayers() {
    let players = this.playerBrains.filter((brain)=>{
      let action = brain.getAction();
      return (action === null || (action.name !== FOLD && action.name !== ALLIN));
    });
    return players.length >= 2;
  }

  collectChipsToPod() {
    this.playerBrains.forEach((brain)=>{
      let action = brain.getAction(),
        player = brain.getPlayer(),
        value = action === null ? 0 : action.value;
      this.board.addChip(player.id, value);
      player.pay(value);
      if (action !== null && action.name === FOLD) {
        player.clear();
      }
    });
  }

  /**
   * フロップ時にカードをオープン
   */
  startFrop() {
    // とりあえず、バーンカードは無しで。。
    for (let i = 0; i < FROP_CARDS_NUM; i++) {
      this.board.setCard(this.dealer.getNextCard());
    }
  }

  /**
   * ターン、リバー時にカードをオープン
   */
  openCard() {
    this.board.setCard(this.dealer.getNextCard());
  }

  getWinners() {
    let boardCards = this.board.getOpenedCards(),
      bestRank = RankUtil.getWeakestRank(),
      candidates = this.playerBrains.filter(brain => brain.getPlayer().hasHand()),
      winners = [];
    //console.log(boardCards);
    candidates.forEach((brain)=>{
      let rank = brain.getPlayer().getRank(boardCards);
      //console.log(brain.getPlayer());
      //console.log(rank);
      let comparedResult = RankUtil.compareRanks(rank, bestRank);
      if (comparedResult === 1) {
        bestRank = rank;
        winners = [brain];
      } else if (comparedResult === 0) {
        winners.push(brain);
      }
    });
    return winners;
  }

  getChipsInPod() {
    return this.board.getPotValue();
  }

  sharePodToWinners(winnerBrains) {
    let ids = winnerBrains.map(brain => brain.getPlayer().id),
      pots;
    if (winnerBrains.length === 1) {
      pots = this.board.getPotForOne(ids[0]);
    } else {
      pots = this.board.getPotForMulti(ids);
    }
    pots.forEach((pot) => {
      //console.log(pot);
      this.getPlayer(pot.id).addStack(pot.chip);
    });
  }

  getPlayer(id) {
    let brains = this.playerBrains.filter(brain => id === brain.getPlayer().id);
    return brains[0].getPlayer();
  }

  resetPlayersAction(){
    this.playerBrains.forEach((brain) => {
      brain.resetAction();
    });
  }

  isWin(playerHand, targetHand) {
    let boardCards = this.board.getOpenedCards();
    return RankUtil.compareRanks(RankUtil.getRank(playerHand, boardCards), RankUtil.getRank(targetHand, boardCards)) !== -1;
  }
}
