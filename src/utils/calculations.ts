import { Match, Prediction } from '../models';

export function calculatePredictionPoints(prediction: Prediction, match: Match): number {
  if (!match.homeScore || !match.awayScore) {
    return 0;
  }

  if (prediction.homeScore === match.homeScore && prediction.awayScore === match.awayScore) {
    return 3;
  }

  if (
    (prediction.homeScore > prediction.awayScore && match.homeScore > match.awayScore && 
     (prediction.homeScore - prediction.awayScore) === (match.homeScore - match.awayScore)) ||
    (prediction.homeScore < prediction.awayScore && match.homeScore < match.awayScore &&
     (prediction.awayScore - prediction.homeScore) === (match.awayScore - match.homeScore)) ||
    (prediction.homeScore === prediction.awayScore && match.homeScore === match.awayScore)
  ) {
    return 2;
  }

  if (
    (prediction.homeScore > prediction.awayScore && match.homeScore > match.awayScore) ||
    (prediction.homeScore < prediction.awayScore && match.homeScore < match.awayScore) ||
    (prediction.homeScore === prediction.awayScore && match.homeScore === match.awayScore)
  ) {
    return 1;
  }

  return 0;
}