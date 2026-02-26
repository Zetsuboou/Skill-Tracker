import React, { useState, useEffect } from 'react';
import { certificationsAPI } from '../services/api';

function CertificationModal({ isOpen, onClose, userId, onCertificationAdded }) {
  const [availableCertifications, setAvailableCertifications] = useState([]);
  const [formData, setFormData] = useState({
    certificationId: '',
    dateObtained: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch available certifications when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableCertifications();
    }
  }, [isOpen]);
  
  const fetchAvailableCertifications = async () => {
    try {
      const response = await certificationsAPI.getAll();
      setAvailableCertifications(response.data.certifications);
    } catch (err) {
      setError('Failed to load certifications');
    }
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.certificationId) {
      setError('Please select a certification');
      return;
    }
    
    if (!formData.dateObtained) {
      setError('Please enter the date obtained');
      return;
    }
    
    setLoading(true);
    
    try {
      await certificationsAPI.addToUser(userId, formData);
      
      // Reset form
      setFormData({
        certificationId: '',
        dateObtained: '',
        expiryDate: '',
        credentialId: '',
        credentialUrl: '',
        notes: ''
      });
      
      // Notify parent component
      onCertificationAdded();
      
      // Close modal
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add certification');
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Add Certification</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Certification *
              </label>
              <select
                name="certificationId"
                value={formData.certificationId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a certification...</option>
                {availableCertifications.map((cert) => (
                  <option key={cert.id} value={cert.id}>
                    {cert.name} - {cert.issuing_organization}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Date Obtained *
              </label>
              <input
                type="date"
                name="dateObtained"
                value={formData.dateObtained}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Credential ID (Optional)
              </label>
              <input
                type="text"
                name="credentialId"
                value={formData.credentialId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Credential URL (Optional)
              </label>
              <input
                type="url"
                name="credentialUrl"
                value={formData.credentialUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition"
              >
                {loading ? 'Adding...' : 'Add Certification'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CertificationModal;