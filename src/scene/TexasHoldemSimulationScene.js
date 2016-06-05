import {NEXT, END, SHOWDOWN} from '../const/GameState';
import {PRE_FLOP, FLOP, TURN, RIVER} from '../const/ActionPhase';
import Player from '../model/Player';
import PlayerBrain from '../model/PlayerBrain';
import AnyHandCallManBrain from '../model/AnyHandCallManBrain';
import MachineLearnBrain from '../model/MachineLearnBrain';
import TexasHoldemModel from '../model/TexasHoldemModel';
import {FOLD} from '../const/ActionName';

export default class TexasHoldemSimulationScene {
  constructor(times, bigBlind, initialStack) {
    this.similationTimes = times;
    this.bigBlind = bigBlind;
    this.initialStack = initialStack;
    this.playerId = 1;
    this.enemyId = 2;
    this.players = [new MachineLearnBrain(new Player(this.playerId, this.initialStack)), new AnyHandCallManBrain(new Player(this.enemyId, this.initialStack))];
  }

  run() {
    for (let num = 0; num < this.similationTimes; num++) {
      let gameModel = new TexasHoldemModel(this.players, this.bigBlind);
      this.players[0].setPlayer(new Player(this.playerId, this.initialStack));
      this.players[1].setPlayer(new Player(this.enemyId, this.initialStack));
      console.log("game" + num + '開始');
      this.oneGame(gameModel);
      console.log("game" + num + '完了');
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
      winners,
      playerAction,
      isLoose;
    gameModel.dealCards();
    for (currentPhase = PRE_FLOP; currentPhase <= RIVER; currentPhase++) {
      console.log('phase:'+currentPhase);
      if (currentPhase === FLOP) {
        gameModel.startFrop();
      } else if (currentPhase > FLOP) {
        gameModel.openCard();
      }
      if (gameState === NEXT) {
        gameState = gameModel.actionPhase(currentPhase);
        playerAction = this.players[0].getAction();
      }
      if (gameState === END) {
        break;
      }
      gameModel.resetPlayersAction();
    }
    winners = gameModel.getWinners();
    isLoose = winners.some(brain => this.playerId === brain.getPlayer().id);
    // ここで学習
    if (gameState === END && playerAction.name === FOLD) {
      this.players[0].learnWhenFold(currentPhase, gameModel.getChipsInPod(), isLoose);
    } else {
      this.players[0].learn(gameModel.getChipsInPod(), isLoose);
    }
    gameModel.sharePodToWinners(winners);
  }
}
