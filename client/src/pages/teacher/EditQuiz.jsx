import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherAPI } from '../../services/api.new';
import { scrollToTop } from '../../utils/scrollUtils';

const EditQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [quizData, setQuizData] = useState({
    title: '',
    questions: []
  });

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const response = await teacherAPI.getQuiz(quizId);
        const fetchedQuiz = response.data.data;

        setQuiz(fetchedQuiz);
        setModule(fetchedQuiz.module);

        // Initialize form with quiz data
        setQuizData({
          title: fetchedQuiz.title,
          questions: fetchedQuiz.questions.map(q => ({
            ...q,
            options: q.options.map(opt => ({
              ...opt
            }))
          }))
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz data');
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  const validateQuiz = () => {
    // Validate title
    if (!quizData.title.trim()) {
      setError('Quiz title is required');
      scrollToTop();
      return false;
    }

    // Validate questions
    if (quizData.questions.length === 0) {
      setError('Quiz must have at least one question');
      scrollToTop();
      return false;
    }

    for (let i = 0; i < quizData.questions.length; i++) {
      const question = quizData.questions[i];

      // Validate question text
      if (!question.questionText.trim()) {
        setError(`Question ${i + 1} text is required`);
        scrollToTop();
        return false;
      }

      // Validate options for multiple choice and true-false questions
      if (question.questionType !== 'short-answer') {
        // Check if options exist
        if (!question.options || question.options.length === 0) {
          setError(`Question ${i + 1} must have options`);
          scrollToTop();
          return false;
        }

        // Check if options have text
        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j].text.trim()) {
            setError(`Option ${j + 1} for Question ${i + 1} text is required`);
            scrollToTop();
            return false;
          }
        }

        // Check if at least one option is marked as correct
        const hasCorrectOption = question.options.some(option => option.isCorrect);
        if (!hasCorrectOption) {
          setError(`Question ${i + 1} must have at least one correct answer`);
          scrollToTop();
          return false;
        }
      }
    }

    return true;
  };

  const handleQuizDataChange = (e) => {
    const { name, value } = e.target;
    setQuizData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        [field]: value
      };
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[questionIndex].options];

      // If changing isCorrect, handle radio button behavior for multiple choice
      if (field === 'isCorrect' && value === true && updatedQuestions[questionIndex].questionType === 'multiple-choice') {
        // Set all options to false first
        updatedOptions.forEach(option => option.isCorrect = false);
      }

      updatedOptions[optionIndex] = {
        ...updatedOptions[optionIndex],
        [field]: value
      };

      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: updatedOptions
      };

      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  // Create a ref for the last question
  const lastQuestionRef = React.useRef(null);

  const addQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: '',
          questionType: 'multiple-choice',
          points: 1, // Default points value
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ]
        }
      ]
    }));

    // Schedule scrolling to the new question after state update and render
    setTimeout(() => {
      if (lastQuestionRef.current) {
        lastQuestionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        // Focus on the question text input
        const questionTextInput = lastQuestionRef.current.querySelector('input[type="text"]');
        if (questionTextInput) {
          questionTextInput.focus();
        }
      }
    }, 100);
  };

  const removeQuestion = (questionIndex) => {
    if (quizData.questions.length <= 1) {
      setError('Quiz must have at least one question');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, index) => index !== questionIndex)
    }));
  };

  const addOption = (questionIndex) => {
    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[questionIndex].options, { text: '', isCorrect: false }];

      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: updatedOptions
      };

      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const currentOptions = quizData.questions[questionIndex].options;

    if (currentOptions.length <= 2) {
      setError('Question must have at least two options');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = updatedQuestions[questionIndex].options.filter((_, index) => index !== optionIndex);

      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: updatedOptions
      };

      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateQuiz()) {
      return;
    }

    try {
      // Always update the quiz and ensure it's published
      await teacherAPI.updateQuiz(quizId, {
        ...quizData,
        isPublished: true // Always ensure the quiz is published
      });

      setSuccessMessage('Quiz republished successfully!');
      scrollToTop(); // Scroll to the success message

      // Redirect to module details page after a short delay
      setTimeout(() => {
        navigate(`/teacher/modules/${module._id}`);
      }, 2000);
    } catch (err) {
      console.error('Error republishing quiz:', err);
      setError('Failed to republish quiz. Please try again.');
      scrollToTop(); // Scroll to the error message
    }
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="bg-danger/10 text-danger p-4 rounded-md">
        {error}
        <button
          onClick={() => navigate('/teacher/modules')}
          className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 mt-4"
        >
          Back to Modules
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#01427a]">Edit Quiz: {quiz?.title}</h1>
        <button
          onClick={() => navigate(`/teacher/modules/${module._id}`)}
          className="btn bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-success/10 text-success p-4 rounded-md">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quiz Details */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Quiz Details</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="form-label">Quiz Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={quizData.title}
                onChange={handleQuizDataChange}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="btn bg-[#01427a] hover:bg-[#01325e] text-white px-4 py-2 rounded-md font-medium"
            >
              Add Question
            </button>
          </div>

          {quizData.questions.map((question, questionIndex) => (
            <div
              key={questionIndex}
              className="card border border-gray-200 rounded-lg p-6 bg-white shadow-sm"
              ref={questionIndex === quizData.questions.length - 1 ? lastQuestionRef : null}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-[#01427a]">Question {questionIndex + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="text-[#e14177] hover:text-[#c73868] font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                  <input
                    type="text"
                    value={question.questionText}
                    onChange={(e) => handleQuestionChange(questionIndex, 'questionText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01427a] focus:border-[#01427a]"
                    required
                  />
                </div>

                {/* Question Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                  <div className="relative">
                    <div className="flex items-center justify-between border border-gray-300 rounded-md p-2 bg-white">
                      <span className="text-gray-700">{question.questionType === 'multiple-choice' ? 'Multiple Choice' : 'True/False'}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <select
                      value={question.questionType}
                      onChange={(e) => handleQuestionChange(questionIndex, 'questionType', e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    >
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="true-false">True/False</option>
                    </select>
                  </div>
                </div>

                {/* Options */}
                {question.questionType !== 'short-answer' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700">Options</label>
                      {question.questionType !== 'true-false' && (
                        <button
                          type="button"
                          onClick={() => addOption(questionIndex)}
                          className="text-[#01427a] hover:text-[#01325e] text-sm font-medium"
                        >
                          Add Option
                        </button>
                      )}
                    </div>

                    {question.questionType === 'true-false' ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md">
                          <input
                            type="radio"
                            id={`option-${questionIndex}-0`}
                            name={`correct-${questionIndex}`}
                            checked={question.options[0].isCorrect}
                            onChange={() => {
                              handleOptionChange(questionIndex, 0, 'isCorrect', true);
                              handleOptionChange(questionIndex, 1, 'isCorrect', false);
                            }}
                            className="w-4 h-4 text-[#01427a] border-gray-300 focus:ring-[#01427a]"
                          />
                          <label htmlFor={`option-${questionIndex}-0`} className="text-gray-700">True</label>
                        </div>
                        <div className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md">
                          <input
                            type="radio"
                            id={`option-${questionIndex}-1`}
                            name={`correct-${questionIndex}`}
                            checked={question.options[1].isCorrect}
                            onChange={() => {
                              handleOptionChange(questionIndex, 0, 'isCorrect', false);
                              handleOptionChange(questionIndex, 1, 'isCorrect', true);
                            }}
                            className="w-4 h-4 text-[#01427a] border-gray-300 focus:ring-[#01427a]"
                          />
                          <label htmlFor={`option-${questionIndex}-1`} className="text-gray-700">False</label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`option-${questionIndex}-${optionIndex}`}
                              name={`correct-${questionIndex}`}
                              checked={option.isCorrect}
                              onChange={() => handleOptionChange(questionIndex, optionIndex, 'isCorrect', true)}
                              className="w-4 h-4 text-[#01427a] border-gray-300 focus:ring-[#01427a]"
                            />
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01427a] focus:border-[#01427a] flex-grow"
                              placeholder={`Option ${optionIndex + 1}`}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(questionIndex, optionIndex)}
                              className="text-[#e14177] hover:text-[#c73868] font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/teacher/modules/${module._id}`)}
            className="btn bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Cancel
          </button>
          <button type="submit" className="btn bg-[#01427a] hover:bg-[#01325e] text-white">
            Republish Quiz
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditQuiz;
