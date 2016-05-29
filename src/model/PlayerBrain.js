import Player from './Player';
import ActionModel from './ActionModel';
import {ALLIN, RAISE, CALL, CHECK, FOLD} from '../const/ActionName';

export default class PlayerBrain {
  constructor(player) {
    this.player = player;
    this.action = null;
  }

  getPlayer() {
    return this.player;
  }

  // テストとしてエニハンコールマンを実装
  // TODO: ここの処理をちゃんと実装する
  decideAction(callValue) {
    if (callValue === 0 || this.action.value === callValue) {
      this.action = new ActionModel(CHECK, callValue);
    } else {
      this.action = new ActionModel(CALL, callValue);
    }

    if (this.action.value >= this.player.getStack()) {
      this.action = new ActionModel(ALLIN, this.player.getStack());
    }
  }

  setAction(name, value) {
    this.action = new ActionModel(name, value);
  }

  getAction() {
    return this.action;
  }

  resetAction() {
    this.action = null;
  }

  printAction() {
    console.log('id:' + this.player.id + 'のアクションは' + this.action.name + '。賭け金は' + this.action.value);
  }

}
