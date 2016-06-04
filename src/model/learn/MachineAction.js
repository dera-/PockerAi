import {ALLIN, RAISE, CALL, CHECK, FOLD}  from '../../const/ActionName';

const WEAK = -1;
const MEDIUM = 0;
const STRONG = 1;
const ALL_MACHINE_ACTIONS = MachineAction.generateAllActions();

export default class MachineAction {
  constructor(id, actionName, strength = 0) {
    this.id = id;
    this.actionName = actionName;
    this.strength = strength;
  }

  static generateAllActions() {
    let actions = [];
    actions.push(new MachineAction(1, ALLIN));
    actions.push(new MachineAction(2, RAISE, WEAK));
    actions.push(new MachineAction(3, RAISE, MEDIUM));
    actions.push(new MachineAction(4, RAISE, STRONG));
    actions.push(new MachineAction(5, CALL));
    actions.push(new MachineAction(6, CHECK));
    actions.push(new MachineAction(7, FOLD));
    return actions;
  }

  static getActionsCount() {
    return ALL_MACHINE_ACTIONS.length;
  }
}