import Player from 'Player';
import ActionModel from 'ActionModel';
import {ALLIN, RAISE, CALL, FOLD} from '../ActionName';

export default class PlayerBrain {
  constructor(player) {
    this.player = player;
    this.action = null;
  }

  getPlayer() {
    return this.player;
  }

  getAction() {
    // TODO ここを作成
    if (this.action.value >= this.player.getStack()) {
      this.action = new ActionModel(ALLIN, this.player.getStack());
    }
    return this.action;
  }

  resetAction() {
    this.action = null;
  }

  decideAction() {
    this.action = new ActionModel(RAISE, 0);
  }
}
