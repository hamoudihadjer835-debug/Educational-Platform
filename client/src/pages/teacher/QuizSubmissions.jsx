import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teacherAPI } from '../../services/api';

const QuizSubmissions = () => {
  const { quizId } = useParams();
  
  const [quiz, setQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({
    score: 0,
    teacherFeedback: ''
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch quiz details
        const quizResponse = await teacherAPI.getQuiz(quizId);
        setQuiz(quizResponse.data.data);
        
        // Fetch submissions
        const submissionsResponse = await teacherAPI.getQuizSubmissions(quizId);
        setSubmissions(submissionsResponse.data.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load quiz data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [quizId]);
  
  const handleSelectSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      score: submission.isGraded ? submission.score : 0,
      teacherFeedback: submission.teacherFeedback || ''
    });
  };
  
  const handleGradeChange = (e) => {
    const { name, value } = e.target;
    setGradeData(prev => ({
      ...prev,
      [name]: name === 'score' ? parseInt(value) || 0 : value
    }));
  };
  
  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    
    if (!selectedSubmission) return;
    
    try {
      // Validate score
      if (gradeData.score < 0 || gradeData.score > selectedSubmission.maxScore) {
        setError(`Score must be between 0 and ${selectedSubmission.maxScore}`);
        return;
      }
      
      // Submit grade
      await teacherAPI.gradeSubmission(selectedSubmission._id, gradeData);
      
      // Update the submission in the list
      setSubmissions(prev => prev.map(sub => 
        sub._id === selectedSubmission._id 
          ? { 
              ...sub, 
              score: gradeData.score, 
              teacherFeedback: gradeData.teacherFeedback,
              isGraded: true,
              gradedAt: new Date()
            } 
          : sub
      ));
      
      // Reset selected submission
      setSelectedSubmission(null);
      
      // Show success message
      setSuccessMessage('Submission graded successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error grading submission:', err);
      setError('Failed to grade submission');
      setTimeout(() => setError(''), 3000);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-danger/10 text-danger p-4 rounded-md">
        {error}
      </div>
    );
  }
  
  if (!quiz) {
    return (
      <div className="bg-warning/10 text-warning p-4 rounded-md">
        Quiz not found or you don't have access to it.
      </div>
    );
  }
  
  // Helper function to find option by ID
  const findOption = (question, optionId) => {
    return question.options.find(option => option._id === optionId);
  };
  
  // Helper function to find answer for a question
  const findAnswer = (submission, questionId) => {
    return submission.answers.find(answer => answer.question === questionId);
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1>Quiz Submissions</h1>
        <Link to={`/teacher/modules/${quiz.module._id}`} className="btn bg-gray-200 hover:bg-gray-300 text-gray-800">
          Back to Module
        </Link>
      </div>
      
      {successMessage && (
        <div className="bg-success/10 text-success p-4 rounded-md">
          {successMessage}
        </div>
      )}
      
      {/* Quiz Info */}
      <div className="card bg-gradient-to-r from-primary/10 to-secondary/10">
        <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
        <p className="text-gray-600 mb-4">{quiz.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Due Date: {new Date(quiz.dueDate).toLocaleString()}</span>
          <span>Total Points: {quiz.totalPoints}</span>
          <span>Questions: {quiz.questions.length}</span>
          <span>Submissions: {submissions.length}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submissions List */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-bold mb-4">Student Submissions</h3>
          
          {submissions.length === 0 ? (
            <div className="card bg-gray-50 text-center py-8">
              <p className="text-gray-500">No submissions yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map(submission => (
                <div 
                  key={submission._id}
                  className={`card cursor-pointer transition-all ${
                    selectedSubmission?._id === submission._id 
                      ? 'border-2 border-primary' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleSelectSubmission(submission)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">{submission.student.firstName} {submission.student.lastName}</h4>
                      <p className="text-sm text-gray-500">{submission.student.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    
                    {submission.isGraded ? (
                      <span className="px-2 py-1 rounded-full bg-success/10 text-success text-xs font-semibold">
                        Graded: {submission.score}/{submission.maxScore}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-warning/10 text-warning text-xs font-semibold">
                        Needs Grading
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Selected Submission */}
        <div className="lg:col-span-2">
          {selectedSubmission ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">
                  Submission by {selectedSubmission.student.firstName} {selectedSubmission.student.lastName}
                </h3>
                {selectedSubmission.isGraded && (
                  <span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-semibold">
                    Graded: {selectedSubmission.score}/{selectedSubmission.maxScore}
                  </span>
                )}
              </div>
              
              {/* Grading Form */}
              <form onSubmit={handleSubmitGrade} className="card border-2 border-gray-200">
                <h4 className="font-bold mb-4">Grade Submission</h4>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="score" className="form-label">
                      Score (0-{selectedSubmission.maxScore})
                    </label>
                    <input
                      type="number"
                      id="score"
                      name="score"
                      value={gradeData.score}
                      onChange={handleGradeChange}
                      className="form-input"
                      min="0"
                      max={selectedSubmission.maxScore}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="teacherFeedback" className="form-label">Feedback</label>
                    <textarea
                      id="teacherFeedback"
                      name="teacherFeedback"
                      value={gradeData.teacherFeedback}
                      onChange={handleGradeChange}
                      rows="3"
                      className="form-input"
                      placeholder="Provide feedback to the student..."
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary">
                      {selectedSubmission.isGraded ? 'Update Grade' : 'Submit Grade'}
                    </button>
                  </div>
                </div>
              </form>
              
              {/* Questions and Answers */}
              <div className="space-y-4">
                <h4 className="font-bold">Student Answers</h4>
                
                {quiz.questions.map((question, questionIndex) => {
                  const answer = findAnswer(selectedSubmission, question._id);
                  
                  return (
                    <div key={question._id} className="card border border-gray-200">
                      <h5 className="font-semibold mb-2">Question {questionIndex + 1} ({question.points} points)</h5>
                      <p className="mb-3">{question.questionText}</p>
                      
                      {/* Multiple Choice or True/False */}
                      {(question.questionType === 'multiple-choice' || question.questionType === 'true-false') && (
                        <div className="space-y-2 mb-3">
                          {question.options.map((option, optionIndex) => {
                            const isSelected = answer && answer.selectedOptions.includes(option._id);
                            
                            return (
                              <div 
                                key={optionIndex}
                                className={`p-2 rounded-md border ${
                                  option.isCorrect ? 'border-success bg-success/5' :
                                  isSelected ? 'border-danger bg-danger/5' :
                                  'border-gray-200'
                                }`}
                              >
                                <div className="flex items-center">
                                  <div className={`w-4 h-4 flex items-center justify-center rounded-full border mr-2 ${
                                    isSelected ? (
                                      option.isCorrect ? 'border-success bg-success text-white' : 'border-danger bg-danger text-white'
                                    ) : (
                                      option.isCorrect ? 'border-success' : 'border-gray-300'
                                    )
                                  }`}>
                                    {isSelected && (
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className="text-sm">{option.text}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Short Answer */}
                      {question.questionType === 'short-answer' && (
                        <div className="border border-gray-200 rounded-md p-3 bg-gray-50 mb-3">
                          <p className="text-gray-700 text-sm">{answer ? answer.textAnswer : 'No answer provided'}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card bg-gray-50 text-center py-12">
              <p className="text-gray-500 mb-2">Select a submission to grade</p>
              <p className="text-gray-400 text-sm">Click on a student submission from the list on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizSubmissions;
