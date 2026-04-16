import { useState } from 'react';
import { POINT_CATEGORIES } from '../../services/pointCategories';
import './AddPointDialog.css';

export interface AddPointDialogProps {
  lat: number;
  lon: number;
  onSave: (label: string, categoryId: number, isPublic: boolean) => void;
  onCancel: () => void;
}

export function AddPointDialog({ lat, lon, onSave, onCancel }: AddPointDialogProps) {
  const [label, setLabel] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [isPublic, setIsPublic] = useState(false);

  const handleSave = () => {
    onSave(label, categoryId, isPublic);
  };

  return (
    <div className="add-point-dialog-overlay" onClick={onCancel}>
      <div className="add-point-dialog" onClick={e => e.stopPropagation()}>
        <div className="add-point-dialog-header">
          <h3>Add Point</h3>
          <button className="add-point-dialog-close" onClick={onCancel}>×</button>
        </div>
        <div className="add-point-dialog-body">
          <div className="add-point-field">
            <label>Latitude</label>
            <span className="add-point-value">{lat.toFixed(6)}</span>
          </div>
          <div className="add-point-field">
            <label>Longitude</label>
            <span className="add-point-value">{lon.toFixed(6)}</span>
          </div>
          <div className="add-point-field">
            <label htmlFor="point-label">Label</label>
            <input
              id="point-label"
              type="text"
              className="add-point-input"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Enter label..."
              autoFocus
            />
          </div>
          <div className="add-point-field">
            <label htmlFor="point-category">Category</label>
            <select
              id="point-category"
              className="add-point-input"
              value={categoryId}
              onChange={e => setCategoryId(Number(e.target.value))}
            >
              {POINT_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="add-point-field add-point-checkbox-field">
            <label className="add-point-checkbox">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
              />
              <span>Public marker</span>
            </label>
          </div>
        </div>
        <div className="add-point-dialog-footer">
          <button className="add-point-btn add-point-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="add-point-btn add-point-btn-save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
