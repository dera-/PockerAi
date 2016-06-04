import QValue from '../../model/learn/QValue';
import MachineAction from '../../model/learn/MachineAction';
import MachineOpenedBoardState from '../../model/learn/MachineOpenedBoardState';
import MachinePreFlopState from '../../model/learn/MachinePreFlopState';

export default class QvalueFactory {
  generateListForPreFlopState() {
    return QvalueFactory.generateList(MachinePreFlopState.getStatesCount(), MachineAction.getActionsCount());
  }

  generateListForOpenedBoardState() {
    return QvalueFactory.generateList(MachineOpenedBoardState.getStatesCount(), MachineAction.getActionsCount());
  }

  generateList(statesCount, actionsCount) {
    let qValues = [];
    for (let stateId = 1; stateId <= statesCount; stateId++) {
      for (let actionId = 1; actionId <= actionsCount; actionId++) {
        qValues.push(new QValue(stateId, actionId));
      }
    }
    return qValues;
  }
}
