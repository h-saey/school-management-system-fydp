import React, { useState, useEffect } from "react";
import { FileText, Download, TrendingUp, Award, Filter } from "lucide-react";
import { dataService } from "../../services/dataService";
import { useApp } from "../../contexts/AppContext";
import { SEO } from "../SEO";
import { getGradeColor, calculatePercentage } from "../../utils/helpers";
import { toast } from "sonner";

export function ViewMarks() {
  const { currentUser } = useApp();
  const [selectedTerm, setSelectedTerm] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedExamType, setSelectedExamType] = useState("All");
  const [marks, setMarks] = useState<any[]>([]);
  const [filteredMarks, setFilteredMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    average: 0,
    highest: 0,
    lowest: 0,
    totalExams: 0,
  });

  useEffect(() => {
    if (!currentUser) return;

    const student = dataService.getStudentByUserId(currentUser.id);
    if (!student) return;

    const allMarks = dataService.getMarksByStudent(student.id);
    setMarks(allMarks);
    setFilteredMarks(allMarks);
    calculateStats(allMarks);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    // Apply filters
    let filtered = marks;

    if (selectedTerm !== "All") {
      filtered = filtered.filter((m) => m.term === selectedTerm);
    }

    if (selectedSubject !== "All Subjects") {
      filtered = filtered.filter((m) => m.subject === selectedSubject);
    }

    if (selectedExamType !== "All") {
      filtered = filtered.filter((m) => m.examType === selectedExamType);
    }

    setFilteredMarks(filtered);
    calculateStats(filtered);
  }, [selectedTerm, selectedSubject, selectedExamType, marks]);

  const calculateStats = (marksData: any[]) => {
    if (marksData.length === 0) {
      setStats({ average: 0, highest: 0, lowest: 0, totalExams: 0 });
      return;
    }

    const percentages = marksData.map(
      (m) => (m.marksObtained / m.totalMarks) * 100,
    );
    const average = percentages.reduce((a, b) => a + b, 0) / percentages.length;
    const highest = Math.max(...percentages);
    const lowest = Math.min(...percentages);

    setStats({
      average: Math.round(average * 10) / 10,
      highest: Math.round(highest * 10) / 10,
      lowest: Math.round(lowest * 10) / 10,
      totalExams: marksData.length,
    });
  };

  const subjects = ["All Subjects", ...new Set(marks.map((m) => m.subject))];
  const terms = ["All", ...new Set(marks.map((m) => m.term))];
  const examTypes = ["All", ...new Set(marks.map((m) => m.examType))];

  const handleDownloadReport = () => {
    toast.success(
      "Report card download functionality would be implemented here",
    );
    // In real implementation, generate PDF report
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading marks...</div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="View Marks & Results"
        description="View your examination marks, grades, and academic performance across all subjects"
        keywords="student marks, exam results, grades, academic performance"
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-2">Marks & Results</h1>
            <p className="text-gray-600">
              View your examination performance and grades
            </p>
          </div>
          <button
            onClick={handleDownloadReport}
            className="
    flex items-center justify-center gap-2
    w-full sm:w-auto
    px-5 py-3
    text-base font-medium
    bg-blue-600 text-white
    rounded-xl
    hover:bg-blue-700
    active:scale-95
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
  "
            aria-label="Download report card"
          >
            <Download className="w-5 h-5" aria-hidden="true" />
            <span>Download Report</span>
          </button>

          {/* <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Download report card"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Download Report
          </button> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp
                className="w-6 h-6 text-blue-500"
                aria-hidden="true"
              />
              <h3 className="text-gray-900">Average</h3>
            </div>
            <p className="text-gray-900">{stats.average}%</p>
            <p className="text-sm text-blue-600">Overall performance</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-6 h-6 text-green-500" aria-hidden="true" />
              <h3 className="text-gray-900">Highest</h3>
            </div>
            <p className="text-gray-900">{stats.highest}%</p>
            <p className="text-sm text-green-600">Best performance</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText
                className="w-6 h-6 text-orange-500"
                aria-hidden="true"
              />
              <h3 className="text-gray-900">Lowest</h3>
            </div>
            <p className="text-gray-900">{stats.lowest}%</p>
            <p className="text-sm text-orange-600">Needs improvement</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText
                className="w-6 h-6 text-purple-500"
                aria-hidden="true"
              />
              <h3 className="text-gray-900">Total Exams</h3>
            </div>
            <p className="text-gray-900">{stats.totalExams}</p>
            <p className="text-sm text-purple-600">Completed</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" aria-hidden="true" />
            <h2 className="text-gray-900">Filter Results</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="term-filter"
                className="block text-sm text-gray-700 mb-2"
              >
                Term
              </label>
              <select
                id="term-filter"
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {terms.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="subject-filter"
                className="block text-sm text-gray-700 mb-2"
              >
                Subject
              </label>
              <select
                id="subject-filter"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="exam-filter"
                className="block text-sm text-gray-700 mb-2"
              >
                Exam Type
              </label>
              <select
                id="exam-filter"
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {examTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Marks Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-gray-900">Detailed Marks</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredMarks.length} of {marks.length} results
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">
                    Exam Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">
                    Term
                  </th>
                  <th className="px-6 py-3 text-center text-sm text-gray-700">
                    Marks
                  </th>
                  <th className="px-6 py-3 text-center text-sm text-gray-700">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-center text-sm text-gray-700">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMarks.length > 0 ? (
                  filteredMarks.map((mark, index) => {
                    const percentage = calculatePercentage(
                      mark.marksObtained,
                      mark.totalMarks,
                    );
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900">
                          {mark.subject}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {mark.examType}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{mark.term}</td>
                        <td className="px-6 py-4 text-center text-gray-900">
                          {mark.marksObtained}/{mark.totalMarks}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-900">
                          {percentage}%
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${getGradeColor(mark.grade)}`}
                          >
                            {mark.grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No marks found for the selected filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subject-wise Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-gray-900 mb-4">Subject-wise Performance</h2>
          <div className="space-y-4">
            {subjects
              .filter((s) => s !== "All Subjects")
              .map((subject) => {
                const subjectMarks = marks.filter((m) => m.subject === subject);
                if (subjectMarks.length === 0) return null;

                const avgPercentage =
                  subjectMarks.reduce(
                    (sum, m) => sum + (m.marksObtained / m.totalMarks) * 100,
                    0,
                  ) / subjectMarks.length;

                const avgGrade = subjectMarks[0]?.grade || "N/A";

                return (
                  <div
                    key={subject}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{subject}</p>
                      <p className="text-sm text-gray-600">
                        {subjectMarks.length} exam(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Average</p>
                        <p className="text-gray-900 font-medium">
                          {Math.round(avgPercentage * 10) / 10}%
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getGradeColor(avgGrade)}`}
                      >
                        {avgGrade}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
}
