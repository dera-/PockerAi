import Card from 'Card';
import RankUtil from '../util/RankUtil';

export default class Player {
  constructor(money) {
    this.stack = money;
    this.hand = null;
    this.rank = null;
  }

  setCard(cards) {
    this.hand = cards;
  }

  clear() {
    this.hand = null;
    this.rank = null;
  }

  pay(value) {
    this.stack -= value;
  }

  addStack(value) {
    this.stack += value;
  }

  getStack() {
    return this.stack;
  }

  getRank(openedCards) {
    return RankUtil.getRank(this.hand, openedCards);
  }
}
