import React, { useState, useEffect } from 'react';
import { Trophy, Timer, AlertCircle } from 'lucide-react';
import { useSpring, animated } from 'react-spring';
import { FcLikePlaceholder  } from "react-icons/fc";
import { FaRegSadTear } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import { ImCross } from "react-icons/im";
import correctSound from './sounds/correct.mp3';
import wrongSound from './sounds/wrong-47985.mp3';
import './QuizApp.css';

const QuizApp = () => {
  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [flowerAnimation, setFlowerAnimation] = useState(null);
  const [showFlower, setShowFlower] = useState(false); // For controlling visibility of the flower animation

  useEffect(() => {
    fetchQuizData();
  }, []);

  useEffect(() => {
    let timer;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleNextQuestion();
    }
    return () => clearInterval(timer);
  }, [timeLeft, isActive]);

  const playSound = (isCorrect) => {
    const audio = new Audio(isCorrect ? correctSound : wrongSound);
    audio.play().catch(error => console.log('Error playing sound:', error));
  };

  const fetchQuizData = async () => {
    try {
      const response = await fetch('/api/Uw5CrX');
      const data = await response.json();
      setQuizData(data);
      setQuestions(data.questions);
      setTimeLeft(data.duration);
      setLoading(false);
    } catch (err) {
      setError('Failed to load quiz questions. Please try again.');
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setIsActive(true);
    setTimeLeft(quizData.duration);
  };

  const handleAnswerClick = (isCorrect) => {
    if (selectedOption !== null) return; // Prevent multiple clicks
    setSelectedOption(isCorrect);

    // Set flower animation based on answer correctness
    setFlowerAnimation(isCorrect ? 'happy' : 'sad');
    setShowFlower(true); // Show flower animation

    // Play sound based on answer correctness
    playSound(isCorrect);

    if (isCorrect) {
      setScore((prevScore) => prevScore + Number(quizData.correct_answer_marks));
    } else {
      setMistakeCount((prev) => prev + 1);
      if (quizData.max_mistake_count && mistakeCount + 1 >= quizData.max_mistake_count) {
        setTimeout(() => {
          endQuiz();
        }, 1000); // Delay to allow sound to play
        return;
      }
    }

    // Delay next question to allow sound to play
    setTimeout(() => {
      handleNextQuestion();
      setSelectedOption(null); // Reset selection
      setFlowerAnimation(null); // Reset flower animation
      setShowFlower(false); // Hide flower animation after transition
    }, 1000);
  };

  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setTimeLeft(quizData.duration);
    } else {
      endQuiz();
    }
  };

  const endQuiz = () => {
    setIsActive(false);
    setShowScore(true);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setTimeLeft(quizData.duration);
    setIsActive(false);
    setMistakeCount(0);
    setSelectedOption(null);
    setFlowerAnimation(null);
    setShowFlower(false);
  };

  // Flower animation logic
  const flowerProps = useSpring({
    transform: flowerAnimation === 'happy' ? 'scale(1.5)' : flowerAnimation === 'sad' ? 'scale(0.8)' : 'scale(1)',
    opacity: flowerAnimation ? 1 : 0,
    config: { tension: 170, friction: 26 },
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertCircle className="error-icon" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <div className="quiz-header">
          <h1 className="quiz-title">
            {quizData?.title || 'Quiz'}
          </h1>
          {isActive && (
            <>
              <div className="timer">
                <Timer className="timer-icon" />
                <span>Time Left: {timeLeft} seconds</span>
              </div>
              <div className="quiz-info">
                <span>Mistakes: {mistakeCount}/{quizData.max_mistake_count || '∞'}</span>
                <span>Topic: {quizData.topic}</span>
              </div>
            </>
          )}
        </div>

        <div className="quiz-content">
          {!isActive && !showScore ? (
            <div className="welcome-screen">
              <p>Test your knowledge in {quizData.topic}!</p>
              <div className="quiz-rules">
                <p>Duration per question: {quizData.duration} seconds</p>
                <p>Total questions: {quizData.questions_count}</p>
                {quizData.max_mistake_count && (
                  <p>Maximum mistakes allowed: {quizData.max_mistake_count}</p>
                )}
                <p>Correct answer marks: {quizData.correct_answer_marks}</p>
                <p>Negative marks: {quizData.negative_marks}</p>
              </div>
              <button onClick={startQuiz} className="start-button">
                Start Quiz
              </button>
            </div>
          ) : showScore ? (
            <div className="score-screen">
              <Trophy className="trophy-icon" />
              <h2>Quiz Completed!</h2>
              <p className="score-text">
                Your Score: {score} points
              </p>
              <p className="mistake-text">
                Total Mistakes: {mistakeCount}
              </p>
              <button onClick={resetQuiz} className="retry-button">
                Retry Quiz
              </button>
            </div>
          ) : (
            <div className="question-screen">
              <div className="question-header">
                <h2>Question {currentQuestion + 1} of {questions.length}</h2>
                <p className="question-text">{questions[currentQuestion].description}</p>
              </div>
              <div className="options-container">
                {questions[currentQuestion].options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerClick(option.is_correct)}
                    className="option-button"
                    disabled={selectedOption !== null}
                  >
                    {option.description}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Display flower animation */}
      <animated.div
        style={flowerProps}
        className={`flower-animation ${showFlower ? 'show' : ''}`}
      >
        {flowerAnimation === 'happy' ? <FcLikePlaceholder  size={50} color="yellow" /> : flowerAnimation === 'sad' ? <ImCross size={50} color="blue" /> : null}
      </animated.div>
    </div>
  );
};

export default QuizApp;
