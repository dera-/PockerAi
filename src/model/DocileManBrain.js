import Player from './Player';
import PlayerBrain from './PlayerBrain';
import ActionModel from './ActionModel';
import Rank from './Rank';
import RankUtil from '../util/RankUtil';
import BoardUtil from '../util/BoardUtil';
import {ALLIN, RAISE, CALL, CHECK, FOLD} from '../const/ActionName';
import {PRE_FLOP, FLOP, TURN, RIVER} from '../const/ActionPhase';
import * as RankStrength from '../const/RankStrength';
import {THREE_SAME_SUITES, TWO_SAME_SUITES, THREE_CONNECTOR, TWO_CONNECTOR, THREE_SAME_CARDS, TWO_SAME_CARDS, ONLY_HIGH_CARDS, LOW_AND_MIDDLE_CARDS, EXIST_ACE} from '../const/BoardType';

export default class DocileManBrain extends PlayerBrain {
  constructor(player) {
    super(player);
  }

  // override
  decideAction(actionPhase, enemyBrain, board, callValue) {
    const hands = this.player.getHand();
    const stack = this.player.getStack();
    const payValue = this.action === null ? 0 : this.action.value;
    if (actionPhase === PRE_FLOP) {
      const rinpIn = 50;
      // ちょっとハンドレンジが広すぎな気もするけど
      if ((hands[0].number === hands[1].number && hands[0].number + hands[1].number >= 20) || (hands.some(hand => hand.number===14) && hands[0].number + hands[1].number >= 25)) {
        if (6 * callValue >= stack) {
          this.action = new ActionModel(ALLIN, stack);
        } else if (callValue <= 4 * rinpIn || hands[0].number + hands[1].number >= 26) {
          this.action = new ActionModel(RAISE, 3 * callValue);
        } else {
          this.action = new ActionModel(CALL, callValue);
        }
      } else if (hands[0].number === hands[1].number || hands[0].number + hands[1].number > 23 || hands.some(hand => hand.number===14)) {
        if (callValue === rinpIn) {
          this.action = new ActionModel(RAISE, 3 * callValue);
        } else if (callValue <= Math.round(0.08 * stack) || callValue - payValue <= 2 * payValue) {
          this.action = new ActionModel(CALL, callValue);
        } else {
          this.action = new ActionModel(FOLD, payValue);    
        }
      } else {
        if (callValue === payValue) {
          this.action = new ActionModel(CHECK, callValue);
        } else if (callValue <= 3 * rinpIn) {
          this.action = new ActionModel(CALL, callValue);
        } else {
          this.action = new ActionModel(FOLD, payValue); 
        }
      }
    } else {
      const boardCards = board.getOpenedCards();
      const pod = board.getPotValue();
      const rank = RankUtil.getRealRank(hands, boardCards);
      const boardType = BoardUtil.getBoardType(boardCards);
      const random = Math.round();
      // ほとんどボード見てないので、後で直す感じで
      if (rank.strength >= RankStrength.Straight) {
        if (5 * callValue >= stack) {
          this.action = new ActionModel(ALLIN, stack);
        } else if (callValue === 0) {
          this.action = new ActionModel(RAISE, Math.round(pod / 3));
        } else {
          this.action = new ActionModel(RAISE, 2 * callValue);
        }
      } else if (rank.strength >= RankStrength.TWO_PAIR) {
        if (BoardUtil.isMatch(boardType, TWO_SAME_CARDS)) {
          if (callValue === payValue) {
            this.action = new ActionModel(CHECK, callValue);
          } else {
            this.action = new ActionModel(CALL, callValue);
          }
        } else if (5 * callValue >= stack) {
          this.action = new ActionModel(ALLIN, stack);
        } else if (callValue === 0) {
          this.action = new ActionModel(RAISE, Math.round(pod / 3));
        } else {
          this.action = new ActionModel(RAISE, 2 * callValue);
        }
      } else if (rank.strength >= RankStrength.ONE_PAIR_Q) {
        if (callValue === 0) {
         this.action = new ActionModel(RAISE, Math.round(pod / 3)); 
        } else if (callValue <= Math.round(pod / 2)) {
          this.action = new ActionModel(CALL, callValue);
        } else {
          this.action = new ActionModel(FOLD, payValue);
        }
      } else {
        if (callValue === 0) {
         this.action = new ActionModel(CHECK, callValue);
        // 適当かよ
        } else if (callValue <= Math.round(pod / 3) && random >= 0.5) {
          this.action = new ActionModel(CALL, callValue);
        } else {
          this.action = new ActionModel(FOLD, payValue);
        }
      }
    }
  }
}