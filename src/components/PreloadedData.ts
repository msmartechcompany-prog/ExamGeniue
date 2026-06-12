/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudyMaterial, Subject } from '../types';

export const PRELOADED_MATERIALS: StudyMaterial[] = [
  {
    id: "pre-physics-12",
    name: "Class 12 Physics - Mechanics & Electrostatics Syllabus",
    size: "142 KB",
    type: "Syllabus",
    uploadDate: "System Preloaded",
    isPreloaded: true,
    content: `CLASS 12 PHYSICS CURRICULUM OVERVIEW:
UNIT 1: ELECTROSTATICS
Electric Charges and Fields: Electric charge, conservation of charge, Coulomb's law, forces between multiple charges, superposition principle and continuous charge distribution. Electric field, electric field lines, electric field due to a point charge, electric dipole, electric field due to a dipole, torque on a dipole in a uniform electric field. Electric flux, statement of Gauss's theorem and its applications to find field due to infinitely long straight wire, uniformly charged infinite plane sheet and uniformly charged thin spherical shell.

UNIT 2: CURRENT ELECTRICITY
Electric current, flow of electric charges in a metallic conductor, drift velocity, mobility and their relation with electric current; Ohm's law, electrical resistance, V-I characteristics (linear and non-linear), electrical energy and power, electrical resistivity and conductivity. Temperature dependence of resistance. Internal resistance of a cell, potential difference and emf of a cell, combination of cells in series and in parallel. Kirchhoff's laws and simple applications. Wheatstone bridge, metre bridge. Potentiometer - principle and its applications to measure potential difference.

UNIT 3: CLASSICAL MECHANICS (University Level Intro)
Newton's Laws of Motion, Rotational Dynamics, Torque, Angular Momentum, Conservation of Angular Dynamics, Moment of Inertia, Parallel and Perpendicular Axes Theorems, Kepler's Laws of Planetary Motion, Simple Harmonic Motion (SHM) equations, Damped and Forced Oscillations, resonance curves.`
  },
  {
    id: "pre-chemistry-neet",
    name: "NEET Prep - Organic Chemistry & Reaction Mechanisms",
    size: "215 KB",
    type: "Notes",
    uploadDate: "System Preloaded",
    isPreloaded: true,
    content: `NEET ORGANIC CHEMISTRY CONCEPT NOTES:
1. Classification of Organic Compounds, IUPAC Nomenclature.
2. Isomerism: Structural Isomerism (chain, position, functional, metamerism, tautomerism) and Stereoisomerism (geometrical and optical isomerism, chiral centers, enantiomers, diastereomers, R/S configurations).
3. Electronic Effects in Organic Chemistry:
   - Inductive Effect (+I, -I) - permanent polarization.
   - Electromeric Effect (+E, -E) - temporary effect, active only in presence of reagents.
   - Resonance / Mesomeric Effect (+M, -M) - delocalization of pi electrons.
   - Hyperconjugation - no-bond resonance, stability of carbocations, free radicals, and alkenes.
4. Reactive Intermediates:
   - Carbocations (stability: 3° > 2° > 1° > methyl, stabilized by hyperconjugation and +I).
   - Carbanions (stability: methyl > 1° > 2° > 3°, stabilized by -I).
   - Free Radicals, Carbenes, and Nitrenes.
5. Important Reaction Mechanisms:
   - Nucleophilic Substitution: SN1 (two-step, carbocation intermediate, racemization, favored by polar protic solvents, order of reactivity: 3° > 2° > 1°) and SN2 (single-step, transition state, inversion of configuration, favored by polar aprotic solvents, order: 1° > 2° > 3°).
   - Electrophilic Addition to Alkenes: Markovnikov's Rule and Anti-Markovnikov's addition (peroxide effect, radical mechanism).
   - Name Reactions: Aldol Condensation, Cannizzaro Reaction, Wurtz Reaction, Sandmeyer Reaction, Clemmensen Reduction, Hoffmann Bromamide degradation.`
  },
  {
    id: "pre-computer-cs",
    name: "University Intro to Algorithms & Complexity",
    size: "185 KB",
    type: "Textbook Summary",
    uploadDate: "System Preloaded",
    isPreloaded: true,
    content: `INTRODUCTION TO ALGORITHMS & BIG-O COMPLEXITY:
1. Analysis of Algorithms:
   - Time complexity and Space complexity.
   - Asymptotic Notations: Big-O (upper bound), Omega Ω (lower bound), and Theta Θ (tight boundary).
   - Solving Recurrence Relations: Master Theorem (T(n) = aT(n/b) + f(n)), Recursion Trees, and Substitution Method.

2. Divide and Conquer:
   - Merge Sort (T(n) = 2T(n/2) + O(n), time complexity O(n log n), stable, out-of-place).
   - Quick Sort (T(n) = T(k) + T(n-k-1) + O(n), worst-case O(n^2), average O(n log n), unstable, in-place, pivot strategies).
   - Binary Search (O(log n) on sorted arrays).

3. Greedy Algorithms vs Dynamic Programming:
   - Greedy: Makes locally optimal choice at each stage (e.g., Huffman Coding, Fractional Knapsack, Prim's and Kruskal's Minimum Spanning Tree algorithms).
   - Dynamic Programming: Solves subproblems once and caches results (e.g., 0/1 Knapsack, Longest Common Subsequence (LCS), Matrix Chain Multiplication, Floyd-Warshall All-Pairs Shortest Path).

4. Graph Algorithms:
   - BFS (Breadth-First Search, queue-based, time O(V+E), finds shortest path in unweighted graphs).
   - DFS (Depth-First Search, stack-based/recursive, time O(V+E), topological sort, strongly connected components).
   - Dijkstra's Algorithm (Single-source shortest path, priority queue O((V+E)log V), fails on negative weights).
   - Bellman-Ford (Shortest path supports negative weights, time O(VE), detects negative cycles).`
  }
];

export const SUBJECT_ICONS: Record<Subject, string> = {
  [Subject.Physics]: "Atom",
  [Subject.Chemistry]: "Beaker",
  [Subject.Mathematics]: "Binary",
  [Subject.Biology]: "Dna",
  [Subject.ComputerScience]: "Cpu",
  [Subject.Engineering]: "Wrench",
  [Subject.Medical]: "HeartPulse",
  [Subject.Law]: "Scale",
  [Subject.Business]: "Briefcase"
};
