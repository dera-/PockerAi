import {NEXT, END, SHOWDOWN} from '../const/GameState';
import {PRE_FLOP, FLOP, TURN, RIVER} from '../const/ActionPhase';
import Player from '../model/Player';
import PlayerBrain from '../model/PlayerBrain';

export default class TexasHoldemSimulationScene {
  constructor(times, bigBlind, initialStack) {
    this.similationTimes = times;
    this.bigBlind = bigBlind;
    this.initialStack = initialStack;
  }

  run() {
    let players = [new PlayerBrain(new Player(1, this.initialStack)), new PlayerBrain(new Player(2, this.initialStack))],
      gameModel = new TexasHoldemModel(this.players, this.bigBlind);
    for (let num = 0; num < this.similationTimes; num++) {
      this.oneGame(gameModel);
    }
  }

  oneGame(gameModel) {
    while(false === gameModel.isFinished()) {
      this.onePlay(gameModel);
      gameModel.deleteDeadPlayer();
    }
  }

  onePlay(gameModel) {
    let currentPhase = PRE_FLOP,
      gameState = NEXT,
      winners;
    gameModel.dealCards();
    for (currentPhase = PRE_FLOP; currentPhase <= RIVER; currentPhase++) {
      if (currentPhase === FLOP) {
        gameModel.startFrop();
      } else if (currentPhase > FLOP) {
        gameModel.openCard();
      }
      if (gameState === NEXT) {
        gameState = gameModel.actionPhase(currentPhase === PRE_FLOP);
      }
      if (gameState === END) {
        break;
      }
    }
    winners = gameModel.getWinners();
    gameModel.sharePodToWinners(winners);
  }
}
