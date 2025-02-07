import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Quiz from "./components/Quiz";
import { useState } from "react";

const App = () => {
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const handleQuizComplete = (finalScore, total) => {
    setScore(finalScore);
    setTotalQuestions(total);
  };

  return (
    Quiz()
    
  );
};

export default App;
