# Cross-Platform Application Category

## Overview
A new research theme and emerging technology category has been added to the system: **Cross-Platform Application**.

## Purpose
This category identifies research focused on cross-platform development technologies and methodologies that enable applications to run on multiple platforms (web, mobile, desktop) from a single codebase.

## Keywords Detected
The system automatically classifies abstracts containing these keywords:

### Platform Keywords
- `cross-platform`, `cross platform`
- `multi-platform`, `multiplatform`
- `web`, `android`, `ios`

### Frameworks & Tools
- **JavaScript Frameworks**: `react`, `vue.js`, `angular`, `node.js`
- **Mobile Cross-Platform**: `react native`, `flutter`, `xamarin`, `ionic`, `cordova`, `phonegap`, `nativescript`

### Design Approaches
- `responsive design`, `responsive web`
- `mobile-first`, `mobile first`
- `progressive web app`, `pwa`

## Implementation

### Research Themes
Cross-Platform Application appears as a research theme in:
- **Admin Dashboard** → Research Insights → Themes & Trends tab
- **Student Dashboard** → Research Insights → Themes & Trends tab

### Emerging Technologies
Cross-Platform Application appears as an emerging technology in:
- **Admin Dashboard** → Research Insights → Emerging Technologies tab
- **Student Dashboard** → Research Insights → Emerging Technologies tab

## Database Migration

### Installation
Run the migration file in your Supabase SQL Editor:
```sql
-- File: cross-platform-application-migration.sql
```

This will:
1. ✅ Update the `auto_assign_research_themes()` trigger function
2. ✅ Update the `auto_assign_emerging_technologies()` trigger function
3. ✅ Classify existing approved abstracts that match the keywords
4. ✅ Apply to all new abstracts upon approval

### What Gets Updated
- **research_themes** array field
- **research_theme** single value field
- **emerging_technologies** array field

## Examples of Abstracts That Will Be Classified

### Example 1: React Native Mobile App
**Title**: "Development of a Mobile Health Monitoring System using React Native"
- **Research Theme**: Cross-Platform Application, Healthcare & Medical Systems
- **Emerging Tech**: Cross-Platform Application, Mobile Technologies

### Example 2: Progressive Web App
**Title**: "E-Commerce PWA with Responsive Design for Multi-Device Support"
- **Research Theme**: Cross-Platform Application, Business & E-Commerce
- **Emerging Tech**: Cross-Platform Application, Web Technologies

### Example 3: Flutter Application
**Title**: "Cross-Platform Student Information System Built with Flutter Framework"
- **Research Theme**: Cross-Platform Application, Student Services & Administration
- **Emerging Tech**: Cross-Platform Application, Frameworks & Programming

## Verification

After running the migration, verify the results:

```sql
-- Check how many abstracts were classified
SELECT 
  COUNT(*) as total_abstracts,
  COUNT(*) FILTER (WHERE 'Cross-Platform Application' = ANY(research_themes)) as theme_classified,
  COUNT(*) FILTER (WHERE 'Cross-Platform Application' = ANY(emerging_technologies)) as tech_classified
FROM abstracts
WHERE status = 'approved';

-- View sample classified abstracts
SELECT 
  title,
  research_themes,
  emerging_technologies
FROM abstracts
WHERE 'Cross-Platform Application' = ANY(research_themes)
   OR 'Cross-Platform Application' = ANY(emerging_technologies)
LIMIT 10;
```

## Impact on Research Insights

### Themes & Trends Tab
- New card will appear showing "Cross-Platform Application" theme
- Shows frequency, growth percentage, trend (up/down/stable)
- Lists related papers and domains
- Displays significance level (high/medium/low)

### Emerging Technologies Tab
- New technology card for "Cross-Platform Application"
- Shows maturity level (experimental/emerging/growing)
- Displays adoption rate and potential score
- Lists key technologies and research opportunities
- Shows related papers count

## Notes
- The category uses regex pattern matching on abstract titles
- Multiple categories can be assigned to a single abstract
- Automatic classification happens when abstracts are approved
- Manual re-classification can be done by re-approving abstracts
- The system is case-insensitive for keyword matching

## Future Enhancements
Consider adding more specific keywords as new cross-platform technologies emerge:
- `.NET MAUI` (Microsoft's cross-platform framework)
- `Kotlin Multiplatform`
- `Capacitor` (Ionic's modern cross-platform runtime)
- `Electron` (desktop cross-platform apps)

## Support
For issues or questions about the Cross-Platform Application category:
1. Check the classification keywords match your abstract title
2. Verify the abstract status is 'approved'
3. Review the Research Insights dashboard for updated data
4. Re-run the migration if needed (safe to run multiple times)
