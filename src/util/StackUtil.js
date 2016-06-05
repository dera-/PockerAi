import {VERY_LARGE, LARGE, EVEN, SHORT, VERY_SHORT} from '../const/StackSizeType';

const THRESHOLD = 2;
const BIG_THRESHOLD = 5;

export default class StackUtil {
  static getStackSizeType(myStack, enemyStack) {
    if (myStack >= BIG_THRESHOLD * enemyStack) {
      return VERY_LARGE;
    } else if (myStack >= THRESHOLD * enemyStack) {
      return LARGE;
    } else if (enemyStack < THRESHOLD * myStack) {
      return EVEN;
    } else if (enemyStack < BIG_THRESHOLD * myStack) {
      return SHORT;
    } else {
      return VERY_SHORT;
    }
  }
}