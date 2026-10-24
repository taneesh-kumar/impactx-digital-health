import { LABELED_EVALUATION_DATASET, LabeledRecordPair } from './evaluation-dataset';
import { compareRecords } from './detector';

export interface EvaluationMetrics {
  totalPairs: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  trueNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
  results: {
    id: string;
    name: string;
    groundTruth: boolean;
    predicted: boolean;
    predictedTier: string;
    similarityScore: number;
    detectionMethod: string;
    isCorrect: boolean;
  }[];
}

export function runDuplicateEvaluation(): EvaluationMetrics {
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let trueNegatives = 0;

  const results = LABELED_EVALUATION_DATASET.map((pair: LabeledRecordPair) => {
    const comparison = compareRecords(pair.recordA, pair.recordB);
    const predicted = comparison.isMatch;
    const groundTruth = pair.groundTruthIsDuplicate;

    if (groundTruth && predicted) {
      truePositives++;
    } else if (!groundTruth && predicted) {
      falsePositives++;
    } else if (groundTruth && !predicted) {
      falseNegatives++;
    } else {
      trueNegatives++;
    }

    return {
      id: pair.id,
      name: pair.name,
      groundTruth,
      predicted,
      predictedTier: comparison.matchTier,
      similarityScore: comparison.similarityScore,
      detectionMethod: comparison.detectionMethod,
      isCorrect: groundTruth === predicted,
    };
  });

  const totalPairs = LABELED_EVALUATION_DATASET.length;
  const precision = truePositives + falsePositives > 0 ? truePositives / (truePositives + falsePositives) : 1;
  const recall = truePositives + falseNegatives > 0 ? truePositives / (truePositives + falseNegatives) : 1;
  const f1Score = precision + recall > 0 ? (2 * (precision * recall)) / (precision + recall) : 0;
  const accuracy = totalPairs > 0 ? (truePositives + trueNegatives) / totalPairs : 1;

  return {
    totalPairs,
    truePositives,
    falsePositives,
    falseNegatives,
    trueNegatives,
    precision: Math.round(precision * 1000) / 10,
    recall: Math.round(recall * 1000) / 10,
    f1Score: Math.round(f1Score * 1000) / 10,
    accuracy: Math.round(accuracy * 1000) / 10,
    results,
  };
}
