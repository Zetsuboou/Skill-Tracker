import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import SkillModal from '../components/SkillModal';
import CertificationModal from '../components/CertificationModal';

function Dashboard() {
  const { user, logout } = useAuth();
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchCompleteProfile();
  }, []);
  
  const fetchCompleteProfile = async () => {
    try {
      const response = await usersAPI.getCompleteProfile(user.id);
      setProfileData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile data');
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Skill Tracker</h1>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {profileData.user.name}!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold">{profileData.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="text-lg font-semibold">
                {profileData.user.department || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="text-lg font-semibold">{profileData.user.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-lg font-semibold">
                {new Date(profileData.user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        {/* Skills Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">My Skills</h3>
            <button 
            onClick={() => setIsSkillModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              + Add Skill
            </button>
          </div>
          
          {profileData.skills.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No skills added yet. Click "Add Skill" to get started!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profileData.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {skill.category}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Level:</span>{' '}
                      <span
                        className={`font-semibold ${
                          skill.proficiency_level === 'Expert'
                            ? 'text-green-600'
                            : skill.proficiency_level === 'Advanced'
                            ? 'text-blue-600'
                            : skill.proficiency_level === 'Intermediate'
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {skill.proficiency_level}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Experience:</span>{' '}
                      {skill.years_of_experience} years
                    </p>
                    {skill.notes && (
                      <p className="text-sm text-gray-500 mt-2">{skill.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Certifications Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">My Certifications</h3>
            <button onClick={() => setIsCertModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
              + Add Certification
            </button>
          </div>
          
          {profileData.certifications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No certifications added yet. Click "Add Certification" to get started!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileData.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">{cert.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Issuer:</span> {cert.issuing_organization}
                  </p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Obtained:</span>{' '}
                      {new Date(cert.date_obtained).toLocaleDateString()}
                    </p>
                    {cert.expiry_date && (
                      <p>
                        <span className="font-medium">Expires:</span>{' '}
                        {new Date(cert.expiry_date).toLocaleDateString()}
                      </p>
                    )}
                    {cert.credential_id && (
                      <p>
                        <span className="font-medium">Credential ID:</span> {cert.credential_id}
                      </p>
                    )}
                  </div>
                  {cert.notes && (
                    <p className="text-sm text-gray-500 mt-2">{cert.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
        <SkillModal
          isOpen={isSkillModalOpen}
          onClose={() => setIsSkillModalOpen(false)}
          userId={user.id}
          onSkillAdded={fetchCompleteProfile}
        />

        <CertificationModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          userId={user.id}
          onCertificationAdded={fetchCompleteProfile}
        />
    </div>
  );
}



export default Dashboard;