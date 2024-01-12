import { JOIN_TYPE } from "./model";

export const getJoinTypeText = (type) =>
  ({
    [JOIN_TYPE.MANY_TO_ONE]: 'Many to One',
    [JOIN_TYPE.ONE_TO_MANY]: 'One to Many',
    [JOIN_TYPE.ONE_TO_ONE]: 'One to One',
  }[type] || 'Unknown');
