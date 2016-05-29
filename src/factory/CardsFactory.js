import {SPADE, HEART, DIAMOND, CLOVER} from '../const/CardSuit';
import Card from '../model/Card';

export default class CardsFactory {
  generate() {
    let minNum = 2,
      maxNum = 14,
      suits = [SPADE, HEART, DIAMOND, CLOVER],
      cards = [];
    for (let index = minNum; index < maxNum; index++) {
      suits.forEach((suit) => {
        cards.push(new Card(index, suit));
      });
    }
    return cards;
  }
}