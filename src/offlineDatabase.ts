/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subject, Question, QuestionType, Difficulty } from './types';

// Predefined offline question bank matching diverse academic disciplines and chapters.
export const OFFLINE_QUESTION_BANK: Record<Subject, Question[]> = {
  [Subject.Physics]: [
    {
      id: "off-phy-1",
      text: "Under a uniform electric field E, what is the torque experienced by a dipole of moment p placed at an angle theta to the electric field vectors?",
      options: [
        "tau = p * E * sin(theta)",
        "tau = p * E * cos(theta)",
        "tau = p * E * tan(theta)",
        "tau = p . E (Dot product)"
      ],
      answer: "tau = p * E * sin(theta)",
      type: QuestionType.MCQ,
      marks: 2,
      difficulty: Difficulty.Medium,
      explanation: "The torque is calculated as the cross product of the dipole moment vector and the electric field intensity vector (tau = p x E), which yields p*E*sin(theta).",
      chapter: "Electrostatics & Dipoles"
    },
    {
      id: "off-phy-2",
      text: "State Gauss's Law in electrostatics and state its integral mathematical expression.",
      answer: "Gauss's Law states that the net electrical flux through any closed Gaussian surface equals the net enclosed electrical charge divided by the permittivity of free space: Integral(E . dA) = Q_enclosed / epsilon_0.",
      type: QuestionType.Short,
      marks: 3,
      difficulty: Difficulty.Medium,
      explanation: "Gauss's law is a cornerstone of classical electromagnetism, representing charge conservation and a formulation of Coulomb's inverse-square law.",
      chapter: "Gauss Theorem Applications"
    },
    {
      id: "off-phy-3",
      text: "ASSERTION: The conductivity of intrinsic semiconductors increases with an increase in absolute temperature.\nREASON: The forbidden energy gap in semiconductors shrinks significantly as the temperature rises.",
      answer: "Assertion is true, but Reason is false.",
      type: QuestionType.AssertionReason,
      assertion: "The conductivity of intrinsic semiconductors increases with an increase in absolute temperature.",
      reason: "The forbidden energy gap in semiconductors shrinks significantly as the temperature rises.",
      marks: 4,
      difficulty: Difficulty.Hard,
      explanation: "Conductivity increases because thermal energy excites electrons across the constant energy gap into the conduction band. The band gap itself does not shrink significantly.",
      chapter: "Semiconductors & Electronic Devices"
    },
    {
      id: "off-phy-4",
      text: "A non-linear potentiometer wire of length 10m has a constant potential gradient of 0.2V/m. Calculate the balancing length obtained for a standard cell of EMF 1.6V.",
      answer: "Balancing length L = E / gradient = 1.6 V / (0.2 V/m) = 8.0 meters.",
      type: QuestionType.Numerical,
      marks: 5,
      difficulty: Difficulty.Medium,
      explanation: "By potentiometer balance mechanics: E = k * L. Rearranging gives L = E / k = 1.6 / 0.2 = 8 meters.",
      chapter: "Current Electricity & Circuits"
    },
    {
      id: "off-phy-5",
      text: "Using Gauss's law, derive the expression for the electric field intensity E at a distance r from an infinitely long, straight, uniformly charged wire of linear charge density lambda.",
      answer: "Choose a cylindrical Gaussian surface of radius r and length L. Enclosed charge Q = lambda * L. The electric flux through curved area is E * (2 * pi * r * L). Flux through flat end caps is zero. E * (2 * pi * r * L) = (lambda * L) / epsilon_0. Solving inside reveals E = lambda / (2 * pi * epsilon_0 * r).",
      type: QuestionType.Long,
      marks: 8,
      difficulty: Difficulty.UniversityLevel,
      explanation: "Symmetrical cancellation of coaxial lines means only radial flux leaves the surface, leading to an inverse dependency on r.",
      chapter: "Gauss Theorem Applications"
    },
    {
      id: "off-phy-6",
      text: "What physical parameter is kept constant in an adiabatic process, and how does it relate to entropy?",
      answer: "During an adiabatic process, net heat transfer (Q) with the surroundings is zero. For a reversible adiabatic process, entropy (S) remains strictly constant (isentropic).",
      type: QuestionType.Viva,
      marks: 3,
      difficulty: Difficulty.Medium,
      explanation: "By the second law of thermodynamics, dS = dQ/T for reversible paths. Since dQ = 0, dS = 0, indicating constant entropy.",
      chapter: "Thermodynamics Core"
    }
  ],
  [Subject.Chemistry]: [
    {
      id: "off-chem-1",
      text: "Which of the following organic mechanisms is characterized by a two-step process, a planar carbocation intermediate, and racemization of optical products?",
      options: [
        "SN1 reaction pathway",
        "SN2 reaction pathway",
        "E2 elimination pathway",
        "Electrophilic aromatic substitution"
      ],
      answer: "SN1 reaction pathway",
      type: QuestionType.MCQ,
      marks: 2,
      difficulty: Difficulty.Medium,
      explanation: "SN1 is a unimolecular substitution mechanism favoring polar protic solvents, forming stable carbocation intermediates which allow front and back side nucleophilic attack.",
      chapter: "Organic Reaction Mechanisms"
    },
    {
      id: "off-chem-2",
      text: "Explain the Mesomeric (Resonance) effect and define how it differs from the Inductive effect in organic compounds.",
      answer: "The Mesomeric effect involves the complete delocalization of pi electrons or lone pairs along a conjugated network, whereas the Inductive effect is a permanent polarization of sigma bonds due to electronegativity differentials.",
      type: QuestionType.Short,
      marks: 3,
      difficulty: Difficulty.Medium,
      explanation: "Resonance acts through pi-systems over distances without fading, while inductive effects operate through sigma-bonds and decay exponentially after 3-4 carbons.",
      chapter: "Electronic Displacement Effects"
    },
    {
      id: "off-chem-3",
      text: "ASSERTION: The rate of SN2 nucleophilic substitution is highest in tertiary alkyl halides because of heavy alkyl inductive electron donation.\nREASON: S2 reactions proceed via a sterically congested carbon five-coordinate transition state.",
      answer: "Assertion is false, but Reason is true.",
      type: QuestionType.AssertionReason,
      assertion: "The rate of SN2 nucleophilic substitution is highest in tertiary alkyl halides because of heavy alkyl inductive electron donation.",
      reason: "S2 reactions proceed via a sterically congested carbon five-coordinate transition state.",
      marks: 4,
      difficulty: Difficulty.Hard,
      explanation: "Tertiary alkyl halides undergo SN2 extremely slowly or not at all because the bulky alkyl groups sterically block the approaching nucleophile in the five-coordinate transition state.",
      chapter: "Alkyl Halides Kinetics"
    },
    {
      id: "off-chem-4",
      text: "Explain the principal mechanism of Aldol Condensation. Which carbonyl compounds undergo this reaction?",
      answer: "Aldol condensation occurs in aldehydes or ketones possessing at least one alpha-hydrogen. Under basic conditions, the base extracts the alpha-hydrogen, forming a nucleophilic enolate ion. This ion attacks another carbonyl molecules, yielding a beta-hydroxy carbonyl which dehydrates under warm conditions to an alpha,beta-unsaturated product.",
      type: QuestionType.Long,
      marks: 8,
      difficulty: Difficulty.Hard,
      explanation: "The presence of alpha-hydrogen is mandatory for initial enolization. Intermediates like carbanions run through a reversible, nucleophilic addition cycle.",
      chapter: "Carbonyl Name Reactions"
    }
  ],
  [Subject.Mathematics]: [
    {
      id: "off-math-1",
      text: "If a system is defined by the differential equation dy/dx + P(x) y = Q(x), what is the appropriate Integrating Factor (I.F.) used to solve it?",
      options: [
        "I.F. = e^(Integral(P(x) dx))",
        "I.F. = e^(Integral(Q(x) dx))",
        "I.F. = Integral(e^P(x) dx)",
        "I.F. = Log(P(x)) * dx"
      ],
      answer: "I.F. = e^(Integral(P(x) dx))",
      type: QuestionType.MCQ,
      marks: 2,
      difficulty: Difficulty.Medium,
      explanation: "Multiplying both sides by e^(Integral(P(x)dx)) transforms the left side into the perfect derivative of (y * I.F.) with respect to x, satisfying Leibniz's rule.",
      chapter: "Differential Equations"
    },
    {
      id: "off-math-2",
      text: "State the Rolle's Theorem and define its three necessary conditions on a closed interval [a, b].",
      answer: "A real-valued function f has a horizontal tangent on (a, b) if: 1. f is continuous on [a, b], 2. f is differentiable on (a, b), and 3. f(a) = f(b). If so, there exists at least one c in (a, b) such that f'(c) = 0.",
      type: QuestionType.Short,
      marks: 3,
      difficulty: Difficulty.Medium,
      explanation: "Rolle's theorem is a boundary case of the Mean Value Theorem, indicating an absolute turning point exists inside closed boundaries.",
      chapter: "Calculus & Limits"
    }
  ],
  [Subject.Biology]: [
    {
      id: "off-bio-1",
      text: "What is the primary role of tRNA during translation in cellular ribosomes?",
      options: [
        "To carry matching amino acids to the template mRNA strand",
        "To synthesize single-stranded DNA from RNA templates",
        "To act as the structural framework for ribosomal subunits",
        "To splice genetic introns from primary transcripts"
      ],
      answer: "To carry matching amino acids to the template mRNA strand",
      type: QuestionType.MCQ,
      marks: 2,
      difficulty: Difficulty.Easy,
      explanation: "tRNA molecules contain anticodons that pair complementary-wise with mRNA codons, transferring relevant amino acids onto the growing polypeptide chain.",
      chapter: "Molecular Genetics"
    },
    {
      id: "off-bio-2",
      text: "Discuss the process and physiological role of Oxidative Phosphorylation inside eukaryotic mitochondria.",
      answer: "Oxidative phosphorylation occurs on the inner inner-membrane (cristae). Electrons from NADH and FADH2 are transferred through the Electron Transport Chain (ETC), creating a proton electrochemical gradient. This proton motive force drives protons back through the ATP Synthase enzyme complex, synthesizing ATP from ADP and inorganic phosphate.",
      type: QuestionType.Long,
      marks: 8,
      difficulty: Difficulty.Hard,
      explanation: "Oxygen acts as the terminal electron acceptor, forming water. ATP synthase behaves as a rotary motor powered by proton density differentials.",
      chapter: "Cellular Respiration"
    }
  ],
  [Subject.ComputerScience]: [
    {
      id: "off-cs-1",
      text: "For a recursive function with recurrence relation f(n) = 2 * f(n/2) + O(n), what is its average-case time complex rating according to the Master Method?",
      options: [
        "O(n log n)",
        "O(n^2)",
        "O(log n)",
        "O(n)"
      ],
      answer: "O(n log n)",
      type: QuestionType.MCQ,
      marks: 2,
      difficulty: Difficulty.Medium,
      explanation: "Comparing n^(log_b a) = n^(log_2 2) = n^1 to f(n) = O(n), we find they match. This falls into Case 2 of the Master Theorem, multiplying complexity by log n, yielding O(n log n). Examples include Merge Sort.",
      chapter: "Algorithm Complexity Analysis"
    },
    {
      id: "off-cs-2",
      text: "Explain the key operational difference between Dijkstra's algorithm and the Bellman-Ford algorithm for single-source shortest path problems.",
      answer: "Dijkstra is a greedy algorithm with complexity O((V+E)log V); it assumes non-negative edge weights and works iteratively. Bellman-Ford dynamically checks all edges V-1 times with O(V*E) complexity, allowing negative edge weights and flagging negative cycles.",
      type: QuestionType.Short,
      marks: 4,
      difficulty: Difficulty.Hard,
      explanation: "Greedy choice in Dijkstra fails on negative cycles because once a node is visited, its tentative distance is assumed absolute, which is violated if a negative shortcuts can reduce it later.",
      chapter: "Graph Theory Algorithms"
    }
  ],
  [Subject.Engineering]: [
    {
      id: "off-eng-1",
      text: "In electrical network analysis, which theorem states that any linear active bilateral circuit containing energy sources can be replaced by an equivalent voltage source (Vth) in series with an equivalent resistance (Rth)?",
      options: [
        "Thevenin's Theorem",
        "Norton's Theorem",
        "Superposition Theorem",
        "Millman's Theorem"
      ],
      answer: "Thevenin's Theorem",
      type: QuestionType.MCQ,
      marks: 2,
      difficulty: Difficulty.Medium,
      explanation: "Thevenin's theorem simplifies complicated linear networks to a single source with active impedance, simplifying load calculation cycles.",
      chapter: "Electrical Circuit Analysis"
    },
    {
      id: "off-eng-2",
      text: "A balanced three-phase delta-connected load is coupled to a balanced 415V three-phase supply. If the load impedance per phase is 15 + j20 ohms, calculate the active electrical power absorbed in kW.",
      answer: "1. Phase impedance Z = sqrt(15^2 + 20^2) = 25 ohms. 2. For delta, phase voltage V_ph = line voltage V_L = 415 V. 3. Phase current I_ph = V_ph / Z = 415 / 25 = 16.6 A. 4. Active power P = 3 * I_ph^2 * R_phase = 3 * (16.6)^2 * 15 = 12.4 kW.",
      type: QuestionType.Numerical,
      marks: 8,
      difficulty: Difficulty.UniversityLevel,
      explanation: "Active power in polyphase circuits can be computed via phase parameters or overall three-phase calculations: P = sqrt(3) * V_L * I_L * cos(phi). Both yield ~12.4 kW.",
      chapter: "Polyphase Circuit Engineering"
    },
    {
      id: "off-eng-3",
      text: "Deconstruct the role of transient dampening in mechanical structural members under cyclic thermal loading.",
      answer: "Cyclic thermal loads generate periodic expansion stress fields. Transient dampening absorbs kinetic strain energy, converting it into distributed internal shear energy. Without sufficient damping, structural resonance speeds cumulative fatigue, causing stress cracks and failure.",
      type: QuestionType.Long,
      marks: 8,
      difficulty: Difficulty.Hard,
      explanation: "Dampening shifts systemic loading peaks away from mechanical natural frequencies, safeguarding ultimate tensile limits.",
      chapter: "Structural Analysis & fatigue"
    },
    {
      id: "off-eng-4",
      text: "What is meant by cavitation in hydraulic turbines, and where is it most likely to manifest?",
      answer: "Cavitation occurs when local pressure falls below vapor pressure, causing vapor bubbles to form. When these bubbles move to high-pressure zones, they collapse violently, causing micro-jet fatigue. It manifests at the runner discharge or draft tube inlet.",
      type: QuestionType.Viva,
      marks: 4,
      difficulty: Difficulty.Medium,
      explanation: "Maintaining the Thoma cavitation parameter above critical limits prevents rapid erosion of mechanical turbine blades.",
      chapter: "Fluid Hydraulics & Machines"
    }
  ],
  [Subject.Medical]: [
    {
      id: "off-med-1",
      text: "In cardiovascular physiology, what initiates the normal physiological delay at the Atrioventricular (AV) node?",
      options: [
        "To allow ventricles to fully fill with blood during atrial systole before ventricular contraction",
        "To trigger instant backward blood flow into the coronary sinus",
        "To synchronize the contraction wave across both absolute lung fields",
        "To decrease systemic blood pressure during exercise spikes"
      ],
      answer: "To allow ventricles to fully fill with blood during atrial systole before ventricular contraction",
      type: QuestionType.MCQ,
      marks: 2,
      difficulty: Difficulty.Medium,
      explanation: "The ~0.1-second delay is crucial, ensuring maximum atrial unloading (atrial kick) into the ventricles before their contraction begins.",
      chapter: "Cardiothoracic Physiology"
    },
    {
      id: "off-med-2",
      text: "Deconstruct the pharmacokinetics of standard intravenous drug administration, highlighting volume of distribution (Vd) and clearance (Cl).",
      answer: "Intravenous administration exhibits 100% bioavailability instantly. The Volume of Distribution (Vd) describes the apparent fluid volume required to hold the total drug at plasma concentrations, while Clearance (Cl) measures the rate of drug elimination. Together, they define the drug's biological half-life (t1/2): t1/2 = 0.693 * Vd / Cl.",
      type: QuestionType.Long,
      marks: 8,
      difficulty: Difficulty.Hard,
      explanation: "A high Vd signifies massive tissue binding, meaning less drug remains in active blood plasma, extending overall clearance cycles.",
      chapter: "Pharmacological Kinetics"
    }
  ],
  [Subject.Law]: [
    {
      id: "off-law-1",
      text: "In standard common-law tort regimes, which of the following best defines the standard for establishing factual causation under the 'But-For' test?",
      options: [
        "The plaintiff's injury would not have occurred but for the defendant's negligent act or omission",
        "The defendant was the sole adjacent physical actor in proximity to the incident",
        "The defendant violated a statutory criminal code standard",
        "The injury was a highly unlikely, unexpected statistical coincidence"
      ],
      answer: "The plaintiff's injury would not have occurred but for the defendant's negligent act or omission",
      type: QuestionType.MCQ,
      marks: 2,
      difficulty: Difficulty.Medium,
      explanation: "The 'But-For' test isolates the defendant's action. If the injury would have happened anyway regardless of their conduct, factual causation fails.",
      chapter: "Common Law Torts"
    },
    {
      id: "off-law-2",
      text: "Outline the concept of Judicial Review as established in Constitutional law, and describe its role in checking legislative overreach.",
      answer: "Judicial Review is the power of courts to examine and invalidate legislative acts or executive orders that violate written constitutional principles. It preserves constitutional supremacy, ensuring federal statutes align with core foundational charters.",
      type: QuestionType.Short,
      marks: 4,
      difficulty: Difficulty.Hard,
      explanation: "First established under Marbury v. Madison in US jurisprudence, it asserts that the courts have the ultimate duty to interpret and defend the constitution.",
      chapter: "Constitutional Law Foundations"
    }
  ],
  [Subject.Business]: [
    {
      id: "off-bus-1",
      text: "Which of the following describes the pricing strategy where a firm charges a very high initial price that customers who really desire the product will pay, then lowers it over time?",
      options: [
        "Price Skimming Strategy",
        "Penetration Pricing Strategy",
        "Cost-Plus Pricing Model",
        "Dynamic Yield Arbitrage"
      ],
      answer: "Price Skimming Strategy",
      type: QuestionType.MCQ,
      marks: 2,
      difficulty: Difficulty.Easy,
      explanation: "Price skimming recovers initial development expenses by charging premium early adopters before lowering prices to attract more price-sensitive layers.",
      chapter: "Strategic Marketing Pricing"
    },
    {
      id: "off-bus-2",
      text: "Discuss the mechanics and core utility of the Weighted Average Cost of Capital (WACC) in corporate investment appraisal.",
      answer: "WACC represents the average rate of return a company is expected to pay to all its security holders to finance its assets. Computed as: WACC = (E/V * Re) + (D/V * Rd * (1 - Tc)), where Re is cost of equity, Rd is cost of debt, and Tc is corporate tax rate. It serves as the hurdle/discount rate for calculating net present value (NPV) of future corporate cash flows.",
      type: QuestionType.Long,
      marks: 8,
      difficulty: Difficulty.Hard,
      explanation: "Projects yielding returns below the established WACC destroy corporate shareholder value on net, while those exceeding WACC increase it.",
      chapter: "Corporate Finance & WACC"
    }
  ]
};

