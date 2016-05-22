export default class Rank {
  constructor(strength, score, top, bottom = 0, kicker = 0) {
    this.strength = strength;
    this.score = score;
    this.top   = top;
    this.bottom = bottom;
    this.kicker = kicker;
  }
}
