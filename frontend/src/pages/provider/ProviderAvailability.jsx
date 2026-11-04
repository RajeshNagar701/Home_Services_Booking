import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DAYS_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ProviderAvailability = () => {
  const { showToast } = useToast();
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await api.get('/providers/availability');
        if (res.success) {
          setSchedule(res.data);
        }
      } catch (err) {
        console.warn('Error fetching availability:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const handleDayChange = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.put('/providers/availability', { days: schedule });
      if (res.success) {
        showToast('Weekly schedule updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Error updating schedule', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Working Hours & Availability</h3>
          <p className="text-muted small mb-0">Configure your operating hours, slot limits, and off-days to prevent double bookings.</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4 fw-semibold" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Schedule Changes'}
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading your schedule..." />
      ) : (
        <div className="hs-card p-4 bg-white shadow-sm">
          <div className="table-responsive">
            <table className="table table-custom">
              <thead>
                <tr>
                  <th style={{ width: '150px' }}>Day of Week</th>
                  <th>Operating Status</th>
                  <th>Shift Start</th>
                  <th>Shift End</th>
                  <th>Max Bookings / Slot</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((dayItem, idx) => (
                  <tr key={dayItem.dayOfWeek} className={dayItem.isOffDay ? 'bg-light text-muted' : ''}>
                    <td className="fw-bold text-dark">
                      {DAYS_NAMES[dayItem.dayOfWeek]}
                    </td>
                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={!dayItem.isOffDay}
                          onChange={(e) => handleDayChange(idx, 'isOffDay', !e.target.checked)}
                        />
                        <label className="form-check-label small fw-semibold">
                          {!dayItem.isOffDay ? (
                            <span className="text-success">Active</span>
                          ) : (
                            <span className="text-danger">Day Off</span>
                          )}
                        </label>
                      </div>
                    </td>
                    <td>
                      <input
                        type="time"
                        className="form-control form-control-sm"
                        style={{ maxWidth: '140px' }}
                        disabled={dayItem.isOffDay}
                        value={dayItem.startTime}
                        onChange={(e) => handleDayChange(idx, 'startTime', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        className="form-control form-control-sm"
                        style={{ maxWidth: '140px' }}
                        disabled={dayItem.isOffDay}
                        value={dayItem.endTime}
                        onChange={(e) => handleDayChange(idx, 'endTime', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        style={{ maxWidth: '100px' }}
                        min="1"
                        max="10"
                        disabled={dayItem.isOffDay}
                        value={dayItem.maxBookingsPerSlot || 2}
                        onChange={(e) => handleDayChange(idx, 'maxBookingsPerSlot', Number(e.target.value))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderAvailability;