// Fallback Generators that filter from pre-defined offline banks
export function getOfflineQuestions(subject: Subject, type: string, difficulty: string, count: number): Question[] {
  const bank = OFFLINE_QUESTION_BANK[subject] || OFFLINE_QUESTION_BANK[Subject.Physics];
  
  // Try to find exact matches
  let filtered = bank.filter(q => {
    const matchesStyle = q.type.toLowerCase().includes(type.toLowerCase()) || 
                          type.toLowerCase().includes(q.type.toLowerCase()) ||
                          (type.toLowerCase() === "mcq" && q.type === QuestionType.MCQ);
    return matchesStyle;
  });

  // If no exact type matches, just take general questions from this subject
  if (filtered.length === 0) {
    filtered = bank;
  }

  // Slice to count
  const results = filtered.slice(0, count);
  
  // If we still need more questions, duplicate with modified IDs
  while (results.length < count && bank.length > 0) {
    const template = bank[results.length % bank.length];
    results.push({
      ...template,
      id: `${template.id}-dup-${results.length}`,
      text: `[Offline Practice] ${template.text}`
    });
  }

  return results;
}

export function getOfflineRevisionSheet(subject: Subject, chapter: string) {
  // Return high-quality, customized revision materials matching our pre-defined topics
  const topics: Record<Subject, any> = {
    [Subject.Physics]: {
      chapter: chapter || "Electrostatics & Circuits",
      summary: "• Electrostatic fields describe absolute coulomb force domains under spatial balance.\n• Potential gradient k relates directly to the wire resistance, length, and internal cell voltage.\n• Conductors in equilibrium always hold zero internal electric field; all charge aggregates strictly on external surfaces.\n• Potentiometer setups require driving cell voltage to override any test cell voltage, safeguarding physical balancing.",
      keyFormulasAndTerms: [
        { term: "Coulomb's Force (F)", definitionOrFormula: "F = (1 / 4*pi*epsilon_0) * (q1 * q2 / r^2). Defines the interactive electrostatic vector." },
        { term: "Electric Flux (Phi)", definitionOrFormula: "Phi = Integral(E . dA) = Q_enclosed / epsilon. Expresses net line counts leaving closed spheres." },
        { term: "Drift Velocity (Vd)", definitionOrFormula: "Vd = e * E * tau / m. Governs microscopic electron transport inside metallic meshes." }
      ],
      highYieldConcepts: [
        "Gauss cylinder configurations for infinite line files",
        "Kirchhoff loop mesh calculations containing multi-emf pathways",
        "Temperature dependencies of non-linear semiconductors vs conductor resistors"
      ],
      lastMinuteTips: [
        "Never forget to square the radial separation r in inverse-square calculations.",
        "Ensure all potential values use absolute Volts, and charge matches standard Coulombs.",
        "In loop analysis, traverse resistors in active current directions to denote potential falls cleanly."
      ]
    },
    [Subject.Chemistry]: {
      chapter: chapter || "Reaction Mechanisms & Nomenclature",
      summary: "• SN1 pathways favor tertiary structures due to carbocation stabilization via hyperconjugation.\n• SN2 processes utilize back-side attacks, causing structural inversion (Walden inversion).\n• Bases extract acidic alpha-hydrogens, creating highly reactive resonance-stabilized enolate intermediates.\n• Nucleophiles target electrophilic carbonyl carbon nodes due to electronegativity discrepancies of oxygen bonds.",
      keyFormulasAndTerms: [
        { term: "SN1 Kinetic Equation", definitionOrFormula: "Rate = k * [Alkyl Halide]. Unimolecular first-order rate dependence." },
        { term: "Mesomeric Effect (+M)", definitionOrFormula: "The conjugation of lone pairs (e.g., -NH2, -OH) which pushes pi-densities directly into aromatic rings." },
        { term: "SN2 Transition Form", definitionOrFormula: "A highly congested, planar five-coordinate state requiring polar aprotic systems." }
      ],
      highYieldConcepts: [
        "Steric hindrance limitations in multi-step organic pathways",
        "Identifying stereocenter isomers (enantiomers vs diastereomers)",
        "Enolate ion formation and aldol dehydration cycles under heat"
      ],
      lastMinuteTips: [
        "Check basic conditions: Aldol requires alpha-hydrogens; Cannizzaro requires NO alpha-hydrogens.",
        "Draw full intermediate structures to correctly map the nucleophilic pathway.",
        "Polar protic solvents (like water or ethanol) stabilize carbocations, expediting SN1."
      ]
    },
    [Subject.Mathematics]: {
      chapter: chapter || "Advanced Integration & Differential Models",
      summary: "• First-order linear differential equations are parameterized via the Integrating Factor (I.F.).\n• Rolle's Theorem demands continuity and differentiability across spatial spans before horizontal tangents emerge.\n• The product of (y * I.F.) directly yields the integral of (Q(x) * I.F.) with respect to x.",
      keyFormulasAndTerms: [
        { term: "Integrating Factor (I.F.)", definitionOrFormula: "I.F. = e^(Integral(P(x) dx)). Formulates linear solving constants." },
        { term: "General Formula", definitionOrFormula: "y * I.F. = Integral(Q(x) * I.F. dx) + C." }
      ],
      highYieldConcepts: [
        "Separable variables vs homogeneous coordinates transformations",
        "Locating mean tangents with boundary differential equations"
      ],
      lastMinuteTips: [
        "Remember to evaluate integrating factor exponentials carefully before multiplying.",
        "Include integration constant '+ C' during final antiderivative evaluations."
      ]
    },
    [Subject.ComputerScience]: {
      chapter: chapter || "Graph Theory & Algorithm Complexes",
      summary: "• Recurrence equations correspond directly to internal call structures.\n• Asymptotic bounds measure long-term resource expansion rates, ignoring scalar constants.\n• Priority queues in shortest-path search yield massive speedups over linear scans.",
      keyFormulasAndTerms: [
        { term: "Master Theorem Statement", definitionOrFormula: "T(n) = a * T(n/b) + f(n). Establishes recursion analysis criteria." },
        { term: "Big-O Scale", definitionOrFormula: "f(n) <= c * g(n) for all n >= n0. Represents formal upper boundaries." }
      ],
      highYieldConcepts: [
        "Greedy vs dynamic programming subproblem caching",
        "Identifying negative weight cycles using Bellman-Ford passes"
      ],
      lastMinuteTips: [
        "Verify base cases in recurrence relations prior to expanding induction bounds.",
        "When representing algorithms, make sure list traversals avoid null-pointer nodes."
      ]
    },
    [Subject.Engineering]: {
      chapter: chapter || "Circuits & Mechanical Finite Load Systems",
      summary: "• Active components drive flux; passive elements store or dissipate it.\n• Delta configurations map phases symmetrically without a separate neutral line.\n• Damping terms prevent exponential strain amplitude growth under external cyclic forces.",
      keyFormulasAndTerms: [
        { term: "Equivalent Impedance (Z)", definitionOrFormula: "Z = R + j_X. Resistors and reactive arrays in series form." },
        { term: "Thevenin Impedance (Rth)", definitionOrFormula: "Rth = V_open_circuit / I_short_circuit. Simplifies active ports to clean values." }
      ],
      highYieldConcepts: [
        "Polyphase power configurations and line-to-phase transformations",
        "Stress crack growth prevention in vibrating mechanical frameworks"
      ],
      lastMinuteTips: [
        "Deactivate other sources properly: replace voltage sources with short circuits, current sources with open paths.",
        "Double check phases (sqrt(3) multipliers) in polyphase power formulations."
      ]
    },
    [Subject.Biology]: {
      chapter: chapter || "Cellular Cycles & Translational Biology",
      summary: "• Ribosomes coordinate translation, scanning mRNA from 5' to 3' ends.\n• Translocon structures couple emerging chains into active membrane compartments.\n• Mitochondria inner folds establish dense surface fields supporting respiratory systems.",
      keyFormulasAndTerms: [
        { term: "Translation Balance", definitionOrFormula: "1 Amino Acid requires high-energy phosphate conversions (usually 4 high-energy bonds)." }
      ],
      highYieldConcepts: [
        "Chemiosmotic proton motive force rotators inside ATPase complexes",
        "Identifying codon mismatches during active cellular replication"
      ],
      lastMinuteTips: [
        "Track spatial orientations (intramembrane zones) when modeling mitochondrial cycles.",
        "Check regulatory loops: transcription factors inhibit/promote RNA polymerase bindings."
      ]
    },
    [Subject.Medical]: {
      chapter: chapter || "Therapeutics & Organ Fluid Systems",
      summary: "• Node delays enable complete filling before ventricles trigger pressure flows.\n• Apparent volume measures tissue sequestration rates of complex therapeutic chemicals.",
      keyFormulasAndTerms: [
        { term: "Clearance Volume (Cl)", definitionOrFormula: "Cl = Elimination Rate / Plasma Concentration. Defines physiological filtration speeds." }
      ],
      highYieldConcepts: [
        "AV node delay mechanics and ventricular cardiac outputs",
        "Calculating dosing patterns based on volume profiles and clearance constants"
      ],
      lastMinuteTips: [
        "Verify patient weight parameters before converting volume scales.",
        "Associate specific physiological side-effects with local receptor sites."
      ]
    },
    [Subject.Law]: {
      chapter: chapter || "Torts & Constitutional Boundaries",
      summary: "• Breach duties require demonstrating deviations from standard conduct guidelines.\n• Separation of powers asserts judicial checks are mandatory to preserve charters.",
      keyFormulasAndTerms: [
        { term: "But-For Evaluation", definitionOrFormula: "Injury = f(Negligence). Proves direct factual causal connection." }
      ],
      highYieldConcepts: [
        "Locating proximate causes of complex negligence chains",
        "Sovereign immunity protections under federal jurisdiction boundaries"
      ],
      lastMinuteTips: [
        "Check statutory exceptions clearly before claiming absolute tort liability.",
        "Analyze legislative history when interpreting disputed administrative actions."
      ]
    },
    [Subject.Business]: {
      chapter: chapter || "Market Appraisals & Investments",
      summary: "• Skimming pricing collects premium values before entering broader market layers.\n• Hurdle rates normalize investment valuations, preventing value destruction.",
      keyFormulasAndTerms: [
        { term: "WACC Estimate", definitionOrFormula: "WACC = (E/V * Re) + (D/V * Rd * (1-T)). Expresses average financial capital costs." }
      ],
      highYieldConcepts: [
        "Evaluating Net Present Value under custom discount variables",
        "Competitive advantages and market entry barriers in pricing"
      ],
      lastMinuteTips: [
        "Include the after-tax multiplier (1 - T) for the debt portion in capital models.",
        "Examine price sensitivities of early adopters before executing skimming."
      ]
    }
  };

  return topics[subject] || topics[Subject.Physics];
}

export function getOfflineFlashcards(subject: Subject, branchOrClass?: string) {
  const bank = OFFLINE_QUESTION_BANK[subject] || OFFLINE_QUESTION_BANK[Subject.Physics];
  return bank.map(q => ({
    front: `[Active Recall] ${q.text}`,
    back: q.type === QuestionType.MCQ
      ? `Correct Option: ${q.answer}\n\nExplanation: ${q.explanation}`
      : `${q.answer}\n\nCore Explanation: ${q.explanation}`
  }));
}
