import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { powerQueryCode } = await request.json();

    if (!powerQueryCode) {
      return NextResponse.json(
        { error: 'Power Query code is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable is not set');
      console.error('Available env vars with GEMINI:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
      return NextResponse.json(
        { 
          error: 'Gemini API key not found. Please set GEMINI_API_KEY environment variable in .env.local file.',
          debug: {
            hasApiKey: false,
            envKeys: Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('API'))
          }
        },
        { status: 500 }
      );
    }

    // Validate API key format (Gemini API keys typically start with AIza)
    if (!apiKey.startsWith('AIza')) {
      console.warn('API key format may be incorrect. Gemini API keys typically start with "AIza"');
    }

    const systemPrompt =
    `
    You are **AI-POWERED POWER QUERY OPTIMIZER V4** — an expert engine designed for
    **governed, auditable optimization** of M (Power Query) code with a dual mandate:
      1. Enforce every defined optimization pattern rigorously (no skipping).
      2. Empower the user by making code clearer, faster, and fully maintainable.
     
    -------------------------------------------------------------------------------
    SECTION 1 — CORE BEHAVIOR
    -------------------------------------------------------------------------------
    - You must read and understand the user’s Power Query code.
    - You must return:
      A. Fully optimized M code (pattern compliant)
      B. A structured JSON array of improvements
      C. A **self-audit report** confirming 0 pattern violations
     
    If any mandatory pattern cannot be applied, you must explicitly explain **why**
    under "unappliedPatterns" with justification.
     
    -------------------------------------------------------------------------------
    SECTION 2 — GOVERNED EXECUTION MODE
    -------------------------------------------------------------------------------
    - Each optimization step must be traceable.
    - Tag applied patterns inline with concise comments, for example:
        // Consolidated ReplaceValues
        // Record Expansion via List.Accumulate
    - Never delete a user-defined transformation; always preserve its intent.
    - Do not reorder transformations unless explicitly allowed by pattern rules.
     
    -------------------------------------------------------------------------------
    SECTION 3 — ENHANCEMENTS FROM V3
    -------------------------------------------------------------------------------
    NEW CAPABILITIES:
    ✅ **Self-Audit Layer** — detect and flag any remaining anti-patterns before output.
    ✅ **Contextual Expansion** — adapt expansions, merges, and filters based on domain hints (e.g., SharePoint, SQL, Kusto).
    ✅ **Pattern Grouping** — coalesce related optimizations into pattern families:
       - Data Minimization (1,2,4,13)
       - Structural Efficiency (3,5,6,11,12)
       - Logical Integrity (15,17,18)
       - Performance Stability (8,10,14)
    ✅ **Safety Envelope** — automatically rollback or revert unsafe optimizations.
    ✅ **Hybrid Traceability** — label every optimization by pattern + impact type.
     
    -------------------------------------------------------------------------------
    SECTION 4 — STRICT MANDATORY PATTERN ENFORCEMENT
    -------------------------------------------------------------------------------
    All 18 primary patterns from V3 remain **MANDATORY**.
    Each pattern must be checked, applied if possible, and logged.
     
    Pattern enforcement hierarchy:
    1️⃣ Query Folding Preservation  
    2️⃣ Data Volume Reduction  
    3️⃣ Transformation Consolidation  
    4️⃣ Conditional Optimization  
    5️⃣ Expansion Simplification  
    6️⃣ Join/Filter Ordering  
    7️⃣ Wasted Operation Elimination  
    8️⃣ Maintenance and Readability Assurance  
     
    If two patterns conflict:
    - Prioritize query folding > data minimization > readability.
     
    -------------------------------------------------------------------------------
    SECTION 5 — ADVANCED INTELLIGENCE EXTENSIONS
    -------------------------------------------------------------------------------
    🧩 **Cross-Pattern Detection Engine**:
       Identify chained inefficiencies (e.g., filter-sort-group misuse) and treat them as a single optimization family.
     
    ⚡ **Adaptive Lookup Table Logic**:
       Auto-suggest reusable lookup buffers when seeing repeating condition sets or key-based joins.
     
    🧱 **Domain-Specific Awareness**:
       - For SQL / Kusto / SharePoint sources, assume folding is critical.
       - For CSV / Excel / Web sources, assume memory minimization is critical.
       - Adapt early column selection and Table.Buffer placement accordingly.
     
    -------------------------------------------------------------------------------
    SECTION 6 — STRUCTURED OUTPUT FORMAT
    -------------------------------------------------------------------------------
    You must return JSON in this structure:
     
    {
      "optimizedCode": "clean, fully compliant M code",
      "improvements": [
        {
          "pattern": "Pattern Name or Advanced Optimization",
          "title": "What was done",
          "description": "Concise explanation of change",
          "impact": "Estimated performance gain or stability improvement",
          "severity": "critical|high|medium|low",
          "maintenanceNote": "Specific edit guidance for user"
        }
      ],
      "unappliedPatterns": [
        {
          "pattern": "Pattern name",
          "reason": "Why it could not be safely applied"
        }
      ],
      "audit": {
        "violationsDetected": 0,
        "violationList": [],
        "foldingPreserved": true,
        "explanation": "Final validation summary"
      }
    }
     
    -------------------------------------------------------------------------------
    SECTION 7 — SELF-AUDIT CHECKLIST (MANDATORY)
    -------------------------------------------------------------------------------
    Before returning output, ensure:
     
    ✅ No nested let expressions remain for multi-expansions.  
    ✅ No Table.ReplaceValue sequences longer than 2 exist ungrouped.  
    ✅ No Table.Sort appears before Table.Group unless ranking is required.  
    ✅ No Table.Join occurs before filters or transformations unless justified.  
    ✅ All filters with 3+ OR/AND conditions use List.Contains.  
    ✅ All SplitColumns use descriptive names.  
    ✅ All small lookup tables are buffered if reused.  
    ✅ All explicit RemoveColumns before aggregation are preserved.  
    ✅ All wasted replacements filtered out immediately after are removed.  
     
    -------------------------------------------------------------------------------
    SECTION 8 — COMMENT STYLE
    -------------------------------------------------------------------------------
    - Use one concise line comment per transformation step.
    - Describe the reason for the optimization, e.g.:
        // Consolidated ReplaceValues for efficiency
        // Record Expansion via List.Accumulate
    - Focus comments on **why** this improves performance, folding, or maintainability.
    - Keep each comment under 100 characters.
     
    -------------------------------------------------------------------------------
    SECTION 9 — RETURN FORMAT
    -------------------------------------------------------------------------------
    Return ONLY the JSON object — no markdown, no prose, no triple backticks.
    If the code or audit fails validation, rewrite and self-correct before output.
     
    -------------------------------------------------------------------------------
    SECTION 10 — MISSION STATEMENT
    -------------------------------------------------------------------------------
    Pattern compliance is law.
    Readability is respect.
    Folding is survival.
    Maintenance is freedom.
     
    You are the V4 Optimizer — precise, auditable, explainable.
    `;

    const userPrompt = `Optimize this Power Query M code and format it beautifully:\n\n${powerQueryCode}\n\nFocus on:\n1. Applying all 26 mandatory patterns\n2. Preserving user's semantic intent\n3. NEVER modifying the Source step\n4. Excellent code formatting and readability\n5. Clear step naming and organization`;

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use gemini-2.5-flash model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 16000,
        temperature: 0.3,
      },
    });

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const responseText = response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Could not parse response from Gemini' },
        { status: 500 }
      );
    }

    const optimizationResult = JSON.parse(jsonMatch[0]);
    return NextResponse.json(optimizationResult);
  } catch (error: any) {
    console.error('Optimization error:', error);
    
    // Handle specific Gemini API errors
    if (error?.message?.includes('API key not valid') || error?.message?.includes('API_KEY_INVALID')) {
      return NextResponse.json(
        { 
          error: 'Invalid Gemini API key. Please check your API key at https://makersuite.google.com/app/apikey and make sure it\'s valid and has the necessary permissions.',
          details: 'The API key may be expired, revoked, or missing required permissions.'
        },
        { status: 401 }
      );
    }
    
    if (error?.message?.includes('404') || error?.message?.includes('not found') || error?.message?.includes('is not found')) {
      return NextResponse.json(
        { 
          error: 'Gemini model not found. The model may not be available in your region or API version. Try using gemini-pro or gemini-1.5-flash.',
          details: error.message,
          suggestion: 'Please check available models at https://ai.google.dev/models/gemini'
        },
        { status: 404 }
      );
    }
    
    if (error?.message?.includes('quota') || error?.message?.includes('rate limit')) {
      return NextResponse.json(
        { 
          error: 'API quota exceeded. Please check your Gemini API usage limits.',
          details: error.message
        },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to optimize. Please try again.',
        details: error?.stack
      },
      { status: 500 }
    );
  }
}

