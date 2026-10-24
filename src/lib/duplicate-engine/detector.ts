import { HealthRecord, DuplicateRelationship, DuplicateMatchTier } from '@/lib/supabase/types';

/**
 * Tokenize and normalize text for explainable comparison
 */
export function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Calculate Jaccard similarity between two token arrays
 */
export function calculateJaccardSimilarity(tokensA: string[], tokensB: string[]): number {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

export interface DuplicateDetectionResult {
  isMatch: boolean;
  matchTier: DuplicateMatchTier;
  similarityScore: number;
  detectionMethod: 'hash_match' | 'text_similarity' | 'metadata_heuristic';
  matchExplanation: string;
  matchingAttributes: { attribute: string; value?: string; primary?: string; candidate?: string }[];
  conflictingAttributes: { attribute: string; primary?: string; candidate?: string }[];
}

/**
 * Explainable comparison engine between two health records.
 * STRICT CLINICAL RULE:
 * A similar document can represent a different clinical event across time.
 * Never treat similarity as proof that two records are interchangeable.
 * Zero silent merges.
 */
export function compareRecords(recA: HealthRecord, recB: HealthRecord): DuplicateDetectionResult {
  const matchingAttributes: { attribute: string; value?: string; primary?: string; candidate?: string }[] = [];
  const conflictingAttributes: { attribute: string; primary?: string; candidate?: string }[] = [];

  // 1. Exact Binary Hash Comparison (e.g. SHA-256)
  if (recA.sha256_hash && recB.sha256_hash && recA.sha256_hash === recB.sha256_hash) {
    matchingAttributes.push({ attribute: 'Binary SHA-256 Hash', value: `${recA.sha256_hash.slice(0, 16)}...` });
    matchingAttributes.push({ attribute: 'Category', value: recA.category });
    if (recA.clinical_event_date) {
      matchingAttributes.push({ attribute: 'Clinical Event Date', value: recA.clinical_event_date });
    }

    if (recA.source_id !== recB.source_id) {
      conflictingAttributes.push({
        attribute: 'Ingestion Source',
        primary: recA.source?.name || 'Primary Source',
        candidate: recB.source?.name || 'Secondary Source',
      });
    }

    if (recA.upload_timestamp !== recB.upload_timestamp) {
      conflictingAttributes.push({
        attribute: 'Upload Timestamp',
        primary: recA.upload_timestamp,
        candidate: recB.upload_timestamp,
      });
    }

    return {
      isMatch: true,
      matchTier: 'exact_duplicate',
      similarityScore: 100.0,
      detectionMethod: 'hash_match',
      matchExplanation: 'Exact binary SHA-256 checksum match detected. The exact same digital file was ingested or uploaded via separate channels.',
      matchingAttributes,
      conflictingAttributes,
    };
  }

  // 2. Clinical Event Date Distinctness Check
  // If clinical dates are present and distinct, this represents a distinct clinical event (e.g. repeated monthly lab test)
  const hasDistinctEventDates =
    Boolean(recA.clinical_event_date && recB.clinical_event_date && recA.clinical_event_date !== recB.clinical_event_date);

  if (hasDistinctEventDates) {
    conflictingAttributes.push({
      attribute: 'Clinical Event Date',
      primary: recA.clinical_event_date || 'Unknown',
      candidate: recB.clinical_event_date || 'Unknown',
    });
  } else if (recA.clinical_event_date && recA.clinical_event_date === recB.clinical_event_date) {
    matchingAttributes.push({ attribute: 'Clinical Event Date', value: recA.clinical_event_date });
  }

  // Category and Title comparison
  if (recA.category === recB.category) {
    matchingAttributes.push({ attribute: 'Clinical Category', value: recA.category });
  } else {
    conflictingAttributes.push({ attribute: 'Clinical Category', primary: recA.category, candidate: recB.category });
  }

  // Text similarity of title and description
  const textA = `${recA.title} ${recA.description || ''}`;
  const textB = `${recB.title} ${recB.description || ''}`;
  const tokensA = normalizeText(textA);
  const tokensB = normalizeText(textB);
  const textSim = calculateJaccardSimilarity(tokensA, tokensB);

  // If dates are distinct, it CANNOT be a true duplicate even if text or test name is identical!
  if (hasDistinctEventDates) {
    return {
      isMatch: false,
      matchTier: 'different_event',
      similarityScore: Math.round(textSim * 70 * 10) / 10,
      detectionMethod: 'metadata_heuristic',
      matchExplanation: `Different clinical event dates (${recA.clinical_event_date} vs ${recB.clinical_event_date}). High clinical semantic similarity represents longitudinal monitoring of the same condition, not a duplicate record.`,
      matchingAttributes,
      conflictingAttributes,
    };
  }

  // Near duplicate check (same clinical date or both dates unconfirmed + high text similarity)
  if (textSim >= 0.65 && recA.category === recB.category) {
    matchingAttributes.push({ attribute: 'Semantic Content Overlap', value: `${Math.round(textSim * 100)}% token alignment` });
    return {
      isMatch: true,
      matchTier: 'near_duplicate',
      similarityScore: Math.round(textSim * 1000) / 10,
      detectionMethod: 'text_similarity',
      matchExplanation: 'High textual and clinical parameter alignment for the same event timeframe. Likely a photographic camera scan, re-print, or fax of the primary diagnostic slip.',
      matchingAttributes,
      conflictingAttributes,
    };
  }

  return {
    isMatch: false,
    matchTier: 'different_event',
    similarityScore: Math.round(textSim * 1000) / 10,
    detectionMethod: 'metadata_heuristic',
    matchExplanation: 'Distinct health records with insufficient matching characteristics.',
    matchingAttributes,
    conflictingAttributes,
  };
}
