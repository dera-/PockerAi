import Card from './Card';
import RankUtil from '../util/RankUtil';

export default class Player {
  constructor(id, money) {
    this.id = id;
    this.stack = money;
    this.hand = [];
  }

  isAlive() {
    return this.stack > 0;
  }

  setCard(card) {
    this.hand.push(card);
  }

  clear() {
    this.hand = [];
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

  printHand() {
    console.log('id'+this.id+'のハンド：'+this.hand[0].number+this.hand[0].suit+','+this.hand[1].number+this.hand[1].suit);
  }

  printStack() {
    console.log('id'+this.id+'の残りスタック：'+this.stack);
  }
}
