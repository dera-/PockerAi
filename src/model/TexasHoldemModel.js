import PlayerBrain from './PlayerBrain';
import Dealer from './Dealer';
import Board from './Board';
import CardsFactory from '../factory/CardsFactory';
import {ALLIN, RAISE, CALL, CHECK, FOLD, NONE} from '../const/ActionName';
import {NEXT, END, SHOWDOWN} from '../const/GameState';

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

    this.currentActoinIndex = this.utgIndex;
    this.originalRaiserIndex = NON_EXIST_PLAYER_INDEX;
    this.currentCallValue = initialBigBlind;
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
    this.playerBrains = this.playerBrains.filter((brain)=>{
      return brain.getPlayer().isAlive();
    });
  }

  dealCards() {
    let playerNum = this.playerBrains.length;
    this.resetPlayersAction();
    this.board.clear();
    this.dealer.shuffleCards();
    this.currentCallValue = this.bigBlind;
    this.originalRaiserIndex = NON_EXIST_PLAYER_INDEX;
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
        brain.getPlayer().setCard(this.dealer.getNextCard());
      }
      brain.getPlayer().printStack();
      brain.getPlayer().printHand();
    });
    console.log('utgはid'+(this.utgIndex+1));
  }

  actionPhase(isPreFrop) {
    let playerNum = this.playerBrains.length,
      currentPlayerIndex;
    this.originalRaiserIndex = NON_EXIST_PLAYER_INDEX;
    this.currentCallValue = 0;
    if (isPreFrop) {
      this.currentActoinIndex = this.utgIndex;
      this.currentCallValue = this.bigBlind;
    } else if (playerNum === 2) {
      this.currentActoinIndex = ((this.utgIndex + playerNum - 1) % playerNum);
    } else {
      this.currentActoinIndex = ((this.utgIndex + playerNum - 2) % playerNum);
    }
    console.log('アクションはid'+(this.currentActoinIndex+1)+'からスタート');
    while ((currentPlayerIndex = this.searchNextPlayerIndex()) !== NON_EXIST_PLAYER_INDEX) {
      let brain = this.playerBrains[currentPlayerIndex],
        currentPlayerAction,
        survivor;
      brain.decideAction(this.currentCallValue);
      // 1人以外全員フォールドしたかどうか
      survivor = this.getOneSurvivor();
      if (survivor !== null) {
        this.collectChipsToPod();
        return END;
      }
      // オリジナルレイザーが変わった場合
      currentPlayerAction = brain.getAction();
      if (currentPlayerAction.name === RAISE || (currentPlayerAction.name === ALLIN && currentPlayerAction.value > this.currentCallValue)) {
        this.originalRaiserIndex = currentPlayerIndex;
        this.currentCallValue = currentPlayerAction.value;
      }
      // BBがCHECKしたかどうか
      // TODO: BBがCHECKしただけで次フェーズに移るようになってしまっているので直す
      if (currentPlayerIndex === ((this.utgIndex + playerNum - 1) % playerNum) && brain.getAction().name === CHECK) {
        break;
      }
      this.currentActoinIndex = (currentPlayerIndex + 1) % playerNum;
    }
    this.collectChipsToPod();
    // コンソール表示
    this.playerBrains.forEach((brain)=>{brain.printAction()});
    return this.isExistActivePlayer() ? NEXT : SHOWDOWN;
  }

  searchNextPlayerIndex() {
    let playerNum = this.playerBrains.length,
      initialPlayerIndex = this.currentActoinIndex;

    for (let i = 0; i < playerNum; i++) {
      let currentPlayerIndex = (initialPlayerIndex + i) % playerNum,
        currentPlayerAction = this.playerBrains[currentPlayerIndex].getAction();
      // オリジナルレイザーまで回ってきたら終了
      if (currentPlayerIndex === this.originalRaiserIndex) {
        return NON_EXIST_PLAYER_INDEX;
      }
      if (
        currentPlayerAction == null ||
        (currentPlayerAction.name !== ALLIN && currentPlayerAction.name !== FOLD)
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

  isExistActivePlayer() {
    return this.playerBrains.some((brain)=>{
      let action = brain.getAction();
      return (action === null || (action.name !== FOLD && action.name !== ALLIN));
    });
  }

  collectChipsToPod() {
    this.playerBrains.forEach((brain)=>{
      let action = brain.getAction(),
        player = brain.getPlayer();
      this.board.addChip(action.value);
      player.pay(action.value);
      if (action.name === FOLD) {
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
    let boardCards = this.board.getOpenedCards();
      bestRank = new Rank(NO_PAIR, 0, 0),
      winners = [];
    this.playerBrains.forEach((brain)=>{
      let rank = brain.getPlayer().getRank(boardCards),
        comparedResult = RankUtil.compareRanks(rank, bestRank);
      if (comparedResult === 1) {
        bestRank = rank;
        winners = [brain];
      } else if (comparedResult === 0) {
        winners.push(brain);
      }
    });
    return winners;
  }

  sharePodToWinners(winnerBrains) {
    let pot = this.board.getPot() / winnerBrains.length;
    winnerBrains.forEach((brain)=>{
      brain.getPlayer().addStack(pod);
    });
  }

  resetPlayersAction(){
    this.playerBrains.forEach((brain)=>{
      brain.resetAction();
    });
  }
}
