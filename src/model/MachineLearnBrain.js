import PokerLearnModel from './learn/PokerLearnModel';

export default class MachineLearnBrain extends PlayerBrain {
  constructor(player) {
    super(player);
    this.pokerLearnModel = new PokerLearnModel(player.getStack());
  }

  // override
  decideAction(actionPhase, enemyBrain, board, callValue) {
    this.action = this.pokerLearnModel.getAction(actionPhase, this, enemyBrain, board, callValue);
  }
}
