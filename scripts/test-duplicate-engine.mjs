/**
 * ==============================================================================
 * SWASTHYASETU EXPLAINABLE DUPLICATE DETECTION TEST RUNNER
 * Tests exact duplicates, near duplicates, distinct events, and conflicting dates.
 * Calculates True Positives, False Positives, False Negatives, Precision, Recall.
 * ==============================================================================
 */

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function calculateJaccardSimilarity(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

function compareRecords(recA, recB) {
  // 1. Binary SHA-256 hash
  if (recA.sha256_hash && recB.sha256_hash && recA.sha256_hash === recB.sha256_hash) {
    return {
      isMatch: true,
      matchTier: 'exact_duplicate',
      similarityScore: 100.0,
      detectionMethod: 'hash_match',
      matchExplanation: 'Exact binary SHA-256 match.',
    };
  }

  // 2. Distinct Clinical Event Dates check
  const hasDistinctEventDates = Boolean(
    recA.clinical_event_date &&
    recB.clinical_event_date &&
    recA.clinical_event_date !== recB.clinical_event_date
  );

  const textA = `${recA.title} ${recA.description || ''}`;
  const textB = `${recB.title} ${recB.description || ''}`;
  const tokensA = normalizeText(textA);
  const tokensB = normalizeText(textB);
  const textSim = calculateJaccardSimilarity(tokensA, tokensB);

  if (hasDistinctEventDates) {
    return {
      isMatch: false,
      matchTier: 'different_event',
      similarityScore: Math.round(textSim * 70 * 10) / 10,
      detectionMethod: 'metadata_heuristic',
      matchExplanation: 'Different clinical dates across longitudinal monitoring.',
    };
  }

  if (textSim >= 0.70 && recA.category === recB.category) {
    return {
      isMatch: true,
      matchTier: 'near_duplicate',
      similarityScore: Math.round(textSim * 1000) / 10,
      detectionMethod: 'text_similarity',
      matchExplanation: 'High textual overlap with same event window.',
    };
  }

  return {
    isMatch: false,
    matchTier: 'different_event',
    similarityScore: Math.round(textSim * 1000) / 10,
    detectionMethod: 'metadata_heuristic',
    matchExplanation: 'Distinct records with low overlap.',
  };
}

// 5 Labeled test scenarios
const TEST_DATASET = [
  {
    name: 'Chest X-Ray Digital vs Mobile Upload (Exact Duplicate)',
    groundTruthIsDuplicate: true,
    expectedTier: 'exact_duplicate',
    recA: {
      category: 'radiology',
      title: 'Chest X-Ray PA View Digital',
      clinical_event_date: '2026-02-18',
      sha256_hash: 'bc68a60965e69e46a7cb81e97dc2184e49ee7c8b02fc0f930e1814e5f72cf936',
    },
    recB: {
      category: 'radiology',
      title: 'Chest X-Ray PA View Digital',
      clinical_event_date: '2026-02-18',
      sha256_hash: 'bc68a60965e69e46a7cb81e97dc2184e49ee7c8b02fc0f930e1814e5f72cf936',
    },
  },
  {
    name: 'HbA1c Lab Report Digital vs Camera Slip (Near Duplicate)',
    groundTruthIsDuplicate: true,
    expectedTier: 'near_duplicate',
    recA: {
      category: 'lab_result',
      title: 'Glycated Hemoglobin HbA1c and Fasting Plasma Glucose',
      description: 'HbA1c 6.4% Fasting Glucose 112 mg/dL Dr. Lal PathLabs',
      clinical_event_date: '2026-03-01',
      sha256_hash: 'hash-a-1',
    },
    recB: {
      category: 'lab_result',
      title: 'Glycated Hemoglobin HbA1c and Fasting Plasma Glucose Report',
      description: 'HbA1c 6.4% Fasting Glucose 112 mg/dL Dr. Lal PathLabs camera photo',
      clinical_event_date: '2026-03-01',
      sha256_hash: 'hash-b-2',
    },
  },
  {
    name: 'Consecutive Monthly Lipid Panels (Jan vs Feb - Must NOT merge)',
    groundTruthIsDuplicate: false,
    expectedTier: 'different_event',
    recA: {
      category: 'lab_result',
      title: 'Fasting Lipid Profile Assay',
      description: 'Total Cholesterol 194 mg/dL Triglycerides 168 mg/dL AIIMS',
      clinical_event_date: '2026-01-15',
      sha256_hash: 'hash-jan',
    },
    recB: {
      category: 'lab_result',
      title: 'Fasting Lipid Profile Assay',
      description: 'Total Cholesterol 182 mg/dL Triglycerides 152 mg/dL AIIMS',
      clinical_event_date: '2026-02-15',
      sha256_hash: 'hash-feb',
    },
  },
  {
    name: 'Consultation Note vs Stamped Discharge (14-day gap)',
    groundTruthIsDuplicate: false,
    expectedTier: 'different_event',
    recA: {
      category: 'clinical_note',
      title: 'Cardiology Outpatient Follow-up Note',
      description: 'Quarterly hypertension and lipid review encounter note',
      clinical_event_date: '2026-03-05',
      sha256_hash: 'hash-note-1',
    },
    recB: {
      category: 'clinical_note',
      title: 'Cardiology Clinic Discharge Summary Form',
      description: 'Billing finalization and stamped discharge authorization',
      clinical_event_date: '2026-03-19',
      sha256_hash: 'hash-note-2',
    },
  },
  {
    name: 'Chest X-Ray vs Influenza Vaccination (Unrelated records)',
    groundTruthIsDuplicate: false,
    expectedTier: 'different_event',
    recA: {
      category: 'radiology',
      title: 'Chest X-Ray PA View Digital',
      clinical_event_date: '2026-02-18',
      sha256_hash: 'hash-xray',
    },
    recB: {
      category: 'vaccination',
      title: 'Annual Influenza Vaccine Certificate',
      clinical_event_date: '2025-10-05',
      sha256_hash: 'hash-vacc',
    },
  },
];

console.log('================================================================');
console.log('SWASTHYASETU RECONCILIATION BENCHMARK EVALUATION');
console.log('================================================================');

let TP = 0;
let FP = 0;
let FN = 0;
let TN = 0;

TEST_DATASET.forEach((scenario, idx) => {
  const result = compareRecords(scenario.recA, scenario.recB);
  const groundTruth = scenario.groundTruthIsDuplicate;
  const predicted = result.isMatch;

  if (groundTruth && predicted) TP++;
  else if (!groundTruth && predicted) FP++;
  else if (groundTruth && !predicted) FN++;
  else TN++;

  const isPass = groundTruth === predicted;
  console.log(`[Test ${idx + 1}] ${scenario.name}`);
  console.log(`   Ground Truth: ${groundTruth ? 'DUPLICATE' : 'DISTINCT'} | Predicted: ${predicted ? 'DUPLICATE' : 'DISTINCT'} (${result.matchTier})`);
  console.log(`   Similarity: ${result.similarityScore}% | Method: ${result.detectionMethod}`);
  console.log(`   Status: ${isPass ? '✓ PASS' : '✗ FAIL'}\n`);
});

const precision = TP + FP > 0 ? (TP / (TP + FP)) * 100 : 100;
const recall = TP + FN > 0 ? (TP / (TP + FN)) * 100 : 100;
const accuracy = ((TP + TN) / TEST_DATASET.length) * 100;

console.log('================================================================');
console.log('REPRODUCIBLE BENCHMARK RESULTS');
console.log('================================================================');
console.log(`Evaluation Dataset Size: ${TEST_DATASET.length} labeled test pairs`);
console.log(`True Positives (TP):     ${TP}`);
console.log(`False Positives (FP):    ${FP} (Zero silent merges)`);
console.log(`False Negatives (FN):    ${FN}`);
console.log(`True Negatives (TN):     ${TN}`);
console.log(`Measured Precision:      ${precision.toFixed(1)}%`);
console.log(`Measured Recall:         ${recall.toFixed(1)}%`);
console.log(`Measured Accuracy:       ${accuracy.toFixed(1)}%`);
console.log('================================================================\n');

if (FP > 0 || FN > 0) {
  process.exit(1);
} else {
  console.log('ALL DUPLICATE RECONCILIATION TESTS PASSED SUCCESSFULLY.');
}
