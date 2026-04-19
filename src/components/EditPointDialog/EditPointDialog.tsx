import { useState } from 'react';
import { POINT_CATEGORIES } from '../../services/pointCategories';
import './EditPointDialog.css';

export interface EditPointDialogProps {
  lat: number;
  lon: number;
  label: string;
  categoryId: number;
  isPublic: boolean;
  onSave: (lat: number, lon: number, label: string, categoryId: number, isPublic: boolean) => void;
  onCancel: () => void;
}

export function EditPointDialog({ lat, lon, label, categoryId, isPublic, onSave, onCancel }: EditPointDialogProps) {
  const [latVal, setLatVal] = useState(lat.toFixed(6));
  const [lonVal, setLonVal] = useState(lon.toFixed(6));
  const [labelVal, setLabelVal] = useState(label);
  const [categoryIdVal, setCategoryIdVal] = useState(categoryId);
  const [isPublicVal, setIsPublicVal] = useState(isPublic);

  const handleSave = () => {
    const parsedLat = parseFloat(latVal);
    const parsedLon = parseFloat(lonVal);
    if (isNaN(parsedLat) || isNaN(parsedLon)) return;
    onSave(parsedLat, parsedLon, labelVal, categoryIdVal, isPublicVal);
  };

  return (
    <div className="edit-point-dialog-overlay" onClick={onCancel}>
      <div className="edit-point-dialog" onClick={e => e.stopPropagation()}>
        <div className="edit-point-dialog-header">
          <h3>Edit Point</h3>
          <button className="edit-point-dialog-close" onClick={onCancel}>×</button>
        </div>
        <div className="edit-point-dialog-body">
          <div className="edit-point-field">
            <label htmlFor="edit-point-lat">Latitude</label>
            <input
              id="edit-point-lat"
              type="text"
              className="edit-point-input"
              value={latVal}
              onChange={e => setLatVal(e.target.value)}
              autoFocus
            />
          </div>
          <div className="edit-point-field">
            <label htmlFor="edit-point-lon">Longitude</label>
            <input
              id="edit-point-lon"
              type="text"
              className="edit-point-input"
              value={lonVal}
              onChange={e => setLonVal(e.target.value)}
            />
          </div>
          <div className="edit-point-field">
            <label htmlFor="edit-point-label">Label</label>
            <input
              id="edit-point-label"
              type="text"
              className="edit-point-input"
              value={labelVal}
              onChange={e => setLabelVal(e.target.value)}
              placeholder="Enter label..."
            />
          </div>
          <div className="edit-point-field">
            <label htmlFor="edit-point-category">Category</label>
            <select
              id="edit-point-category"
              className="edit-point-input"
              value={categoryIdVal}
              onChange={e => setCategoryIdVal(Number(e.target.value))}
            >
              {POINT_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="edit-point-field edit-point-checkbox-field">
            <label className="edit-point-checkbox">
              <input
                type="checkbox"
                checked={isPublicVal}
                onChange={e => setIsPublicVal(e.target.checked)}
              />
              <span>Public marker</span>
            </label>
          </div>
        </div>
        <div className="edit-point-dialog-footer">
          <button className="edit-point-btn edit-point-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="edit-point-btn edit-point-btn-save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
