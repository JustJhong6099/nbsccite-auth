# Testing Guide: Entity Extraction Workflow

## Prerequisites
- ✅ Development server running on `http://localhost:8081`
- ⚠️ Database schema NOT yet applied (see Database Setup section)
- ✅ All TypeScript files compiled without errors
- ✅ Entity extraction utility ready

## Quick Test (Without Database)

### 1. Navigate to Student Dashboard
1. Open `http://localhost:8081`
2. Login as a student (or navigate to student dashboard)
3. Go to "Abstract Submission" section

### 2. Test Entity Extraction

#### Sample Abstract to Test With:
```
This research presents an IoT-based smart farming system using Machine Learning 
algorithms for crop yield prediction in the agriculture sector. We implemented 
a Convolutional Neural Network (CNN) model trained with supervised learning 
techniques. The system utilizes sensor networks and cloud computing platforms 
to collect and analyze environmental data in real-time. Our experimental 
methodology includes data collection from multiple farms, predictive analytics 
using Python and TensorFlow, and validation through comparative studies. Results 
show 92% accuracy in predicting crop health using computer vision and deep 
learning approaches.
```

#### Expected Entities:
**Technologies** (Blue badges):
- IoT
- Machine Learning
- Neural Networks
- CNN
- Sensor
- Cloud Computing
- Python
- TensorFlow
- Computer Vision
- Deep Learning

**Domains** (Purple badges):
- Smart Farming
- Agriculture

**Methodologies** (Green badges):
- Supervised Learning
- Predictive Analytics
- Data Collection
- Comparative Study

**Confidence**: ~0.90-0.95 (90-95%)

### 3. Testing Steps

#### Step 1: Fill the Form
1. **Title**: "IoT-Based Smart Farming with Machine Learning"
2. **Authors**: "John Doe, Jane Smith, Dr. Robert Brown"
3. **Year**: 2025
4. **Abstract**: Paste the sample abstract above
5. **Keywords**: Add "IoT", "Machine Learning", "Agriculture"

#### Step 2: Extract Entities
1. Click **"Extract & Preview"** button
2. Wait for extraction (should be instant)
3. Verify toast notification: "Extracted X entities with Y% confidence"

#### Step 3: Review Preview Modal
1. Modal should open automatically
2. Check sections:
   - ✅ Title displays correctly
   - ✅ Authors display correctly
   - ✅ Abstract text is shown in full
   - ✅ Keywords appear as blue badges
   - ✅ "Extracted Entities" section visible
   - ✅ Confidence badge shows (e.g., "92% Confidence")
   - ✅ Technologies section has blue badges
   - ✅ Research Domains section has purple badges
   - ✅ Methodologies section has green badges
   - ✅ Entity Relationship Graph renders
   - ✅ Graph shows center "Abstract" node
   - ✅ Graph shows entity nodes connected to center
   - ✅ Nodes have proper colors (blue center, purple entities)

#### Step 4: Test Submit (Currently Mock)
⚠️ **Note**: Submission will NOT save to database until schema is applied
1. Click **"Confirm & Submit"**
2. Wait for loading (2 seconds mock delay)
3. Verify success toast: "Abstract submitted for review!"
4. Form should reset
5. Modal should close

## Visual Checks

### Entity Graph Characteristics
- **Layout**: Force-directed (nodes spread organically)
- **Center Node**: Blue circle, labeled "Abstract", larger size
- **Entity Nodes**: Purple circles, labeled with entity names, smaller size
- **Links**: Gray lines connecting entities to center
- **Animation**: Nodes should "settle" into position (physics simulation)
- **Spacing**: Nodes should not overlap (collision detection)

### Badge Color Coding
- **Blue** (`bg-blue-50 text-blue-700`): Technologies
- **Purple** (`bg-purple-50 text-purple-700`): Research Domains
- **Green** (`bg-green-50 text-green-700`): Methodologies

### Modal Responsiveness
- Modal should be scrollable if content is long
- Maximum width: `max-w-4xl`
- Maximum height: `max-h-[90vh]`
- Buttons: "Cancel" (outline) and "Confirm & Submit" (green)

## Test Cases

