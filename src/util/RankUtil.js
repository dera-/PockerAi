export default class RankUtil {
  static getRank(hands, boardCards) {
    let cards = hands.concat(boardCards),
      isFlush =
      isStraight =
  }

  static isSameCards(cards, num) {

  }

  static isStraight(cards) {
    let sortedCards = cards.sort((card1, card2) => {
      return card1.number - card2.number;
    }),
      maxNumberCard = sortedCards[sortedCards.length-1],
      aceNumber = 14,
      startCardNum = sortedCards[0].number;
      goalCardNum = startCardNum + 4,
      necessaryNumber = startCardNum+1;
    if (sortedCards[sortedCards.length-1].number === aceNumber)
    {
      sortedCards.unshift(new Card(aceNumber, maxNumberCard.suit));
    }
    for (let i = 1; i < sortedCards.length; i++) {
      if (sortedCards[i] === necessaryNumber) {
        necessaryNumber++;
      } else if (sortedCards[i] === necessaryNumber - 1) {
        continue;
      } else {
        break;
      }
    }
    if (necessaryNumber-1 >= goalCardNum) {
      return new ActionModel(STRAIGHT,0,necessaryNumber-1, necessaryNumber-5);
    } else {
      return null;
    }
  }

  static isFlush(cards) {

  }

  static deleteCard(number) {
    return
  }

  /**
   * rank2の方が強ければ1, rank1の方が強ければ-1, 同じならば0
   */
  static compareRanks(rank1, rank2) {
    if (rank1.strength < rank2.strength) {
      return -1;
    } else if (rank2.strength < rank1.strength) {
      return 1;
    } else if (rank1.score < rank2.score) {
      return -1;
    } else if (rank2.score < rank1.score) {
      return 1;
    } else {
      return 0;
    }
  }
}