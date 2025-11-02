import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Edit2, 
  Plus, 
  Save, 
  Trash2,
  AlertCircle,
  CheckCircle,
  ArrowRightLeft
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ExtractedEntities } from '@/lib/dandelion-api';

interface EntityEditorProps {
  entities: ExtractedEntities;
  onSave: (updatedEntities: ExtractedEntities) => void;
  onCancel: () => void;
}

type EntityCategory = 'technologies' | 'domains' | 'methodologies';

interface EntityItem {
  id: string;
  value: string;
  category: EntityCategory;
}

export const EntityEditor: React.FC<EntityEditorProps> = ({ entities, onSave, onCancel }) => {
  const [editableEntities, setEditableEntities] = useState<EntityItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newEntity, setNewEntity] = useState('');
  const [newCategory, setNewCategory] = useState<EntityCategory>('technologies');
  const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);

  // Initialize editable entities
  useEffect(() => {
    const items: EntityItem[] = [
      ...entities.technologies.map((tech, idx) => ({
        id: `tech-${idx}`,
        value: tech,
        category: 'technologies' as EntityCategory
      })),
      ...entities.domains.map((domain, idx) => ({
        id: `domain-${idx}`,
        value: domain,
        category: 'domains' as EntityCategory
      })),
      ...entities.methodologies.map((method, idx) => ({
        id: `method-${idx}`,
        value: method,
        category: 'methodologies' as EntityCategory
      }))
    ];
    setEditableEntities(items);
  }, [entities]);

  // Check for duplicates and overlaps
  const getDuplicates = () => {
    const duplicates = new Set<string>();
    const seen = new Map<string, EntityItem[]>();

    editableEntities.forEach(entity => {
      const normalized = entity.value.toLowerCase().trim();
      if (!seen.has(normalized)) {
        seen.set(normalized, []);
      }
      seen.get(normalized)!.push(entity);
    });

    seen.forEach((items, key) => {
      if (items.length > 1) {
        items.forEach(item => duplicates.add(item.id));
      }
    });

    return duplicates;
  };

  const getOverlaps = () => {
    const overlaps = new Set<string>();
    
    editableEntities.forEach((entity1, idx1) => {
      editableEntities.forEach((entity2, idx2) => {
        if (idx1 !== idx2) {
          const val1 = entity1.value.toLowerCase();
          const val2 = entity2.value.toLowerCase();
          
          // Check if one is substring of another
          if (val1.includes(val2) || val2.includes(val1)) {
            overlaps.add(entity1.id);
            overlaps.add(entity2.id);
          }
        }
      });
    });

    return overlaps;
  };

  const duplicates = getDuplicates();
  const overlaps = getOverlaps();

  const handleEdit = (id: string, value: string) => {
    setEditingId(id);
    setEditValue(value);
  };

  const handleSaveEdit = (id: string) => {
    if (!editValue.trim()) {
      toast.error("Entity value cannot be empty");
      return;
    }

    setEditableEntities(prev => 
      prev.map(entity => 
        entity.id === id ? { ...entity, value: editValue.trim() } : entity
      )
    );
    setEditingId(null);
    setEditValue('');
    toast.success("Entity updated");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = (id: string) => {
    setEditableEntities(prev => prev.filter(entity => entity.id !== id));
    setSelectedForMerge(prev => prev.filter(selectedId => selectedId !== id));
    toast.success("Entity removed");
  };

  const handleReclassify = (id: string, newCategory: EntityCategory) => {
    setEditableEntities(prev => 
      prev.map(entity => 
        entity.id === id ? { ...entity, category: newCategory } : entity
      )
    );
    toast.success("Entity reclassified");
  };

  const handleAddNew = () => {
    if (!newEntity.trim()) {
      toast.error("Please enter an entity value");
      return;
    }

    // Check if already exists
    const exists = editableEntities.some(
      e => e.value.toLowerCase() === newEntity.toLowerCase().trim()
    );

    if (exists) {
      toast.error("This entity already exists");
      return;
    }

    const newId = `${newCategory}-${Date.now()}`;
    setEditableEntities(prev => [...prev, {
      id: newId,
      value: newEntity.trim(),
      category: newCategory
    }]);
    setNewEntity('');
    toast.success("Entity added");
  };

  const toggleMergeSelection = (id: string) => {
    setSelectedForMerge(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleMerge = () => {
    if (selectedForMerge.length < 2) {
      toast.error("Select at least 2 entities to merge");
      return;
    }

    const selectedEntities = editableEntities.filter(e => selectedForMerge.includes(e.id));
    const mergedValue = selectedEntities.map(e => e.value).join(', ');
    const category = selectedEntities[0].category;

    // Remove selected entities and add merged one
    setEditableEntities(prev => [
      ...prev.filter(e => !selectedForMerge.includes(e.id)),
      {
        id: `merged-${Date.now()}`,
        value: mergedValue,
        category
      }
    ]);
    setSelectedForMerge([]);
    toast.success("Entities merged successfully");
  };

  const handleSaveAll = () => {
    // Convert back to ExtractedEntities format
    const updated: ExtractedEntities = {
      technologies: editableEntities
        .filter(e => e.category === 'technologies')
        .map(e => e.value),
      domains: editableEntities
        .filter(e => e.category === 'domains')
        .map(e => e.value),
      methodologies: editableEntities
        .filter(e => e.category === 'methodologies')
        .map(e => e.value),
      confidence: entities.confidence,
      rawEntities: entities.rawEntities
    };

    onSave(updated);
    toast.success("Entities updated successfully");
  };

  const getCategoryColor = (category: EntityCategory) => {
    switch (category) {
      case 'technologies':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'domains':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'methodologies':
        return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  const getCategoryLabel = (category: EntityCategory) => {
    switch (category) {
      case 'technologies':
        return 'Technology';
      case 'domains':
        return 'Domain';
      case 'methodologies':
        return 'Methodology';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Edit Extracted Entities</h3>
          <p className="text-sm text-gray-600 mt-1">
            Review and modify entities, fix duplicates, and reclassify as needed
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          {Math.round(entities.confidence * 100)}% Confidence
        </Badge>
      </div>

      {/* Warnings */}
      {(duplicates.size > 0 || overlaps.size > 0) && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-800">Issues Detected</h4>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                {duplicates.size > 0 && (
                  <li>• {duplicates.size} duplicate entities found (highlighted in yellow)</li>
                )}
                {overlaps.size > 0 && (
                  <li>• {overlaps.size} overlapping entities found (highlighted in orange)</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Add New Entity */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Add new entity..."
                value={newEntity}
                onChange={(e) => setNewEntity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddNew()}
              />
            </div>
            <Select value={newCategory} onValueChange={(value) => setNewCategory(value as EntityCategory)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technologies">Technology</SelectItem>
                <SelectItem value="domains">Domain</SelectItem>
                <SelectItem value="methodologies">Methodology</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Merge Controls */}
      {selectedForMerge.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedForMerge.length} entities selected for merge
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedForMerge([])}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleMerge}
                  disabled={selectedForMerge.length < 2}
                >
                  Merge Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entities List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {editableEntities.map((entity) => {
          const isDuplicate = duplicates.has(entity.id);
          const isOverlap = overlaps.has(entity.id);
          const isSelected = selectedForMerge.includes(entity.id);
          const isEditing = editingId === entity.id;

          return (
            <Card 
              key={entity.id} 
              className={`
                ${isDuplicate ? 'border-yellow-300 bg-yellow-50' : ''}
                ${isOverlap && !isDuplicate ? 'border-orange-300 bg-orange-50' : ''}
                ${isSelected ? 'border-blue-400 bg-blue-50' : ''}
              `}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Merge Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleMergeSelection(entity.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />

                  {/* Entity Value */}
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(entity.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleSaveEdit(entity.id)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        {entity.value}
                      </span>
                    )}
                  </div>

                  {/* Category Badge */}
                  <Badge variant="outline" className={getCategoryColor(entity.category)}>
                    {getCategoryLabel(entity.category)}
                  </Badge>

                  {/* Actions */}
                  {!isEditing && (
                    <div className="flex gap-1">
                      <Select 
                        value={entity.category} 
                        onValueChange={(value) => handleReclassify(entity.id, value as EntityCategory)}
                      >
                        <SelectTrigger className="h-8 w-8 p-0 border-0 hover:bg-gray-100">
                          <ArrowRightLeft className="h-4 w-4" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technologies">→ Technology</SelectItem>
                          <SelectItem value="domains">→ Domain</SelectItem>
                          <SelectItem value="methodologies">→ Methodology</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(entity.id, entity.value)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(entity.id)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {editableEntities.filter(e => e.category === 'technologies').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Technologies</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {editableEntities.filter(e => e.category === 'domains').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Domains</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {editableEntities.filter(e => e.category === 'methodologies').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Methodologies</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSaveAll}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};
