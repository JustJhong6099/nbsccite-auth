# Entity Extraction Workflow

## Overview
This document describes the complete automated entity extraction workflow implemented in the NBSCCITE Abstract Submission System.

## Workflow Steps

### 1. Student Abstract Submission
**File**: `src/components/student/AbstractSubmission.tsx`

**Process**:
1. Student fills out the abstract submission form:
   - Title (required)
   - Authors (optional)
   - Year (dropdown)
   - Abstract Text (required)
   - Keywords (optional)

2. Student clicks **"Extract & Preview"** button

3. System automatically:
   - Extracts entities from abstract text using keyword matching
   - Identifies:
     * **Technologies**: ML, AI, IoT, Cloud Computing, etc.
     * **Research Domains**: Agriculture, Healthcare, Education, etc.
     * **Methodologies**: Supervised Learning, Classification, Survey, etc.
   - Calculates confidence score (0.50 - 0.95)
   - Builds entity relationship graph using D3.js

4. Preview modal opens showing:
   - Full abstract details
   - Extracted entities organized by category with color coding:
     * Blue badges: Technologies
     * Purple badges: Research Domains
     * Green badges: Methodologies
   - Confidence score
   - Interactive entity graph visualization

5. Student reviews and clicks **"Confirm & Submit"**

6. Abstract saved to database with:
   - All form fields
   - `extracted_entities` (JSONB)
   - `entity_extraction_confidence` (decimal)
   - `status: 'pending'`
   - `submitted_date: NOW()`

### 2. Faculty/Admin Review
**File**: `src/components/faculty/StudentAbstractReview.tsx` (to be updated)

**Process**:
1. Faculty opens "Student Reviews" tab
2. Sees list of pending abstracts
3. Clicks "Review" on an abstract
4. Review modal displays:
   - Student name and abstract title
   - Full abstract text
   - Keywords
   - **Extracted entities** (from database):
     * Technologies (blue badges)
     * Research Domains (purple badges)
     * Methodologies (green badges)
   - **Entity relationship graph** (D3.js visualization)
   - Confidence score
5. Faculty reviews and clicks:
   - **Approve**: Updates `status='approved'`, sets `reviewed_date=NOW()`
   - **Reject**: Updates `status='rejected'`, sets `reviewed_date=NOW()`

### 3. Approved Abstracts Library
**File**: `src/components/student/AbstractsLibrary.tsx` (to be updated)

**Process**:
1. Query database for `status='approved'`
2. Display approved abstracts with:
   - Title, authors, year
   - Abstract preview
   - Keywords
   - **Extracted entities** visible in detail view
3. Faculty can edit/delete (when `isFacultyMode={true}`)
4. Auto-refreshes when new abstracts are approved

## Technical Implementation

### Entity Extraction Algorithm
**File**: `src/lib/entity-extraction.ts`

**Keyword Databases**:
- **Technologies**: 40+ keywords (ML, AI, IoT, etc.)
- **Domains**: 30+ keywords (Agriculture, Healthcare, etc.)
- **Methodologies**: 20+ keywords (Supervised Learning, etc.)

**Functions**:
```typescript
// Extract matching keywords from text
extractEntities(text: string, keywords: string[]): string[]

// Calculate confidence based on entity count
calculateConfidence(techCount: number, domainCount: number, methodCount: number): number

// Main extraction function
performEntityExtraction(abstractText: string, keywordsArray: string[]): ExtractedEntities

// Format entities for display
formatExtractedEntities(entities: ExtractedEntities): string

// Get flat array for visualization
getAllEntities(entities: ExtractedEntities): string[]
```

**Confidence Scoring**:
- Base: 0.50
- +0.15 per technology (max 3)
- +0.10 per domain (max 3)
- +0.05 per methodology (max 3)
- Max confidence: 0.95

### Database Schema
**File**: `abstract-entity-schema.sql`

**Table**: `abstracts`
```sql
CREATE TABLE abstracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  authors TEXT[],
  abstract_text TEXT NOT NULL,
  keywords TEXT[],
  year INTEGER,
  department TEXT,
  category TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, needs-revision
  extracted_entities JSONB, -- {technologies: [], domains: [], methodologies: [], confidence: 0.92}
  entity_extraction_confidence DECIMAL(3,2),
  submitted_by UUID REFERENCES auth.users(id),
  submitted_date TIMESTAMP DEFAULT NOW(),
  reviewed_date TIMESTAMP,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**JSONB Structure**:
```json
{
  "technologies": ["Machine Learning", "IoT", "Cloud Computing"],
  "domains": ["Agriculture", "Smart Farming"],
  "methodologies": ["Supervised Learning", "Data Analysis"],
  "confidence": 0.92
}
```

**RLS Policies**:
- Students: View/insert/update **own** pending abstracts
- Faculty: View/update/delete **all** abstracts
- Everyone: View **approved** abstracts

### Entity Visualization
**Library**: D3.js v7.9.0

**Implementation**:
- Force-directed graph layout
- Center node: "Abstract"
- Entity nodes: Connected to center
- Color coding:
  * Blue: Technologies
  * Purple: Domains
  * Green: Methodologies
- Interactive: Nodes repel each other for clarity

## File Changes Summary

### Modified Files:
1. **`src/components/student/AbstractSubmission.tsx`**
   - Added entity extraction state management
   - Added `handleExtractEntities()` function
   - Added `buildEntityGraph()` for D3 visualization
   - Changed submit button to "Extract & Preview"
   - Added submission modal with entity preview
   - Updated `handleSubmit()` to save extracted data

2. **`src/lib/entity-extraction.ts`**
   - Exported `ExtractedEntities` interface

### Created Files:
3. **`abstract-entity-schema.sql`**
   - Complete database schema
   - RLS policies
   - Indexes and triggers

4. **`src/lib/entity-extraction.ts`**
   - Entity extraction utility
   - Keyword databases
   - Extraction algorithms

### To Be Updated:
5. **`src/components/faculty/StudentAbstractReview.tsx`**
   - Fetch abstracts from database
   - Display extracted entities
   - Show entity graph visualization
   - Update status on approve/reject

6. **`src/components/student/AbstractsLibrary.tsx`**
   - Fetch from database WHERE status='approved'
   - Display extracted entities in detail view
   - Auto-refresh on new approvals

## Next Steps

1. **Apply Database Schema**:
   ```bash
   # Run in Supabase SQL Editor
   cat abstract-entity-schema.sql
   ```

2. **Update Faculty Review Component**:
   - Fetch pending abstracts from database
   - Display extracted_entities from JSONB
   - Add entity graph visualization
   - Update status on approve/reject

3. **Update Abstracts Library**:
   - Replace mock data with database query
   - Filter by status='approved'
   - Show extracted entities

4. **Test Complete Flow**:
   - Submit abstract → entity extraction → save
   - Review → view entities → approve
   - Library → see approved with entities

## Benefits

✅ **Automated**: No manual entity tagging required  
✅ **Consistent**: Same algorithm for all abstracts  
✅ **Fast**: Instant extraction on submission  
✅ **Visual**: Interactive graphs aid understanding  
✅ **Accurate**: Confidence scores indicate quality  
✅ **Persistent**: All data saved to database  
✅ **Searchable**: JSONB queries for entity filtering  
✅ **Scalable**: Keyword database easily expandable  

## Future Enhancements

- [ ] Machine Learning-based entity extraction (NER models)
- [ ] Custom entity categories per department
- [ ] Entity-based abstract recommendations
- [ ] Trend analysis across abstracts
- [ ] Entity co-occurrence analysis
- [ ] Export entity graphs as images
- [ ] Multi-language support for entity extraction
