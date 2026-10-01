import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherAPI } from '../../services/api';
import { scrollToTop } from '../../utils/scrollUtils';

const CreateQuiz = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [quizData, setQuizData] = useState({
    title: '',
    description: 'No description provided',
    questions: [
      {
        questionText: '',
        questionType: 'multiple-choice',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ]
      }
    ]
  });

  useEffect(() => {
    const fetchModuleDetails = async () => {
      try {
        const response = await teacherAPI.getModuleDetails(moduleId);
        console.log('Module details response:', response.data);

        // Handle different response structures
        if (response.data && response.data.data) {
          if (response.data.data.module) {
            // If the API returns { data: { module, lessons } }
            setModule(response.data.data.module);
          } else {
            // If the API returns { data: module }
            setModule(response.data.data);
          }
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching module details:', err);
        setError('Failed to load module details');
      } finally {
        setLoading(false);
      }
    };

    fetchModuleDetails();
  }, [moduleId]);

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
  const lastQuestionRef = useRef(null);

  const addQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: '',
          questionType: 'multiple-choice',
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
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: [
          ...updatedQuestions[questionIndex].options,
          { text: '', isCorrect: false }
        ]
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
      setError('Questions must have at least two options');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setQuizData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: currentOptions.filter((_, index) => index !== optionIndex)
      };
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const validateQuiz = () => {
    // Check quiz title
    if (!quizData.title.trim()) {
      setError('Quiz title is required');
      scrollToTop();
      return false;
    }

    // Validate each question
    for (let i = 0; i < quizData.questions.length; i++) {
      const question = quizData.questions[i];

      if (!question.questionText.trim()) {
        setError(`Question ${i + 1} text is required`);
        scrollToTop();
        return false;
      }

      // Check if at least one option is marked as correct
      const hasCorrectOption = question.options.some(option => option.isCorrect);
      if (!hasCorrectOption) {
        setError(`Question ${i + 1} must have at least one correct answer`);
        scrollToTop();
        return false;
      }

      // Check if all options have text
      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j].text.trim()) {
          setError(`Option ${j + 1} for Question ${i + 1} text is required`);
          scrollToTop();
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateQuiz()) {
      return;
    }

    try {
      // Create the quiz and set it as published directly
      const quizToPublish = {
        ...quizData,
        isPublished: true // Always publish immediately
      };

      const response = await teacherAPI.createQuiz(moduleId, quizToPublish);

      setSuccessMessage('Quiz published successfully!');
      scrollToTop(); // Scroll to the success message

      // Redirect to module details page after a short delay
      setTimeout(() => {
        navigate(`/teacher/modules/${moduleId}`);
      }, 2000);
    } catch (err) {
      console.error('Error publishing quiz:', err);
      setError('Failed to publish quiz. Please try again.');
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

  if (!module) {
    return (
      <div className="bg-danger/10 text-danger p-4 rounded-md">
        Module not found or you don't have access to it.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1>Create Quiz for {module.title}</h1>
        <button
          onClick={() => navigate('/teacher/modules')}
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
              className="btn btn-primary"
            >
              Add Question
            </button>
          </div>

          {quizData.questions.map((question, questionIndex) => (
            <div
              key={questionIndex}
              className="card border-2 border-gray-200"
              ref={questionIndex === quizData.questions.length - 1 ? lastQuestionRef : null}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">Question {questionIndex + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="text-danger hover:text-danger/80"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor={`question-${questionIndex}`} className="form-label">Question Text</label>
                  <input
                    type="text"
                    id={`question-${questionIndex}`}
                    value={question.questionText}
                    onChange={(e) => handleQuestionChange(questionIndex, 'questionText', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label htmlFor={`questionType-${questionIndex}`} className="form-label">Question Type</label>
                  <select
                    id={`questionType-${questionIndex}`}
                    value={question.questionType}
                    onChange={(e) => handleQuestionChange(questionIndex, 'questionType', e.target.value)}
                    className="form-input"
                  >
                    <option value="multiple-choice">Multiple Choice (Single Answer)</option>
                    <option value="true-false">True/False</option>
                    <option value="short-answer">Short Answer</option>
                  </select>
                </div>

                {/* Options */}
                {question.questionType !== 'short-answer' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="form-label">Options</label>
                      {question.questionType !== 'true-false' && (
                        <button
                          type="button"
                          onClick={() => addOption(questionIndex)}
                          className="text-primary hover:text-primary/80 text-sm"
                        >
                          Add Option
                        </button>
                      )}
                    </div>

                    {question.questionType === 'true-false' ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`option-${questionIndex}-0`}
                            name={`correct-${questionIndex}`}
                            checked={question.options[0].isCorrect}
                            onChange={() => {
                              handleOptionChange(questionIndex, 0, 'isCorrect', true);
                              handleOptionChange(questionIndex, 1, 'isCorrect', false);
                            }}
                            className="h-4 w-4 text-primary"
                          />
                          <label htmlFor={`option-${questionIndex}-0`} className="form-label m-0">True</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`option-${questionIndex}-1`}
                            name={`correct-${questionIndex}`}
                            checked={question.options[1].isCorrect}
                            onChange={() => {
                              handleOptionChange(questionIndex, 0, 'isCorrect', false);
                              handleOptionChange(questionIndex, 1, 'isCorrect', true);
                            }}
                            className="h-4 w-4 text-primary"
                          />
                          <label htmlFor={`option-${questionIndex}-1`} className="form-label m-0">False</label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <input
                              type={question.questionType === 'multiple-choice' ? 'radio' : 'checkbox'}
                              id={`option-${questionIndex}-${optionIndex}`}
                              name={question.questionType === 'multiple-choice' ? `correct-${questionIndex}` : undefined}
                              checked={option.isCorrect}
                              onChange={() => handleOptionChange(questionIndex, optionIndex, 'isCorrect', !option.isCorrect)}
                              className="h-4 w-4 text-primary"
                            />
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)}
                              className="form-input flex-grow"
                              placeholder={`Option ${optionIndex + 1}`}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(questionIndex, optionIndex)}
                              className="text-danger hover:text-danger/80"
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
            onClick={() => navigate('/teacher/modules')}
            className="btn bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save & Publish Quiz
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
