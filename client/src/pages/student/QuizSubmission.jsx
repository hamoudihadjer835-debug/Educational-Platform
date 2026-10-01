import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';

const QuizSubmission = () => {
  const { submissionId } = useParams();
  
  const [submission, setSubmission] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await studentAPI.getSubmission(submissionId);
        setSubmission(response.data.data);
        setQuiz(response.data.data.quiz);
      } catch (err) {
        console.error('Error fetching submission:', err);
        setError('Failed to load submission');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmission();
  }, [submissionId]);
  
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
  
  if (!submission || !quiz) {
    return (
      <div className="bg-warning/10 text-warning p-4 rounded-md">
        Submission not found or you don't have access to it.
      </div>
    );
  }
  
  // Helper function to find answer for a question
  const findAnswer = (questionId) => {
    return submission.answers.find(answer => answer.question === questionId);
  };
  
  // Helper function to find option by ID
  const findOption = (question, optionId) => {
    return question.options.find(option => option._id === optionId);
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1>Quiz Submission</h1>
        <Link to={`/student/modules/${quiz.module}/quizzes`} className="btn bg-gray-200 hover:bg-gray-300 text-gray-800">
          Back to Quizzes
        </Link>
      </div>
      
      {/* Submission Info */}
      <div className="card bg-gradient-to-r from-primary/10 to-accent/10">
        <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
        <p className="text-gray-600 mb-4">{quiz.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">
              <span className="font-semibold">Submitted:</span> {new Date(submission.submittedAt).toLocaleString()}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Due Date:</span> {new Date(quiz.dueDate).toLocaleString()}
            </p>
          </div>
          
          <div>
            {submission.isGraded ? (
              <div className="bg-success/10 text-success p-3 rounded-md">
                <p className="font-semibold">Score: {submission.score} / {submission.maxScore}</p>
                <p className="text-sm mt-1">
                  {Math.round((submission.score / submission.maxScore) * 100)}% - 
                  {submission.score / submission.maxScore >= 0.9 ? ' Excellent!' :
                   submission.score / submission.maxScore >= 0.8 ? ' Very Good!' :
                   submission.score / submission.maxScore >= 0.7 ? ' Good!' :
                   submission.score / submission.maxScore >= 0.6 ? ' Satisfactory' :
                   ' Needs Improvement'}
                </p>
              </div>
            ) : (
              <div className="bg-warning/10 text-warning p-3 rounded-md">
                <p className="font-semibold">Pending Grade</p>
                <p className="text-sm mt-1">Your submission is being reviewed by your teacher.</p>
              </div>
            )}
          </div>
        </div>
        
        {submission.isGraded && submission.teacherFeedback && (
          <div className="mt-4 p-4 bg-white/50 rounded-md">
            <h4 className="font-semibold mb-2">Teacher Feedback:</h4>
            <p className="text-gray-700">{submission.teacherFeedback}</p>
          </div>
        )}
      </div>
      
      {/* Questions and Answers */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Your Answers</h3>
        
        {quiz.questions.map((question, questionIndex) => {
          const answer = findAnswer(question._id);
          const isCorrect = submission.isGraded && answer && 
            (question.questionType === 'short-answer' ? true : // Short answers are manually graded
              question.options.every(option => 
                (answer.selectedOptions.includes(option._id) === option.isCorrect)
              ));
          
          return (
            <div key={question._id} className="card border-2 border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-bold">Question {questionIndex + 1}</h4>
                {submission.isGraded && (
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    isCorrect ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                  }`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                )}
              </div>
              
              <p className="mb-4">{question.questionText}</p>
              
              {/* Multiple Choice or True/False */}
              {(question.questionType === 'multiple-choice' || question.questionType === 'true-false') && (
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = answer && answer.selectedOptions.includes(option._id);
                    
                    return (
                      <div 
                        key={optionIndex}
                        className={`p-3 rounded-md border ${
                          submission.isGraded ? (
                            option.isCorrect ? 'border-success bg-success/5' :
                            isSelected ? 'border-danger bg-danger/5' :
                            'border-gray-200'
                          ) : (
                            isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'
                          )
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 flex items-center justify-center rounded-full border mr-3 ${
                            isSelected ? (
                              submission.isGraded ? (
                                option.isCorrect ? 'border-success bg-success text-white' : 'border-danger bg-danger text-white'
                              ) : 'border-primary bg-primary text-white'
                            ) : (
                              submission.isGraded && option.isCorrect ? 'border-success' : 'border-gray-300'
                            )
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span>{option.text}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Short Answer */}
              {question.questionType === 'short-answer' && (
                <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                  <p className="text-gray-700">{answer ? answer.textAnswer : 'No answer provided'}</p>
                </div>
              )}
              
              {/* Points */}
              <div className="mt-4 text-sm text-gray-500">
                <span>Points: {question.points}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizSubmission;
