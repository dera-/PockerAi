import {SPADE, HEART, DIAMOND, CLOVER} from '../const/CardSuit';

export default class RankUtil {
  static getRank(hands, boardCards) {
    let cards = hands.concat(boardCards),
      rank;
    rank = RankUtil.getStraightFlushRank(cards);
    if (rank !== null) {
      return rank;
    }
    rank = RankUtil.getFourCardRank(cards);
    if (rank !== null) {
      return rank;
    }
    rank = RankUtil.getFullHouseRank(cards);
    if (rank !== null) {
      return rank;
    }
    rank = RankUtil.getFlushRank(cards);
    if (rank !== null) {
      return rank;
    }
    rank = RankUtil.getStraightRank(cards);
    if (rank !== null) {
      return rank;
    }
    rank = RankUtil.getThreeCardRank(cards);
    if (rank !== null) {
      return rank;
    }
    return RankUtil.getPairRank(cards);
  }

  static getFourCardRank(cards) {
    let sameCardNums = RankUtil.getSameCardNums(cards),
      fourCards = [],
      others = [];
    for (let index = 0; index < sameCardNums.length; index++) {
      let number = index + 2,
        cardNum = sameCardNums[index];
      if (cardNum === 4) {
        fourCards.push(number);
      } else if (cardNum > 0) {
        others.unshift(number);
      }
    }
    return fourCards.length === 0 ? null : new Rank(FOUR_CARD, fourCards[0], 0, others);
  }

  static getFullHouseRank(cards) {
    let sameCardNums = RankUtil.getSameCardNums(cards),
      threeCards = [],
      pairs = [];
    for (let index = 0; index < sameCardNums.length; index++) {
      let number = index + 2,
        cardNum = sameCardNums[index];
      if (cardNum === 3) {
        threeCards.unshift(number);
      } else if (cardNum == 2) {
        pairs.unshift(number);
      }
    }
    if (threeCards.length > 0 && pairs.length > 0) {
      return new Rank(FULL_HOUSE, threeCards[0], pairs[0]);
    } else if (threeCards.length === 2) {
      return new Rank(FULL_HOUSE, threeCards[0], threeCards[1]);
    }
    return null;
  }

  static getThreeCardRank(cards) {
    let sameCardNums = RankUtil.getSameCardNums(cards),
      threeCards = [],
      others = [];
    for (let index = sameCardNums.length-1; index >= 0; index--) {
      let number = index + 2,
        cardNum = sameCardNums[index];
      if (cardNum === 3 && threeCards.length === 0) {
        threeCards.push(number);
      } else if (cardNum > 0) {
        others.push(number);
      }
    }
    return threeCards.length === 0 ? null : new Rank(THREE_CARD, threeCards[0], 0, others);
  }

  static getPairRank(cards) {
    let sameCardNums = RankUtil.getSameCardNums(cards),
      pairs = [],
      others = [];
    for (let index = sameCardNums.length-1; index >= 0; index--) {
      let number = index + 2,
        cardNum = sameCardNums[index];
      if (cardNum === 2 && pairs.length < 2) {
        pairs.push(number);
      } else if (cardNum > 0) {
        others.push(number);
      }
    }
    if (pairs.length === 2) {
      return new Rank(TWO_PAIR, pairs[0], pairs[1], others);
    } else if(pairs.length === 1) {
      return new Rank(ONE_PAIR, pairs[0], 0, others);
    }
    return new Rank(NO_PAIR, 0, 0, others);
  }

  static getStraightRank(cards) {
    let sortedCards = RankUtil.getSortedCards(cards);
      startCardNum = sortedCards[0].number;
      goalCardNum = startCardNum + 4;
      necessaryNumber = startCardNum+1;
    for (let i = 1; i < sortedCards.length; i++) {
      if (sortedCards[i].number === necessaryNumber) {
        necessaryNumber++;
      } else if (sortedCards[i].number === necessaryNumber - 1) {
        continue;
      } else {
        break;
      }
    }
    if (necessaryNumber-1 >= goalCardNum) {
      return new Rank(STRAIGHT, necessaryNumber-1, necessaryNumber-5);
    } else {
      return null;
    }
  }

  static getFlushRank(cards) {
    let flushRanks = RankUtil.getFlushRanks(cards);
    return flushRanks[flushRanks.length-1];
  }

  static getStraightFlushRank(cards) {
    let flushRanks = RankUtil.getFlushRanks(cards),
      straightFlushRank = null;
    for (let rank of flushRanks) {
      if (rank.top - rank.bottom === 4) {
        straightFlushRank = rank;
      }
    }
    if (straightFlushRank !== null) {
      if (straightFlushRank.top === 14) {
        return new Rank(ROYAL_STRAIGHT_FLUSH, straightFlushRank.top, straightFlushRank.bottom);
      } else {
        return new Rank(STRAIGHT_FLUSH, straightFlushRank.top, straightFlushRank.bottom);
      }
    }
    return null;
  }

  static getFlushRanks(cards) {
    let suits = [SPADE:[], HEART:[], DIAMOND:[], CLOVER:[]],
      sameSuitCards = [],
      flushRanks = [],
    cards.forEach((card) => {
      suits[card.suit].push(card);
    });
    sameSuitCards = suits.filter(cards => cards.length >= 5);
    if (sameSuitCards.lenght === 0) {
      return null;
    }
    sameSuitCards = RankUtil.getSortedCards(sameSuitCards);
    for (let i = 0; i + 4 < sameSuitCards.length; i++) {
      flushRanks.push(new Rank(FLUSH, sameSuitCards[i+4].number, sameSuitCards[i].number));
    }
    return flushRanks;
  }

  static getSameCardNums(cards) {
    // 前から順に2,3,4,5,6,7,8,9,T,J,Q,K,A
    let sameCardNums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    cards.forEach((card)=>{
      sameCardNums[card.number-2]++;
    });
    return sameCardNums;
  }

  static getSortedCards(cards) {
    let sortedCards = cards.sort((card1, card2) => card1.number - card2.number),
      maxNumberCard = sortedCards[sortedCards.length-1],
      aceNumber = 14;
    if (maxNumberCard.number === aceNumber)
    {
      sortedCards.unshift(new Card(1, maxNumberCard.suit));
    }
    return sortedCards;
  }

  /**
   * rank2の方が強ければ-1, rank1の方が強ければ1, 同じならば0
   */
  static compareRanks(rank1, rank2) {
    if (rank1.strength !== rank2.strength) {
      return rank2.strength < rank1.strength ? 1 : -1;
    } else if (rank1.top !== rank2.top) {
      return rank2.top < rank1.top ? 1 : -1;
    } else if (rank1.bottom < rank2.bottom) {
      return rank2.bottom < rank1.bottom ? 1 : -1;
    }
    for (let i = 0; i < 3; i++) {
      if (rank1.kickers[i] !== rank2.kickers[i]) {
        return rank2.kickers[i] < rank1.kickers[i] ? 1 : -1;
      }
    }
    return 0;
  }
}