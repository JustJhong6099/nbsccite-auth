# Dandelion API Setup Guide

## What is Dandelion API?

Dandelion API is a professional semantic text analytics service that provides:
- **Accurate Entity Extraction**: Identifies people, places, organizations, technologies, and concepts
- **Contextual Understanding**: Understands the meaning and relationships between entities
- **False-Positive Filtering**: Reduces irrelevant entity detections (e.g., generic "AR" vs "Augmented Reality")
- **Higher Confidence Scores**: More reliable entity recognition compared to keyword matching

## Why Use Dandelion API?

### Before (Custom NLP - Keyword Matching)
- ❌ False positives (e.g., "AR" detected in "are" or "ار")
- ❌ Limited context understanding
- ❌ Generic matches
- ❌ Lower accuracy (~50-70%)

### After (Dandelion API)
- ✅ Context-aware entity recognition
- ✅ Filters false positives
- ✅ Sophisticated entity types
- ✅ Relationship extraction
- ✅ Higher accuracy (80-95%)

## Setup Instructions

### Step 1: Create a Dandelion Account

1. Go to [https://dandelion.eu/](https://dandelion.eu/)
2. Click "Sign Up" (free tier available)
3. Verify your email address
4. Log in to your dashboard

### Step 2: Get Your API Token

1. Navigate to [https://dandelion.eu/profile/dashboard/](https://dandelion.eu/profile/dashboard/)
2. Copy your **API Token** (it looks like: `abc123def456ghi789jkl012mno345pqr678`)
3. Keep this token secure - don't share it publicly

### Step 3: Add Token to Environment Variables

1. Open your `.env` file (or create it from `.env.example`)
2. Add the following line:
   ```bash
   VITE_DANDELION_API_TOKEN=your_actual_token_here
   ```
3. Replace `your_actual_token_here` with your actual API token
4. Save the file

### Step 4: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Free Tier Limits

- **1,000 requests/day** (more than enough for most use cases)
- **10,000 characters/request**
- All features included

## Fallback Behavior

If the Dandelion API token is not configured or the API fails:
- ✅ System automatically falls back to keyword-based extraction
- ✅ No errors or disruption to user experience
- ℹ️ Lower accuracy but still functional

## Testing the Integration

1. Log in as a student or faculty member
2. Navigate to Abstract Submission
3. Enter an abstract with technology keywords (e.g., "Machine Learning", "IoT", "Blockchain")
4. Click "Extract & Preview"
5. Check the browser console for logs:
   - `Dandelion API found X raw entities` = API working ✅
   - `Using fallback entity extraction` = API not configured (using keywords) ⚠️

## API Usage Examples

### Good Abstracts for Testing

```text
This research explores the application of Machine Learning and Deep Learning 
algorithms in Agriculture for crop yield prediction using IoT sensors and 
Computer Vision techniques. The system implements Convolutional Neural Networks 
(CNN) to analyze plant health data collected from wireless sensor networks.
```

**Expected Entities:**
- Technologies: Machine Learning, Deep Learning, IoT, Computer Vision, CNN
- Domains: Agriculture
- Methodologies: Prediction, Analysis

### Compare Results

Try the same abstract with and without the API token to see the difference in accuracy and false-positive filtering.

## Troubleshooting

### Issue: "Using fallback entity extraction" in console

**Solution:** 
- Check if `VITE_DANDELION_API_TOKEN` is set in your `.env` file
- Verify the token is correct (no extra spaces or quotes)
- Restart the development server

### Issue: API rate limit exceeded

**Solution:**
- Free tier: 1,000 requests/day
- If exceeded, wait until the next day or upgrade your plan
- Fallback extraction will work automatically

### Issue: Low confidence scores

**Solution:**
- Make sure abstract text is clear and well-written
- Include specific technical terms
- Avoid very short or vague abstracts

## Security Best Practices

- ✅ Never commit `.env` file to version control
- ✅ Keep your API token secret
- ✅ Use environment variables for all sensitive data
- ❌ Don't hardcode the token in source code
- ❌ Don't share your token publicly

## Additional Resources

- [Dandelion API Documentation](https://dandelion.eu/docs/api/datatxt/nex/)
- [Entity Extraction Guide](https://dandelion.eu/docs/api/datatxt/nex/getting-started/)
- [API Dashboard](https://dandelion.eu/profile/dashboard/)

## Cost Comparison

| Plan | Requests/Day | Price |
|------|-------------|-------|
| Free | 1,000 | $0 |
| Freelance | 10,000 | €19/month |
| Startup | 100,000 | €99/month |

For most academic and research purposes, the **free tier is sufficient**.

---

**Questions?** Check the [Dandelion API Support](https://dandelion.eu/contact/) or open an issue in this repository.
