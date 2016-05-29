export default class MachineAction {
  constructor(id, actionName, strength = 0) {
    this.id = id;
    this.actionName = actionName;
    this.strength = strength;
  }
}