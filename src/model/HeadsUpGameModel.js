import PlayerBrain from 'PlayerBrain';
import CardsFactory from '../factory/CardsFactory';
import {ALLIN, RAISE, CALL, CHECK, FOLD, NONE} from '../const/ActionName';
import {NEXT, END, SHOWDOWN, GAMESET} from '../const/GameState';

const HAND_CARDS_NUM = 2;
const FROP_CARDS_NUM = 3;
const NON_EXIST_PLAYER_INDEX = -1;

export default class HeadsUpGameModel {
  constructor(playerBrains, initialBigBlind) {
    this.playerBrains = playerBrains;
    this.dealer = new Dealer((new CardsFactory()).generate());
    this.board = new Board();

    this.originalRaiserIndex = NON_EXIST_PLAYER_INDEX;
    this.bigBlind = initialBigBlind;
    this.currentCallValue = initialBigBlind;
    this.utgIndex = 0;
    this.currentActoinIndex = this.utgIndex;
  }

  dealCards() {
    let playerNum = this.playerBrains.length;
    this.playerBrains.froEach((brain)=>{
      brain.resetAction();
    });
    this.board.clear();
    this.dealer.shuffleCards();
    this.currentCallValue = this.bigBlind;
    this.originalRaiserIndex = NON_EXIST_PLAYER_INDEX;
    this.utgIndex = (this.utgIndex + 1) % this.playerBrains.length;
    if (playerNum === 2) {
      this.playerBrains[(this.utgIndex + playerNum - 1) % playerNum].action = new ActionModel(NONE, this.bigBlind);
      this.playerBrains[this.utgIndex].action = new ActionModel(NONE, this.bigBlind/2);
    } else {
      this.playerBrains[(this.utgIndex + playerNum - 2) % playerNum].action = new ActionModel(NONE, this.bigBlind);
      this.playerBrains[(this.utgIndex + playerNum - 1) % playerNum].action = new ActionModel(NONE, this.bigBlind/2);
    }

    // 変な配り方しているけど、ロジック部分なので。。
    this.playerBrains.froEach((brain)=>{
      for (let i = 0; i < HAND_CARDS_NUM; i++) {
        brain.getPlayer().setCard(this.dealer.getNextCard());
      }
    });
  }

  actionPhase(isPreFrop) {
    let playerNum = this.playerBrains.length,
      currentPlayerIndex;
    if (isPreFrop) {
      this.currentActoinIndex = this.utgIndex;
    } else if (playerNum === 2) {
      this.currentActoinIndex = ((this.utgIndex + playerNum - 1) % playerNum);
    } else {
      this.currentActoinIndex = ((this.utgIndex + playerNum - 2) % playerNum);
    }
    while ((currentPlayerIndex = this.searchNextPlayerIndex()) !== NON_EXIST_PLAYER_INDEX) {
      let brain = this.playerBrains[currentPlayerIndex],
        currentPlayerAction,
        winner;
      brain.decideAction(this.currentCallValue);
      // 1人以外全員フォールドしたかどうか
      winner = this.getWinner();
      if (winner !== null) {
        this.collectChipsToPod();
        winner.getPlayer().addStack(this.board.getPot());
        return END;
      }
      // オリジナルレイザーが変わった場合
      currentPlayerAction = brain.getAction();
      if (currentPlayerAction.name === RAISE || currentPlayerAction.name === ALLIN) {
        this.originalRaiserIndex = currentPlayerIndex;
        this.currentCallValue = currentPlayerAction.value;
      }
      // BBがCHECKしたかどうか
      if (currentPlayerIndex === ((this.utgIndex + playerNum - 1) % playerNum) && brain.getAction().name === CHECK) {
        break;
      }
      this.currentActoinIndex = (currentPlayerIndex + 1) % playerNum;
    }
    this.collectChipsToPod();
    return this.isExistActivePlayer() ? NEXT : SHOWDOWN;
  }

  searchNextPlayerIndex() {
    let playerNum = this.playerBrains.length,
      initialPlayerIndex = this.currentActoinIndex;

    for (let i = 0; i < playerNum; i++) {
      let currentPlayerIndex = (initialPlayerIndex + i) % playerNum;
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

  getWinner() {
    let survivors = this.playerBrains.filter((brain)=>{
      let action = branin.getAction();
      return action === null || action.name !== FOLD;
    });
    return (survivors.length === 1) ? survivors[0] : null;
  }

  isExistActivePlayer() {
    return this.playerBrains.some((brain)=>{
      let action = branin.getAction();
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

  showDown() {

  }
}
