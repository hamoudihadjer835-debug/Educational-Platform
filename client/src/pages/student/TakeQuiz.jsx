import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { scrollToTop } from '../../utils/scrollUtils';

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [answers, setAnswers] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionResults, setQuestionResults] = useState([]);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // Fetch quiz details
        const response = await studentAPI.getQuiz(quizId);
        const quizData = response.data.data;
        console.log('Quiz data:', quizData);
        setQuiz(quizData);

        // Check if questions array exists
        if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
          setError('This quiz has no questions.');
          setLoading(false);
          return;
        }

        // Initialize answers array
        const initialAnswers = quizData.questions.map(question => ({
          question: question._id,
          selectedOptions: [],
          textAnswer: ''
        }));
        setAnswers(initialAnswers);

        // Initialize question results array
        const initialResults = quizData.questions.map(question => ({
          questionId: question._id,
          isCorrect: false,
          answered: false
        }));
        setQuestionResults(initialResults);

        // Fetch module details - handle both string ID and object reference
        let moduleId = quizData.module;
        if (typeof moduleId === 'object' && moduleId._id) {
          moduleId = moduleId._id;
          // If we already have the module data, set it directly
          setModule(quizData.module);
        } else {
          // Otherwise fetch the module data
          try {
            const moduleResponse = await studentAPI.getModuleById(moduleId);
            setModule(moduleResponse.data.data);
          } catch (moduleErr) {
            console.error('Error fetching module details:', moduleErr);
            // Continue even if module fetch fails
          }
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else if (err.response && err.response.status === 404) {
          setError('Quiz not found or has been removed.');
        } else if (err.response && err.response.status === 403) {
          setError('You do not have permission to access this quiz.');
        } else if (err.response && err.response.status === 400) {
          setError('This quiz is no longer available.');
        } else {
          setError('Failed to load quiz. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Check if all questions are answered whenever answers change
  useEffect(() => {
    if (!quiz || !answers.length) return;

    const checkAllAnswered = () => {
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        const answer = answers[i];

        if (!answer) return false;

        if (question.questionType === 'short-answer') {
          if (!answer.textAnswer.trim()) return false;
        } else {
          if (answer.selectedOptions.length === 0) return false;
        }
      }
      return true;
    };

    setAllQuestionsAnswered(checkAllAnswered());
  }, [quiz, answers]);

  const handleOptionSelect = (questionIndex, optionIndex, isMultipleChoice) => {
    // Update answers
    setAnswers(prev => {
      const newAnswers = [...prev];
      const question = quiz.questions[questionIndex];

      if (isMultipleChoice) {
        // For multiple choice, only one option can be selected
        const selectedOptionId = question.options[optionIndex]._id;
        newAnswers[questionIndex] = {
          ...newAnswers[questionIndex],
          selectedOptions: [selectedOptionId]
        };
      } else {
        // For checkbox questions, toggle the selection
        const selectedOptionId = question.options[optionIndex]._id;
        const currentSelections = newAnswers[questionIndex].selectedOptions;

        if (currentSelections.includes(selectedOptionId)) {
          newAnswers[questionIndex] = {
            ...newAnswers[questionIndex],
            selectedOptions: currentSelections.filter(id => id !== selectedOptionId)
          };
        } else {
          newAnswers[questionIndex] = {
            ...newAnswers[questionIndex],
            selectedOptions: [...currentSelections, selectedOptionId]
          };
        }
      }

      return newAnswers;
    });

    // Track that the question has been answered in the results
    setQuestionResults(prev => {
      const newResults = [...prev];
      newResults[questionIndex] = {
        ...newResults[questionIndex],
        answered: true
      };
      return newResults;
    });

    // Automatically move to next question if not on the last question
    if (currentStep < quiz.questions.length - 1) {
      handleNext();
    }
  };

  const handleTextAnswerChange = (questionIndex, value) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = {
        ...newAnswers[questionIndex],
        textAnswer: value
      };
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (currentStep < quiz.questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      if (!showFeedback) {
        setShowFeedback(false); // Reset feedback when moving to next question in quiz mode
      }
      // In feedback mode, we keep showFeedback as true
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      if (!showFeedback) {
        setShowFeedback(false); // Reset feedback when moving to previous question in quiz mode
      }
      // In feedback mode, we keep showFeedback as true
    } else if (currentStep === -1) {
      // If we're on the results page, go to the last question
      setCurrentStep(quiz.questions.length - 1);
      // Keep showFeedback as true since we're in results mode
    }
  };

  const validateAnswers = () => {
    // Check if all questions have been answered
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const answer = answers[i];

      if (question.questionType === 'short-answer') {
        if (!answer.textAnswer.trim()) {
          setError(`Please answer question ${i + 1}`);
          setCurrentStep(i);
          scrollToTop(); // Scroll to the error message
          return false;
        }
      } else {
        if (answer.selectedOptions.length === 0) {
          setError(`Please select an answer for question ${i + 1}`);
          setCurrentStep(i);
          scrollToTop(); // Scroll to the error message
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) {
      return;
    }

    // Calculate final results for all questions
    const finalResults = quiz.questions.map((question, index) => {
      const answer = answers[index];

      // For multiple choice questions
      if (question.questionType !== 'short-answer') {
        const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt._id);
        const selectedOptions = answer.selectedOptions;

        // Check if all selected options are correct and all correct options are selected
        const allSelectedAreCorrect = selectedOptions.every(optId => correctOptions.includes(optId));
        const allCorrectAreSelected = correctOptions.every(optId => selectedOptions.includes(optId));

        return {
          questionId: question._id,
          isCorrect: allSelectedAreCorrect && allCorrectAreSelected,
          answered: selectedOptions.length > 0
        };
      }

      // For short answer questions (always mark as answered if there's text)
      return {
        questionId: question._id,
        isCorrect: false, // Short answers need manual grading
        answered: answer.textAnswer.trim().length > 0
      };
    });

    setQuestionResults(finalResults);

    // Show all feedback
    setShowFeedback(true);

    // Calculate score
    const correctCount = finalResults.filter(result => result.isCorrect).length;
    const totalQuestions = quiz.questions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    setSuccessMessage(`Quiz completed! Your score: ${scorePercentage}% (${correctCount}/${totalQuestions} correct)`);
    scrollToTop(); // Scroll to the success message

    try {
      // Submit quiz answers to the server
      const response = await studentAPI.submitQuiz(quiz._id, answers);
      console.log('Quiz submission successful:', response.data);

      // Check if this was a retake
      const isRetake = response.data.isRetake;

      // Set a success message based on whether this was a first attempt or retake
      if (isRetake) {
        setSuccessMessage(`Quiz retaken successfully! Your new score: ${correctCount}/${totalQuestions}`);
      } else {
        setSuccessMessage(`Quiz completed! Your score: ${correctCount}/${totalQuestions}`);
      }
      scrollToTop(); // Scroll to the updated success message

      // Keep the student on the results page
      // They can navigate back using the "Back to Quizzes" button when ready
    } catch (err) {
      console.error('Error submitting quiz:', err);
      // Don't set the main error state as that would trigger the error page
      // Instead, show a notification within the current page
      let errorMessage = 'Failed to save quiz to server. Your results are shown below but not saved.';

      // Check if it's a specific error like already submitted
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }

      // Add an error notification to the page without redirecting
      setSuccessMessage(prev => `${prev} - ${errorMessage}`);
      scrollToTop(); // Scroll to the error message
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-[#004080] to-[#6dcffb] text-white p-6 rounded-lg shadow-md mb-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Take Quiz</h1>
              <p className="text-white/90">Loading quiz content...</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01427a] mb-4"></div>
            <p className="text-gray-500">Loading quiz questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-[#004080] to-[#6dcffb] text-white p-6 rounded-lg shadow-md mb-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Take Quiz</h1>
              <p className="text-white/90">There was an issue loading the quiz</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                to={module ? `/student/modules/${typeof module === 'object' ? module._id : module}/quizzes` : '/student/modules'}
                className="bg-white text-[#004080] px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                Back to Quizzes
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-[#e14177]/10 text-[#e14177] p-6 rounded-md border border-[#e14177]/20 flex flex-col items-center justify-center py-12">
          <svg className="w-16 h-16 text-[#e14177]/70 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Quiz Not Available</h2>
          <p className="text-center mb-6">{error}</p>
          <Link
            to={module ? `/student/modules/${typeof module === 'object' ? module._id : module}/quizzes` : '/student/modules'}
            className="bg-[#01427a] hover:bg-[#01325e] text-white py-2 px-4 rounded-md transition-colors font-medium"
          >
            Return to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-[#004080] to-[#6dcffb] text-white p-6 rounded-lg shadow-md mb-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Take Quiz</h1>
              <p className="text-white/90">Quiz information</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/student/modules" className="bg-white text-[#004080] px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
                Back to Modules
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-[#6dcffb]/10 text-[#01427a] p-6 rounded-md border border-[#6dcffb]/20 flex flex-col items-center justify-center py-12">
          <svg className="w-16 h-16 text-[#01427a]/70 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Quiz Not Found</h2>
          <p className="text-center mb-6">Quiz not found or you don't have access to it.</p>
          <Link to="/student/modules" className="bg-[#01427a] hover:bg-[#01325e] text-white py-2 px-4 rounded-md transition-colors font-medium">
            Return to Modules
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = currentStep >= 0 ? quiz.questions[currentStep] : null;

  return (
    <div className="space-y-8">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#004080] to-[#6dcffb] text-white p-6 rounded-lg shadow-md mb-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{quiz.title}</h1>
            <p className="text-white/90">Answer the questions to test your knowledge</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to={`/student/modules/${quiz.module._id}/quizzes`} className="bg-white text-[#004080] px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
              Back to Quizzes
            </Link>
          </div>
        </div>
      </div>



      {/* Quiz Progress */}
      {currentStep >= 0 && (
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-md mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="bg-[#6dcffb]/10 p-1.5 rounded-md mr-3">
                <svg className="w-5 h-5 text-[#6dcffb]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800">Your Progress</h2>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 mr-3">
                {(() => {
                  // Count how many questions have been answered
                  const answeredCount = answers.filter(answer =>
                    answer.selectedOptions.length > 0 || answer.textAnswer.trim().length > 0
                  ).length;

                  if (showFeedback) {
                    return '100%';
                  } else if (answeredCount === 0) {
                    return '0%';
                  } else if (answeredCount === quiz.questions.length) {
                    return '100%';
                  } else {
                    return Math.round((answeredCount / quiz.questions.length) * 100) + '%';
                  }
                })()}
              </span>
              <div className="text-sm font-medium text-[#01427a] bg-[#6dcffb]/10 px-3 py-1 rounded-full">
                Question {currentStep + 1} of {quiz.questions.length}
              </div>
            </div>
          </div>
          <div className="bg-gray-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-[#01427a] h-full transition-all duration-300"
              style={{ width: (() => {
                // Count how many questions have been answered
                const answeredCount = answers.filter(answer =>
                  answer.selectedOptions.length > 0 || answer.textAnswer.trim().length > 0
                ).length;

                if (showFeedback) {
                  return '100%';
                } else if (answeredCount === 0) {
                  return '0%';
                } else if (answeredCount === quiz.questions.length) {
                  return '100%';
                } else {
                  return `${(answeredCount / quiz.questions.length) * 100}%`;
                }
              })() }}
            ></div>
          </div>
        </div>
      )}

      {/* Current Question or Results */}
      <div className="border border-gray-100 rounded-lg bg-white shadow-md p-6 relative">
        {showFeedback && currentStep === -1 && (
          <>
            <div className="absolute top-0 right-0 bg-[#01427a] text-white text-xs font-medium px-3 py-1 rounded-bl-md">
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Quiz Completed
              </div>
            </div>

            {/* Results Summary */}
            <div className="mb-6 p-4 bg-[#01427a]/5 rounded-md border border-[#01427a]/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#01427a] mb-1">Quiz Completed</h4>
                  <p className="text-gray-700">
                    You scored <span className="font-bold">{questionResults.filter(result => result.isCorrect).length}</span> out of <span className="font-bold">{quiz.questions.length}</span> questions correctly
                  </p>
                  {successMessage && successMessage.includes('Failed to save') && (
                    <p className="text-[#e14177] text-sm mt-2">
                      <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Failed to save quiz to server. Your results are shown but not saved.
                    </p>
                  )}
                </div>
                <div className="w-16 h-16 rounded-full bg-[#01427a] text-white flex items-center justify-center text-lg font-bold shadow-md">
                  {questionResults.filter(result => result.isCorrect).length}/{quiz.questions.length}
                </div>
              </div>
            </div>

            {/* Question Navigation Buttons */}
            <div className="flex justify-center space-x-4 mb-6">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${questionResults[index].isCorrect
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-[#e14177]/10 text-[#e14177] border border-[#e14177]/30'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </>
        )}



        {/* Question Display */}
        {currentStep >= 0 && (
          <>
            <div className="flex items-center mb-6 pb-3 border-b border-gray-100">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#01427a] text-white font-bold mr-4 shadow-sm">{currentStep + 1}</span>
              <h3 className="text-xl font-bold text-gray-800">{currentQuestion.questionText}</h3>
            </div>

            {/* Score Display - Only shown when quiz is completed */}
            {showFeedback && (
              <div className="mb-6 p-4 bg-[#01427a]/5 rounded-md border border-[#01427a]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#01427a] mb-1">Quiz Completed</h4>
                    <p className="text-gray-700">
                      You scored <span className="font-bold">{questionResults.filter(result => result.isCorrect).length}</span> out of <span className="font-bold">{quiz.questions.length}</span> questions correctly
                    </p>
                    {successMessage && successMessage.includes('Failed to save') && (
                      <p className="text-[#e14177] text-sm mt-2">
                        <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Failed to save quiz to server. Your results are shown but not saved.
                      </p>
                    )}
                  </div>
                  <div className="w-16 h-16 rounded-full bg-[#01427a] text-white flex items-center justify-center text-lg font-bold shadow-md">
                    {questionResults.filter(result => result.isCorrect).length}/{quiz.questions.length}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Question Type: Multiple Choice or True/False */}
        {(currentQuestion.questionType === 'multiple-choice' || currentQuestion.questionType === 'true-false') && (
          <div className="space-y-4">
            {currentQuestion.options.map((option, optionIndex) => {
              const isSelected = answers[currentStep].selectedOptions.includes(option._id);
              const isCorrect = option.isCorrect;
              const showCorrectness = showFeedback && isSelected;

              // Determine styling based on selection, correctness, and feedback state
              let optionClass = "p-4 rounded-md border cursor-pointer transition-all hover:shadow-sm";

              if (showFeedback) {
                if (isSelected && isCorrect) {
                  // Selected and correct
                  optionClass += " border-green-500 bg-green-50 shadow-sm";
                } else if (isSelected && !isCorrect) {
                  // Selected but incorrect
                  optionClass += " border-[#e14177] bg-[#e14177]/5 shadow-sm";
                } else if (!isSelected && isCorrect) {
                  // Not selected but is correct (show after wrong selection)
                  optionClass += " border-green-500 bg-green-50/30 shadow-sm";
                } else {
                  // Not selected and not correct
                  optionClass += " border-gray-200 hover:border-gray-300";
                }
              } else {
                // Before feedback
                optionClass += isSelected
                  ? " border-[#6dcffb] bg-[#6dcffb]/10 shadow-sm"
                  : " border-gray-200 hover:border-[#6dcffb] hover:bg-gray-50";
              }

              return (
                <div
                  key={optionIndex}
                  className={`${optionClass} ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
                  onClick={() => {
                    if (!showFeedback) {
                      handleOptionSelect(
                        currentStep,
                        optionIndex,
                        currentQuestion.questionType === 'multiple-choice'
                      );
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full border-2 mr-3 ${
                        showFeedback && isSelected && isCorrect
                          ? 'border-green-500 bg-green-500 text-white'
                          : showFeedback && isSelected && !isCorrect
                            ? 'border-[#e14177] bg-[#e14177] text-white'
                            : isSelected
                              ? 'border-[#6dcffb] bg-[#6dcffb] text-white'
                              : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span>{option.text}</span>
                    </div>

                    {showFeedback && (
                      <div>
                        {isSelected && isCorrect && (
                          <span className="text-green-600 font-medium flex items-center bg-green-50 px-2 py-1 rounded border border-green-200">
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Correct
                          </span>
                        )}
                        {isSelected && !isCorrect && (
                          <span className="text-[#e14177] font-medium flex items-center bg-[#e14177]/10 px-2 py-1 rounded border border-[#e14177]/20">
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Incorrect
                          </span>
                        )}
                        {!isSelected && isCorrect && (
                          <span className="text-green-600 font-medium flex items-center bg-green-50 px-2 py-1 rounded border border-green-200">
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Correct Answer
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Question Type: Short Answer */}
        {currentQuestion.questionType === 'short-answer' && (
          <div>
            <textarea
              value={answers[currentStep].textAnswer}
              onChange={(e) => !showFeedback && handleTextAnswerChange(currentStep, e.target.value)}
              rows="5"
              disabled={showFeedback}
              className={`w-full px-4 py-3 border rounded-md ${showFeedback
                ? 'bg-gray-50 border-gray-200 text-gray-700'
                : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#01427a]/30 focus:border-[#01427a]'}`}
              placeholder="Type your answer here..."
            ></textarea>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {/* Left side buttons */}
          <div className="flex items-center space-x-3">
            {/* Previous button - Only shown when not in feedback mode */}
            {!showFeedback && (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex items-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md transition-colors font-medium shadow-sm"
                disabled={currentStep <= 0}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
            )}

            {/* Results navigation buttons - Only shown when in feedback mode */}
            {showFeedback && currentStep >= 0 && (
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex items-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md transition-colors font-medium shadow-sm"
                  disabled={currentStep <= 0}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                {currentStep < quiz.questions.length - 1 && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md transition-colors font-medium shadow-sm"
                  >
                    Next
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            {!showFeedback ? (
              currentStep < quiz.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center bg-[#6dcffb] hover:bg-[#5bb8e8] text-white py-2.5 px-4 rounded-md transition-colors font-medium"
                >
                  Next
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <div className="flex flex-col items-end">
                  {!allQuestionsAnswered && (
                    <div className="flex items-center text-[#e14177] text-sm mb-2">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Please answer all questions before finishing</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className={`flex items-center py-2.5 px-4 rounded-md transition-colors font-medium ${allQuestionsAnswered
                      ? 'bg-[#01427a] hover:bg-[#01325e] text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    disabled={!allQuestionsAnswered}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    View Results
                  </button>
                </div>
              )
            ) : (
              <div className="flex space-x-3">
                <Link to={`/student/modules/${quiz.module._id}/quizzes`} className="flex items-center bg-[#01427a] hover:bg-[#01325e] text-white py-2.5 px-4 rounded-md transition-colors font-medium">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Quizzes
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
