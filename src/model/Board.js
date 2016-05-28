export default class Board {
  constructor() {
    this.openedCards = [];
    this.chipPot = 0;
  }

  getOpenedCards() {
    return this.openedCards;
  }

  setCard(card) {
    this.openedCards.push(card);
  }

  addChip(chip) {
    this.chipPot += chip;
  }

  getPot() {
    return this.chipPot;
  }

  clear() {
    this.openedCards = [];
    this.chipPot = 0;
  }
}