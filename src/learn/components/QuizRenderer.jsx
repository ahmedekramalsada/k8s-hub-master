import React, { useState } from 'react';

export default function QuizRenderer({ title, questions, nextModuleUrl }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const question = questions[currentQuestion];

    const handleAnswer = (optionIndex) => {
        if (isAnswered) return; // Prevent double-clicking
        setSelectedOption(optionIndex);
        setIsAnswered(true);

        if (optionIndex === question.correctIndex) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestion + 1 < questions.length) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setIsComplete(true);
        }
    };

    if (isComplete) {
        return (
            <section className="content-block">
                <h2>{title || "Knowledge Check"}</h2>
                <div style={{ textAlign: 'center', padding: '48px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <h2 style={{ fontSize: '2em', marginBottom: '16px', color: 'var(--color-primary)', borderBottom: 'none' }}>Quiz Complete!</h2>
                    <div style={{ fontSize: '4em', marginBottom: '24px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
                        {score}/{questions.length}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Your progress has been saved.</p>
                    {nextModuleUrl && (
                        <button className="btn btn-primary" onClick={() => window.location.href = nextModuleUrl}>
                            Proceed to Next Module
                        </button>
                    )}
                </div>
            </section>
        );
    }

    return (
        <section className="content-block">
            <h2>{title || "Knowledge Check"}</h2>
            <div style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.9em', color: 'var(--text-muted)', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
                    Question {currentQuestion + 1} of {questions.length}
                </div>
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem', lineHeight: 1.4 }}>{question.text}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {question.options.map((opt, idx) => {
                        let btnStyle = {
                            textAlign: 'left', padding: '14px 18px', width: '100%',
                            background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)',
                            borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                            color: 'var(--text-primary)', fontSize: '1rem', lineHeight: 1.4
                        };

                        if (isAnswered) {
                            if (idx === question.correctIndex) {
                                btnStyle.background = 'rgba(16, 185, 129, 0.1)';
                                btnStyle.borderColor = 'var(--color-emerald)';
                            } else if (idx === selectedOption) {
                                btnStyle.background = 'rgba(244, 63, 94, 0.1)';
                                btnStyle.borderColor = 'var(--color-rose)';
                            } else {
                                btnStyle.opacity = 0.5;
                                btnStyle.cursor = 'not-allowed';
                            }
                        } else {
                            btnStyle.cursor = 'pointer';
                        }

                        return (
                            <button 
                                key={idx} 
                                style={btnStyle}
                                disabled={isAnswered}
                                onClick={() => handleAnswer(idx)}
                                onMouseEnter={e => !isAnswered && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                onMouseLeave={e => !isAnswered && (e.currentTarget.style.background = 'var(--bg-panel)')}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>

                {isAnswered && (
                    <div style={{ 
                        marginTop: '24px', padding: '16px', borderRadius: '8px', 
                        background: selectedOption === question.correctIndex ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                        border: `1px solid ${selectedOption === question.correctIndex ? 'var(--color-emerald)' : 'var(--color-rose)'}`,
                        animation: 'fadeInUp 0.3s ease'
                    }}>
                        <strong style={{ display: 'block', marginBottom: '8px', fontSize: '1.1rem', color: selectedOption === question.correctIndex ? 'var(--color-emerald)' : 'var(--color-rose)' }}>
                            {selectedOption === question.correctIndex ? '✅ Correct!' : '❌ Incorrect'}
                        </strong>
                        <p style={{ margin: 0, fontSize: '0.95em', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                            {question.explanation}
                        </p>
                    </div>
                )}

                {isAnswered && (
                    <div style={{ marginTop: '24px', textAlign: 'right' }}>
                        <button className="btn btn-primary" onClick={handleNext}>
                            {currentQuestion + 1 < questions.length ? 'Next Question ➤' : 'Finish Quiz'}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
