/**
 * PDF Export Utility
 * Generates comprehensive data reports from Faculty Dashboard
 */

import jsPDF from 'jspdf';
import { supabase } from './supabase';
import { normalizeTerm, getTopTermsByCategory } from './data-normalization';

interface PDFExportOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
}

interface DashboardData {
  stats: {
    totalAbstracts: number;
    totalApproved: number;
    approvedAbstracts: number;
    pendingReviews: number;
    rejectedAbstracts: number;
    totalEntitiesExtracted: number;
  };
  submissionTrends: Array<{
    period: string;
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  }>;
  entityDistribution: {
    technologies: number;
    domains: number;
    methodologies: number;
    total: number;
  };
  topResearchTrends: {
    domains: Array<{ name: string; count: number; percentage: string }>;
    technologies: Array<{ name: string; count: number; percentage: string }>;
    methodologies: Array<{ name: string; count: number; percentage: string }>;
  };
}

/**
 * Fetch all dashboard data from Supabase
 */
async function fetchDashboardData(): Promise<DashboardData> {
  try {
    // Fetch total abstracts count
    const { count: totalAbstracts, error: totalError } = await supabase
      .from('abstracts')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Fetch pending approvals count
    const { count: pendingReviews, error: pendingError } = await supabase
      .from('abstracts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingError) throw pendingError;

    // Fetch rejected abstracts count
    const { count: rejectedAbstracts, error: rejectedError } = await supabase
      .from('abstracts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected');

    if (rejectedError) throw rejectedError;

    // Fetch all abstracts for detailed analytics
    const { data: abstracts, error: abstractsError } = await supabase
      .from('abstracts')
      .select('*')
      .order('submitted_date', { ascending: true });

    if (abstractsError) throw abstractsError;

    // Calculate approved count
    const approvedAbstracts = abstracts?.filter(a => a.status === 'approved').length || 0;

    // Calculate entity counts (approved abstracts only)
    let techCount = 0;
    let domainCount = 0;
    let methodCount = 0;

    abstracts?.forEach(abstract => {
      if (abstract.status === 'approved' && abstract.extracted_entities) {
        techCount += abstract.extracted_entities.technologies?.length || 0;
        domainCount += abstract.extracted_entities.domains?.length || 0;
        methodCount += abstract.extracted_entities.methodologies?.length || 0;
      }
    });

    // Group submissions by month for trends
    const submissionsByMonth: { [key: string]: { total: number; approved: number; pending: number; rejected: number } } = {};
    
    abstracts?.forEach(abstract => {
      const date = new Date(abstract.submitted_date);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      if (!submissionsByMonth[monthKey]) {
        submissionsByMonth[monthKey] = { total: 0, approved: 0, pending: 0, rejected: 0 };
      }
      
      submissionsByMonth[monthKey].total++;
      if (abstract.status === 'approved') submissionsByMonth[monthKey].approved++;
      if (abstract.status === 'pending') submissionsByMonth[monthKey].pending++;
      if (abstract.status === 'rejected') submissionsByMonth[monthKey].rejected++;
    });

    const submissionTrends = Object.entries(submissionsByMonth).map(([period, counts]) => ({
      period,
      ...counts
    }));

    // Calculate top research trends - count unique papers per term (approved only)
    const approvedAbstractsData = abstracts?.filter(a => a.status === 'approved') || [];
    
    // Count unique papers for domains
    const domainToPapers = new Map<string, Set<string>>();
    approvedAbstractsData.forEach(abstract => {
      const abstractId = abstract.id || JSON.stringify(abstract);
      const termsToCollect: string[] = [];
      
      // Collect keywords and domains
      const keywords = abstract.keywords || [];
      termsToCollect.push(...keywords);
      const domains = abstract.extracted_entities?.domains || [];
      termsToCollect.push(...domains);
      
      termsToCollect.forEach(term => {
        const normalized = normalizeTerm(term, true);
        if (normalized) {
          if (!domainToPapers.has(normalized)) {
            domainToPapers.set(normalized, new Set());
          }
          domainToPapers.get(normalized)!.add(abstractId);
        }
      });
    });
    
    // Count unique papers for technologies
    const techToPapers = new Map<string, Set<string>>();
    approvedAbstractsData.forEach(abstract => {
      const abstractId = abstract.id || JSON.stringify(abstract);
      const technologies = abstract.extracted_entities?.technologies || [];
      
      technologies.forEach(term => {
        const normalized = normalizeTerm(term, true);
        if (normalized) {
          if (!techToPapers.has(normalized)) {
            techToPapers.set(normalized, new Set());
          }
          techToPapers.get(normalized)!.add(abstractId);
        }
      });
    });
    
    // Count unique papers for methodologies
    const methodToPapers = new Map<string, Set<string>>();
    approvedAbstractsData.forEach(abstract => {
      const abstractId = abstract.id || JSON.stringify(abstract);
      const methodologies = abstract.extracted_entities?.methodologies || [];
      
      methodologies.forEach(term => {
        const normalized = normalizeTerm(term, true);
        if (normalized) {
          if (!methodToPapers.has(normalized)) {
            methodToPapers.set(normalized, new Set());
          }
          methodToPapers.get(normalized)!.add(abstractId);
        }
      });
    });
    
    // Convert to counts
    const domainCounts: { [key: string]: number } = {};
    domainToPapers.forEach((papers, term) => {
      domainCounts[term] = papers.size;
    });
    
    const technologyCounts: { [key: string]: number } = {};
    techToPapers.forEach((papers, term) => {
      technologyCounts[term] = papers.size;
    });
    
    const methodologyCounts: { [key: string]: number } = {};
    methodToPapers.forEach((papers, term) => {
      methodologyCounts[term] = papers.size;
    });
    
    // Get top terms with category-specific filtering
    const topDomains = getTopTermsByCategory(domainCounts, 15, 'domains');
    const topTechnologies = getTopTermsByCategory(technologyCounts, 15, 'technologies');
    const topMethodologies = getTopTermsByCategory(methodologyCounts, 15, 'methodologies');

    const domainTotal = topDomains.reduce((sum, [, count]) => sum + count, 0);
    const techTotal = topTechnologies.reduce((sum, [, count]) => sum + count, 0);
    const methodTotal = topMethodologies.reduce((sum, [, count]) => sum + count, 0);

    return {
      stats: {
        totalAbstracts: totalAbstracts || 0,
        totalApproved: approvedAbstracts,
        approvedAbstracts,
        pendingReviews: pendingReviews || 0,
        rejectedAbstracts: rejectedAbstracts || 0,
        totalEntitiesExtracted: techCount + domainCount + methodCount
      },
      submissionTrends,
      entityDistribution: {
        technologies: techCount,
        domains: domainCount,
        methodologies: methodCount,
        total: techCount + domainCount + methodCount
      },
      topResearchTrends: {
        domains: topDomains.map(([name, count]) => ({
          name,
          count,
          percentage: ((count / domainTotal) * 100).toFixed(1)
        })),
        technologies: topTechnologies.map(([name, count]) => ({
          name,
          count,
          percentage: ((count / techTotal) * 100).toFixed(1)
        })),
        methodologies: topMethodologies.map(([name, count]) => ({
          name,
          count,
          percentage: ((count / methodTotal) * 100).toFixed(1)
        }))
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

/**
 * Export comprehensive dashboard data report to PDF
 */
export async function exportDashboardToPDF(options: PDFExportOptions = {}): Promise<void> {
  const {
    filename = `research-analytics-report-${new Date().toISOString().split('T')[0]}.pdf`,
    orientation = 'portrait'
  } = options;

  try {
    // Fetch all data
    const data = await fetchDashboardData();

    // Initialize PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin - 10) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // ========== HEADER ==========
    pdf.setFontSize(22);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Research Analytics Report', margin, yPosition);
    
    yPosition += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${new Date().toLocaleString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, margin, yPosition);
    pdf.text('Northern Bukidnon State College', pageWidth - margin, yPosition, { align: 'right' });
    
    yPosition += 3;
    pdf.setDrawColor(59, 130, 246); // blue-500
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // ========== EXECUTIVE SUMMARY ==========
    pdf.setFontSize(16);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', margin, yPosition);
    yPosition += 8;

    // Stats Grid
    const statBoxWidth = contentWidth / 2 - 2;
    const statBoxHeight = 18;
    let xPos = margin;

    const stats = [
      { label: 'Total Abstracts', value: data.stats.totalAbstracts, color: [59, 130, 246] }, // blue
      { label: 'Total Approved', value: data.stats.totalApproved, color: [16, 185, 129] }, // green
      { label: 'Pending Approvals', value: data.stats.pendingReviews, color: [245, 158, 11] }, // amber
      { label: 'Total Rejected', value: data.stats.rejectedAbstracts, color: [239, 68, 68] }, // red
      { label: 'Entities Extracted', value: data.stats.totalEntitiesExtracted, color: [168, 85, 247] } // purple
    ];

    stats.forEach((stat, index) => {
      if (index > 0 && index % 2 === 0) {
        xPos = margin;
        yPosition += statBoxHeight + 3;
      }

      // Draw box
      pdf.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
      pdf.setDrawColor(255, 255, 255);
      pdf.roundedRect(xPos, yPosition, statBoxWidth, statBoxHeight, 2, 2, 'FD');

      // Label
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'normal');
      pdf.text(stat.label, xPos + 3, yPosition + 6);

      // Value
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.value.toString(), xPos + 3, yPosition + 14);

      xPos += statBoxWidth + 4;
    });

    yPosition += statBoxHeight + 12;

    // ========== SUBMISSION TRENDS ==========
    checkNewPage(60);
    pdf.setFontSize(14);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Submission Trends by Period', margin, yPosition);
    yPosition += 7;

    if (data.submissionTrends.length > 0) {
      // Table header
      const colWidth = contentWidth / 5;
      pdf.setFillColor(243, 244, 246); // gray-100
      pdf.rect(margin, yPosition, contentWidth, 8, 'F');
      
      pdf.setFontSize(9);
      pdf.setTextColor(55, 65, 81);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Period', margin + 2, yPosition + 5);
      pdf.text('Total', margin + colWidth + 2, yPosition + 5);
      pdf.text('Approved', margin + colWidth * 2 + 2, yPosition + 5);
      pdf.text('Pending', margin + colWidth * 3 + 2, yPosition + 5);
      pdf.text('Rejected', margin + colWidth * 4 + 2, yPosition + 5);
      yPosition += 8;

      // Table rows
      pdf.setFont('helvetica', 'normal');
      data.submissionTrends.forEach((trend, index) => {
        checkNewPage(7);
        
        if (index % 2 === 0) {
          pdf.setFillColor(249, 250, 251); // gray-50
          pdf.rect(margin, yPosition, contentWidth, 6, 'F');
        }

        pdf.setTextColor(31, 41, 55);
        pdf.text(trend.period, margin + 2, yPosition + 4);
        pdf.text(trend.total.toString(), margin + colWidth + 2, yPosition + 4);
        pdf.text(trend.approved.toString(), margin + colWidth * 2 + 2, yPosition + 4);
        pdf.text(trend.pending.toString(), margin + colWidth * 3 + 2, yPosition + 4);
        pdf.text(trend.rejected.toString(), margin + colWidth * 4 + 2, yPosition + 4);
        yPosition += 6;
      });

      yPosition += 8;
    } else {
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text('No submission data available', margin, yPosition);
      yPosition += 10;
    }

    // ========== ENTITY DISTRIBUTION ==========
    checkNewPage(40);
    pdf.setFontSize(14);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Entity Distribution', margin, yPosition);
    yPosition += 7;

    const entityData = [
      { 
        label: 'Technologies', 
        count: data.entityDistribution.technologies,
        percentage: ((data.entityDistribution.technologies / data.entityDistribution.total) * 100).toFixed(1),
        color: [59, 130, 246]
      },
      { 
        label: 'Research Domains', 
        count: data.entityDistribution.domains,
        percentage: ((data.entityDistribution.domains / data.entityDistribution.total) * 100).toFixed(1),
        color: [168, 85, 247]
      },
      { 
        label: 'Methodologies', 
        count: data.entityDistribution.methodologies,
        percentage: ((data.entityDistribution.methodologies / data.entityDistribution.total) * 100).toFixed(1),
        color: [16, 185, 129]
      }
    ];

    entityData.forEach(entity => {
      pdf.setFontSize(11);
      pdf.setTextColor(31, 41, 55);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${entity.label}: ${entity.count} (${entity.percentage}%)`, margin + 2, yPosition);
      
      // Progress bar
      const barY = yPosition + 2;
      const barHeight = 5;
      const barMaxWidth = contentWidth - 4;
      const barFillWidth = (parseFloat(entity.percentage) / 100) * barMaxWidth;
      
      pdf.setFillColor(229, 231, 235); // gray-200
      pdf.roundedRect(margin, barY, barMaxWidth, barHeight, 1, 1, 'F');
      
      pdf.setFillColor(entity.color[0], entity.color[1], entity.color[2]);
      pdf.roundedRect(margin, barY, barFillWidth, barHeight, 1, 1, 'F');
      
      yPosition += 10;
    });

    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`Total Entities: ${data.entityDistribution.total}`, margin, yPosition);
    yPosition += 12;

    // ========== TOP RESEARCH DOMAINS ==========
    checkNewPage(50);
    pdf.setFontSize(14);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top Research Domains', margin, yPosition);
    yPosition += 7;

    if (data.topResearchTrends.domains.length > 0) {
      data.topResearchTrends.domains.forEach((domain, index) => {
        checkNewPage(6);
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${index + 1}. ${domain.name}`, margin + 3, yPosition);
        pdf.text(`${domain.count} (${domain.percentage}%)`, pageWidth - margin - 25, yPosition);
        yPosition += 5;
      });
      yPosition += 8;
    } else {
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text('No domain data available', margin, yPosition);
      yPosition += 10;
    }

    // ========== TOP TECHNOLOGIES ==========
    checkNewPage(50);
    pdf.setFontSize(14);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top Technologies', margin, yPosition);
    yPosition += 7;

    if (data.topResearchTrends.technologies.length > 0) {
      data.topResearchTrends.technologies.forEach((tech, index) => {
        checkNewPage(6);
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${index + 1}. ${tech.name}`, margin + 3, yPosition);
        pdf.text(`${tech.count} (${tech.percentage}%)`, pageWidth - margin - 25, yPosition);
        yPosition += 5;
      });
      yPosition += 8;
    } else {
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text('No technology data available', margin, yPosition);
      yPosition += 10;
    }

    // ========== TOP METHODOLOGIES ==========
    checkNewPage(50);
    pdf.setFontSize(14);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top Methodologies', margin, yPosition);
    yPosition += 7;

    if (data.topResearchTrends.methodologies.length > 0) {
      data.topResearchTrends.methodologies.forEach((method, index) => {
        checkNewPage(6);
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${index + 1}. ${method.name}`, margin + 3, yPosition);
        pdf.text(`${method.count} (${method.percentage}%)`, pageWidth - margin - 25, yPosition);
        yPosition += 5;
      });
    } else {
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text('No methodology data available', margin, yPosition);
    }

    // ========== FOOTER ON ALL PAGES ==========
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setDrawColor(229, 231, 235);
      pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      pdf.text(
        'NBSC Citation Auth • Research Analytics',
        pageWidth - margin,
        pageHeight - 10,
        { align: 'right' }
      );
    }

    // Save PDF
    pdf.save(filename);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw new Error('Failed to generate PDF report');
  }
}
