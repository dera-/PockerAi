import MachineState from './MachineState';
import {ALL_REAL_RANK_STRENGTH} from '../../const/RankStrength';
import {ALL_BOARD_PATTERNS} from '../../const/BoardType';
import {ALL_STACK_SIZE_TYPE} from '../../const/StackSizeType';
import {ALL_ACTIONS} from '../../const/ActionName';
import StackUtil from '../../util/StackUtil';
import RankUtil from '../../util/RankUtil';
import BoardUtil from '../../util/BoardUtil';

export default class MachineOpenedBoardState extends MachineState {
  constructor(id, rank, isFlushDraw, isStraightDraw, boardType, enemyAction) {
    super(id);
    this.rank = rank;
    this.isFlushDraw = isFlushDraw;
    this.isStraightDraw = isStraightDraw;
    this.boardType = boardType;
    this.enemyAction = enemyAction;
  }

  static generateAllStates() {
    let states = [],
      id = 1;
    for (let rank of ALL_REAL_RANK_STRENGTH) {
      for (let boardType of ALL_BOARD_PATTERNS) {
        //for (let stack of ALL_STACK_SIZE_TYPE) {
          //for (let myAction of ALL_ACTIONS) {
            for (let enemyAction of ALL_ACTIONS) {
              states.push(new MachineOpenedBoardState(id, rank, true, true, boardType, enemyAction));
              states.push(new MachineOpenedBoardState(id + 1, rank, true, false, boardType, enemyAction));
              states.push(new MachineOpenedBoardState(id + 2, rank, false, true, boardType, enemyAction));
              states.push(new MachineOpenedBoardState(id + 3, rank, false, false, boardType, enemyAction));
              id += 4;
            }
          //}
        //}
      }
    }
    return states;
  }

  static getId(myHand, boardCards, myStack, enemyStack, myAction, enemyAction) {
    let sortedMyHand = myHand.sort((card1, card2) => card1.number - card2.number),
      //stackSizeType = StackUtli.getStackSizeType(myStack, enemyStack),
      rank = RankUtil.getRealRank(myHand, boardCards),
      isFlushDraw = RankUtil.isFlushDraw(myHand, boardCards),
      isStraightDraw = RankUtil.isStraightDraw(myHand, boardCards),
      boardType = BoardUtil.getBoardType(boardCards),
      searched = ALL_STATES.filter((state) => {
        return rank === state.rank && isFlushDraw === state.isFlushDraw && isStraightDraw === state.isStraightDraw && boardType === state.boardType && enemyAction === state.enemyAction; //&& myAction === state.myAction && stackSizeType === state.stackSize;
      });
    if (searched.length === 0) {
      throw new Error('状態IDが見つかりませんでした');
    }
    return searched[0].id;
  }

  static getStatesCount() {
    return ALL_STATES.length;
  }
}

const ALL_STATES = MachineOpenedBoardState.generateAllStates();
