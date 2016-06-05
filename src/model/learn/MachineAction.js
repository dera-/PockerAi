import {ALLIN, RAISE, CALL, CHECK, FOLD}  from '../../const/ActionName';
import {ALLIN_NUM, BIG_RAISE_NUM, MIDDLE_RAISE_NUM, SMALL_RAISE_NUM, CALL_NUM, CHECK_NUM, FOLD_NUM} from '../../const/MachineActionNumber';

const WEAK = -1;
const MEDIUM = 0;
const STRONG = 1;

export default class MachineAction {
  constructor(id, actionName, strength = 0) {
    this.id = id;
    this.actionName = actionName;
    this.strength = strength;
  }

  static generateAllActions() {
    let actions = [];
    actions.push(new MachineAction(ALLIN_NUM, ALLIN));
    actions.push(new MachineAction(BIG_RAISE_NUM, RAISE, STRONG));
    actions.push(new MachineAction(MIDDLE_RAISE_NUM, RAISE, MEDIUM));
    actions.push(new MachineAction(SMALL_RAISE_NUM, RAISE, WEAK));
    actions.push(new MachineAction(CALL_NUM, CALL));
    actions.push(new MachineAction(CHECK_NUM, CHECK));
    actions.push(new MachineAction(FOLD_NUM, FOLD));
    return actions;
  }

  static getMachineAction(id) {
      let selected = ALL_MACHINE_ACTIONS.filter(action => id === action.id);
      return selected[0];
  }

  static getActionsCount() {
    return ALL_MACHINE_ACTIONS.length;
  }
}

const ALL_MACHINE_ACTIONS = MachineAction.generateAllActions();
