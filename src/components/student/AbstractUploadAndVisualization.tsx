import React, { useState } from 'react';
import { OCRExtractor } from '@/components/ocr/OCRExtractor';
import { SimpleEntityGraph } from '@/components/student/SimpleEntityGraph';

interface Entity {
  id: string;
  label: string;
  types: string[];
  confidence: number;
  abstract?: string;
  uri?: string;
}

interface VisualizationData {
  text: string;
  entities: Entity[];
}

export const AbstractUploadAndVisualization: React.FC = () => {
  const [visualizationData, setVisualizationData] = useState<VisualizationData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVisualizationData = (data: VisualizationData) => {
    setVisualizationData(data);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <OCRExtractor onVisualizationData={handleVisualizationData} />
      
      {visualizationData && visualizationData.entities && visualizationData.entities.length > 0 && (
        <SimpleEntityGraph
          data={visualizationData}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};