const ALPHA_VALUE = 0.1; //学習率(0.1が普通)
const GAMMA_VALUE = 0.9; //割引値(0.9が普通)
const LAMBDA_VALUE = 0.95;  //減衰率

export default class QValue {
  constructor(state, action, score = 0) {
    this.state = state;
    this.action = action;
    this.score = score;
  }

  /** Q値を返す */
  getScore() {
    return this.score;
  }

  /** Q値の更新その１ */
  updatedScore(comp, next) {
    this.score = (1 - ALPHA_VALUE) * this.score + ALPHA_VALUE * (comp + GAMMA_VALUE * next);
  }

  /** Q値の更新その２ */
  updatedScoreByTdError(td) {
    this.score = this.score + ALPHA_VALUE * td;
  }

  /** TD誤差を返す */
  getError(comp, next) {
    return comp + GAMMA_VALUE * next - this.score;
  }

  static getGammaValue() {
    return GAMMA_VALUE;
  }
}