### Test Case 1: Minimal Abstract
**Input**:
```
Title: "Basic Study"
Abstract: "This is a simple test."
```
**Expected**: 
- Low confidence (0.50-0.60)
- Few or no entities extracted
- Graph with only center node
- Message: "None detected" in entity categories

### Test Case 2: Rich Abstract
**Input**: Use the sample abstract above
**Expected**:
- High confidence (0.90-0.95)
- 10+ technologies
- 2-3 domains
- 3-4 methodologies
- Complex graph with many nodes

### Test Case 3: Keywords Included
**Input**: Abstract + Keywords matching entities
**Expected**:
- Keywords used in extraction process
- Slightly higher confidence
- Keywords appear in extracted entities

### Test Case 4: No Abstract
**Input**: Empty abstract field
**Expected**:
- "Extract & Preview" button disabled
- If clicked, error toast: "Please fill in title and abstract first"

## Edge Cases to Test

1. **Very Long Abstract** (>500 words)
   - Should still extract entities
   - Modal should be scrollable
   - Graph might have 20+ nodes

2. **Special Characters**
   - Abstract with symbols: @, #, $, %
   - Should handle gracefully
   - Entities still extracted correctly

3. **Multiple Authors**
   - Comma-separated list
   - Should display correctly in preview

4. **Rapid Clicks**
   - Click "Extract & Preview" multiple times
   - Should disable button during extraction
   - No duplicate modals

## Database Setup (Next Phase)

### Apply Schema
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `abstract-entity-schema.sql`
4. Run the SQL
5. Verify tables created:
   ```sql
   SELECT * FROM abstracts LIMIT 1;
   ```

### Update Submission Handler
Once schema is applied, uncomment database code in `AbstractSubmission.tsx`:

```typescript
// In handleSubmit() function, uncomment:
const { data, error } = await supabase.from('abstracts').insert({
  title: formData.title,
  authors: formData.authors.split(',').map(a => a.trim()),
  abstract_text: formData.abstract,
  keywords: formData.keywords,
  year: parseInt(formData.year),
  extracted_entities: extractedEntities,
  entity_extraction_confidence: extractedEntities?.confidence,
  status: 'pending'
});
```

### Test Database Integration
1. Submit an abstract
2. Check Supabase:
   ```sql
   SELECT id, title, status, extracted_entities 
   FROM abstracts 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```
3. Verify JSONB structure:
   ```sql
   SELECT extracted_entities->'technologies' AS techs
   FROM abstracts
   WHERE id = 'your-id';
   ```

## Troubleshooting

### Issue: Entities not extracting
**Solution**: 
- Check console for errors
- Verify abstract has recognizable keywords
- Try sample abstract above

### Issue: Graph not rendering
**Solution**:
- Check if `svgRef.current` exists
- Verify D3.js is installed: `npm list d3`
- Check browser console for SVG errors

### Issue: Modal not opening
**Solution**:
- Check `showSubmitModal` state
- Verify Dialog component imported correctly
- Check for JavaScript errors in console

### Issue: Confidence always 0.50
**Solution**:
- Abstract likely has no matching keywords
- Try adding technical terms
- Use sample abstract for testing

## Browser Console Debugging

### Check Entity Extraction
```javascript
// In browser console after extraction:
// Should see: { technologies: [...], domains: [...], ... }
```

### Check D3 Graph
```javascript
// In browser console:
document.querySelector('svg') // Should return SVG element
d3.selectAll('circle').size() // Should return node count
```

## Success Criteria

✅ Entity extraction completes in <1 second  
✅ Modal opens showing all extracted data  
✅ Graph renders with proper layout  
✅ Badges color-coded correctly  
✅ Confidence score displays  
✅ Submit triggers success message  
✅ Form resets after submission  
✅ No console errors  
✅ UI responsive on mobile  

## Next Phase Testing

After faculty review integration:
1. Submit abstract (status='pending')
2. Login as faculty
3. Open "Student Reviews" tab
4. Click review on pending abstract
5. Verify entities display in review modal
6. Verify graph shows in review modal
7. Click "Approve"
8. Verify status updates to 'approved'
9. Check "Abstracts Library" tab
10. Verify approved abstract appears

---

**Current Status**: ✅ Student submission ready for testing  
**Database Status**: ⚠️ Schema not yet applied  
**Next Step**: Apply `abstract-entity-schema.sql` to enable full integration
