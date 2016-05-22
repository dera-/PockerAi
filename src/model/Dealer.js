export default class Dealer {
  constructor(cards) {
    this.cards = cards;
    this.index = 0;
    this.shuffleCards();
  }

  shuffleCards() {
    this.index = 0;
    let random = this.card.map(Math.random);
    this.cards.sort((a,b) => random[a] - random[b]);
  }

  getNextCard() {
    this.index++;
    return this.cards[this.index-1];
  }
}
