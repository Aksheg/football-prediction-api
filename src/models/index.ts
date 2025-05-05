import User from './User';
import Match from './Match';
import Prediction, { PredictionStatus } from './Prediction';
import League from './League';
import LeagueMember from './LeagueMember';
import Reward from './Reward';
import Leaderboard from './Leaderboard';

const initModels = () => {
  return {
    User,
    Match,
    Prediction,
    League,
    LeagueMember,
    Reward,
    Leaderboard,
  };
};

export {
  User,
  Match,
  Prediction,
  PredictionStatus,
  League,
  LeagueMember,
  Reward,
  Leaderboard,
  initModels,
};