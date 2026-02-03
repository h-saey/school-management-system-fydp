import React, { useState } from "react";
import { Award, Upload, FileText, Calendar } from "lucide-react";

export function UploadCertificates() {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [certificateType, setCertificateType] = useState("Academic");
  const [certificateName, setCertificateName] = useState("");
  const [remarks, setRemarks] = useState("");

  const students = [
    "Aarav Patel",
    "Aadhya Sharma",
    "Advait Kumar",
    "Ananya Singh",
    "Arjun Reddy",
    "Diya Gupta",
    "Ishaan Verma",
    "Kavya Nair",
  ];

  const uploadedCertificates = [
    {
      id: 1,
      student: "Aarav Patel",
      certificate: "Science Olympiad Gold Medal",
      type: "Academic",
      date: "2025-12-10",
      remarks: "Outstanding performance in state-level competition",
    },
    {
      id: 2,
      student: "Aadhya Sharma",
      certificate: "Inter-School Debate Winner",
      type: "Co-curricular",
      date: "2025-12-08",
      remarks: "First position in inter-school debate competition",
    },
    {
      id: 3,
      student: "Kavya Nair",
      certificate: "Mathematics Excellence Award",
      type: "Academic",
      date: "2025-12-05",
      remarks: "100% marks in mathematics mid-term exam",
    },
  ];

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      "Certificate uploaded successfully! It will appear in the student's portfolio.",
    );
    // Reset form
    setSelectedStudent("");
    setCertificateType("Academic");
    setCertificateName("");
    setRemarks("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">
          Upload Certificates & Achievements
        </h1>
        <p className="text-gray-600">Add certificates to student portfolios</p>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-gray-900 mb-6">Upload New Certificate</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Select Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student}>{student}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Certificate Type
              </label>
              <select
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>Academic</option>
                <option>Co-curricular</option>
                <option>Sports</option>
                <option>Achievement</option>
                <option>Participation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Certificate Name</label>
            <input
              type="text"
              value={certificateName}
              onChange={(e) => setCertificateName(e.target.value)}
              placeholder="e.g., Science Olympiad Gold Medal"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Upload Certificate File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any additional notes or comments..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Certificate
          </button>
        </form>
      </div>

      {/* Recently Uploaded */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6 text-purple-600" />
          <h2 className="text-gray-900">Recently Uploaded Certificates</h2>
        </div>

        <div className="space-y-4">
          {uploadedCertificates.map((cert) => (
            <div
              key={cert.id}
              className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-3 sm:gap-0">
                {/* Left Section */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>

                  <div>
                    <h3 className="text-gray-900 mb-1">{cert.certificate}</h3>

                    {/* Info Row */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span>Student: {cert.student}</span>
                      <span className="hidden sm:inline">•</span>

                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        {cert.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Date Section */}
                <div className="flex items-center gap-2 text-sm text-gray-600 sm:self-start">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  {cert.date}
                </div>
              </div>

              {/* Remarks */}
              {cert.remarks && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Remarks:</strong> {cert.remarks}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h3 className="text-gray-900 mb-3">Upload Guidelines</h3>
        <div className="space-y-2 text-gray-700 text-sm">
          <p>
            • Uploaded certificates will be immediately visible in the student's
            portfolio.
          </p>
          <p>
            • Ensure certificate files are clear and readable before uploading.
          </p>
          <p>
            • Add meaningful remarks to provide context about the achievement.
          </p>
          <p>
            • Parents will be notified when a new certificate is added to their
            child's portfolio.
          </p>
        </div>
      </div>
    </div>
  );
}
