import MachineState from './MachineState';

export default class MachinePreFlopState extends MachineState {
  constructor(id, handType, stackSize, myAction, enemyAction) {
    super(id);
    this.handType = handType;
    this.stackSize = stackSize;
    this.myAction = myAction;
    this.enemyAction = enemyAction;
  }
}