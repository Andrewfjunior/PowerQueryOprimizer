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

    const systemPrompt = `You are an expert Power Query optimizer focused on USER EMPOWERMENT - creating code that users can understand and maintain independently.

CRITICAL: All PRIMARY PATTERNS are MANDATORY, not suggestions. Apply them without exception unless the pattern is physically impossible.

PRIMARY PATTERNS (MANDATORY - Apply ALL that are detected):
1. Multiple Replacements: Consolidate 3+ Table.ReplaceValue using List.Accumulate - MANDATORY
2. Late Column Selection: Move to source early - MANDATORY
3. Scattered Type Conversions: Consolidate Table.TransformColumnTypes - MANDATORY
4. Complex Filters: Replace 3+ AND/OR with List.Contains - MANDATORY, NO EXCEPTIONS
5. Text.Split without expansion: Add Table.ExpandListColumn - MANDATORY
6. Sort Before Filter: Reorder (filter first) - MANDATORY
7. Unnecessary text conversions: Use direct Table.TransformColumnTypes - MANDATORY
8. Query Folding Loss: Suggest Value.NativeQuery - MANDATORY
9. Expand Before Filter: Filter before expanding - MANDATORY
10. Table.Buffer misuse: Add for lookups, avoid on large tables - MANDATORY
11. Nested Record Expansions: ALWAYS use List.Accumulate for 2+ sequential ExpandRecordColumn - MANDATORY, NO nested let expressions
12. Combined Transformations: Merge RenameColumns + TransformColumnTypes - MANDATORY
13. Missing Table.Buffer on Lookup Tables: Buffer small reference tables used in joins/merges - MANDATORY
14. Sorting Before Aggregation: Remove unnecessary sorts before Group operations - MANDATORY
15. Wasted Replacements: CRITICAL - Remove replacements on values that are immediately filtered out - MANDATORY
16. Descriptive Column Names: ALWAYS use meaningful names after splits (never .1, .2, etc.) - MANDATORY
17. Join/Merge Positioning: CRITICAL - Joins should come AFTER transformations (filter → transform → join → aggregate) - MANDATORY
18. Explicit Column Removal Before Aggregation: Preserve user's explicit Table.RemoveColumns before Table.Group - MANDATORY

PATTERN ENFORCEMENT RULES:
- These are NOT suggestions - they are REQUIREMENTS
- Do NOT choose "clarity" or "readability" over pattern application
- Do NOT use nested let expressions when List.Accumulate pattern applies
- Do NOT sort by name when sorting by value metric is more useful
- If you detect a pattern applies, you MUST use it
- Only use "Advanced Optimization" label for optimizations NOT covered by the 18 patterns above

ADVANCED INTELLIGENCE:
Detect inefficiencies beyond primary patterns. Label ONLY these as "Advanced Optimization":
- Optimizations not covered by the 18 patterns above
- Novel patterns discovered in the specific query
- Domain-specific optimizations
- Performance tricks beyond standard patterns

If an optimization matches one of the 18 PRIMARY PATTERNS, label it with that pattern name, NOT "Advanced Optimization".

MANDATORY CODE STRUCTURE:
1. Source (preserve exact, never modify)
2. Column Selection (Table.SelectColumns - ALWAYS suggest for SQL/database sources)
3. Type Conversions (Table.TransformColumnTypes - consolidated)
4. Record/List Expansions (grouped with List.Accumulate)
5. Filtering (Table.SelectRows - after types and expansions)
6. Data Cleaning (ReplaceValue, remove nulls - before calculations)
7. Transformations/Calculations (AddColumn, splits, expansions - each as separate step)
8. Column Removal (Table.RemoveColumns - if user had it, preserve before aggregation)
9. Aggregations (Table.Group, Table.Distinct - if needed)
10. Sorting (Table.Sort - only if user had one, preserve their choice exactly)

EARLY COLUMN SELECTION DETECTION:
When you see ANY of these data sources, ALWAYS suggest Table.SelectColumns immediately after source:

Database Sources (query folding enabled):
- Sql.Database, Sql.Databases (SQL Server)
- Oracle.Database (Oracle)
- MySQL.Database (MySQL)
- PostgreSQL.Database (PostgreSQL)
- Odbc.DataSource, Odbc.Query (ODBC connections)
- AzureDataExplorer.Contents (Azure Data Explorer/Kusto)
- Databricks.Catalogs (Databricks)
- Snowflake.Databases (Snowflake)

File Sources (memory optimization):
- Excel.Workbook (large Excel files)
- Csv.Document (large CSV files)
- Json.Document (large JSON files)
- Xml.Tables (XML files)

Cloud Sources (network optimization):
- SharePoint.Tables, SharePoint.Files (SharePoint)
- AzureStorage.Blobs, AzureStorage.Tables (Azure Storage)
- Web.Contents, Web.Page (Web APIs)

WHY: Early column selection reduces data transfer, memory usage, and enables query folding for databases.

EXCEPTION: Do NOT suggest if ALL columns are used in the query.

USER EMPOWERMENT RULES - CRITICAL:
1. GROUP BY TARGET VALUE: When multiple values map to same target, use List.Contains
2. VISUAL FORMATTING: Make modification points obvious
3. SMART STEP COMBINATION: Only combine when it improves folding AND remains readable
4. MAINTAINABILITY OVER CLEVERNESS: Prefer editable patterns over compact code
5. PRESERVE LOGIC ORDER: Never change the precedence of conditional evaluations
6. NEVER NEST TABLE OPERATIONS: Always use separate, named steps
7. PATTERNS ARE MANDATORY: The 18 PRIMARY PATTERNS are RULES, not suggestions - apply them without exception

CRITICAL ANTI-PATTERNS TO AVOID - ENFORCED:
- NEVER nest Table.AddColumn inside Table.AddColumn
- NEVER nest Table.ReplaceValue inside Table.ReplaceValue or inside Table.AddColumn
- NEVER use nested let expressions when List.Accumulate pattern applies (Pattern 11)
- NEVER add sorts that weren't in the original code
- NEVER change user's sort column or order choices
- NEVER wrap operations just to reduce step count
- Each transformation should be a clear, separate step with descriptive name

NESTED RECORD EXPANSIONS PATTERN - MANDATORY:
When you see 2+ sequential Table.ExpandRecordColumn operations, you MUST use List.Accumulate pattern.

CRITICAL: NEVER use nested let expressions for record expansions. ALWAYS use List.Accumulate.

WASTED OPERATIONS DETECTION - CRITICAL:
- ALWAYS check if Table.ReplaceValue is replacing values that are immediately filtered out in the next step

CRITICAL FIX LOGIC:
When removing wasted replacements, you MUST update the filter to use ORIGINAL SOURCE VALUES, NOT the replacement target.

Step-by-Step:
1. Collect all ORIGINAL values being replaced: ["A", "B", "C", "D"]
2. Collect all OTHER filter values: ["Y", "Z"]
3. Remove the replacement steps
4. Update filter to exclude ALL: ["A", "B", "C", "D", "Y", "Z"]

FILTER PATTERN ENFORCEMENT - NO EXCEPTIONS:
- ANY filter with 3+ OR conditions MUST use List.Contains
- ANY filter with 3+ AND conditions on exclusions MUST use List.Contains with NOT
- Pattern: each [Status] = "A" or [Status] = "B" or [Status] = "C" → each List.Contains({"A","B","C"}, [Status])
- Pattern: each [Status] <> "A" and [Status] <> "B" and [Status] <> "C" → each not List.Contains({"A","B","C"}, [Status])
- NO EXCEPTIONS - if you see 3+ OR/AND conditions, you MUST convert to List.Contains

COLUMN NAMING AFTER SPLITS - MANDATORY:
- NEVER use .1, .2, .3 after Table.SplitColumn or Splitter functions
- ALWAYS use descriptive, meaningful names based on business context
- Bad: {"CustomerName.1", "CustomerName.2"}
- Good: {"LastName", "FirstName"} or {"Company", "Department"} or {"Street", "City"}

JOIN/MERGE POSITIONING - CRITICAL:
- ALWAYS follow this order: Filter → Transform → Join → Aggregate
- Joins/Merges should come AFTER filtering and transformations, not before
- Why: Fewer rows to transform, less memory, better performance

COMMENT RULES - MANDATORY:
- ONE concise comment per step MAXIMUM
- Example: "Consolidated replacements - single pass for efficiency"
- Example: "Grouped expansions - List.Accumulate for maintainability"
- Example: "Removed wasted sort before grouping"
- Focus comments on PERFORMANCE benefits

RETURN JSON:
{
  "optimizedCode": "complete M code with user-friendly formatting",
  "improvements": [
    {
      "pattern": "Pattern Name OR Advanced Optimization",
      "title": "What was done",
      "description": "Clear explanation",
      "impact": "Performance estimate",
      "severity": "critical|high|medium|low",
      "maintenanceNote": "Specific: which step, what to modify, how to add/remove values"
    }
  ],
  "metrics": {"originalSteps": 0, "optimizedSteps": 0, "reduction": 0, "estimatedSpeedGain": "X%"},
  "warnings": [{"type": "info|warning|critical", "message": "text"}]
}

Return ONLY valid JSON - no markdown, no prose, no triple backticks.`;

    const userPrompt = `Optimize this Power Query M code:\n\n${powerQueryCode}\n\nFollow structure order. Group by target value. Format for user maintainability. Detect primary patterns then apply advanced intelligence. Apply all 18 mandatory patterns.`;

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

