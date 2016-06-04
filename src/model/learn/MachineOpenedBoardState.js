import MachineState from './MachineState';

export default class MachineOpenedBoardState extends MachineState {
  constructor(id, rank, boardType, statckSize, myAction, enemyAction) {
    super(id);
    this.rank = rank;
    this.boardType = boardType;
    this.stackSize = stackSize;
    this.myAction = myAction;
    this.enemyAction = enemyAction;
  }
}
