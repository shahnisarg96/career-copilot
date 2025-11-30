import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiLoader, FiCheckCircle, FiAlertCircle, FiX, FiRefreshCw, FiEdit, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../utils/util.js';

const AIWizard = ({ onClose, onComplete }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState('quickStart');
    const [generatedData, setGeneratedData] = useState({});
    const [isComplete, setIsComplete] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const { getAuthHeaders } = useAuth();

    const steps = [
        { id: 'quickStart', label: 'Quick Start', icon: '⚡' }
    ];

    useEffect(() => {
        // Initial greeting - streamlined
        setMessages([{
            type: 'ai',
            text: "👋 Welcome! I'm your AI Portfolio Assistant.\n\nI'll create your complete portfolio with just 5-6 quick questions - it takes less than 2 minutes!\n\nReady? Let's start with your full name:",
            timestamp: new Date()
        }]);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            type: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Send to AI endpoint
            const response = await fetch(`${API_BASE}/ai/generate-portfolio`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    step: currentStep,
                    userInput: input,
                    previousData: generatedData
                })
            });

            if (response.ok) {
                const data = await response.json();

                const aiMessage = {
                    type: 'ai',
                    text: data.response,
                    timestamp: new Date(),
                    data: data.generatedData
                };

                setMessages(prev => [...prev, aiMessage]);

                if (data.generatedData) {
                    console.log('Generated data received:', data.generatedData);
                    setGeneratedData(data.generatedData);
                }

                if (data.nextStep) {
                    setCurrentStep(data.nextStep);
                }

                if (data.isComplete) {
                    console.log('Portfolio complete! Final data:', data.generatedData);
                    setIsComplete(true);
                }
            }
        } catch (error) {
            console.error('AI Error:', error);
            const errorMessage = {
                type: 'ai',
                text: "I apologize, but I'm having trouble connecting. Let's continue - please tell me more!",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSaveAndContinue = async () => {
        try {
            setLoading(true);
            console.log('Saving portfolio data:', generatedData);
            
            // Save all generated data to backend through AI service
            const response = await fetch(`${API_BASE}/ai/save-portfolio`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(generatedData)
            });

            const result = await response.json();
            console.log('Save response:', result);

            if (response.ok) {
                console.log('Portfolio saved successfully!');
                onComplete?.();
                navigate('/dashboard');
            } else {
                throw new Error(result.error || 'Failed to save portfolio');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save portfolio: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-content">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                                🤖
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">AI Portfolio Wizard</h2>
                                <p className="text-sm opacity-90">Powered by ChatGPT • Building your portfolio in minutes</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="btn btn-circle btn-ghost">
                            <FiX className="text-2xl" />
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                        {steps.map((step, index) => {
                            const stepIndex = steps.findIndex(s => s.id === currentStep);
                            const isActive = step.id === currentStep;
                            const isCompleted = index < stepIndex;

                            return (
                                <div
                                    key={step.id}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${isActive ? 'bg-white/30 scale-105' : isCompleted ? 'bg-white/10' : 'bg-white/5'
                                        }`}
                                >
                                    <span className="text-lg">{step.icon}</span>
                                    <span className="text-sm font-medium">{step.label}</span>
                                    {isCompleted && <FiCheckCircle className="text-success" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-base-200">
                    <AnimatePresence>
                        {messages.map((message, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl p-4 ${message.type === 'user'
                                            ? 'bg-primary text-primary-content'
                                            : 'bg-base-100 shadow-lg'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap">{message.text}</p>
                                    {message.data && (
                                        <div className="mt-2 pt-2 border-t border-base-content/10">
                                            <div className="flex items-center gap-2 text-sm opacity-70">
                                                <FiCheckCircle className="text-success" />
                                                <span>Generated content saved</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="bg-base-100 rounded-2xl p-4 shadow-lg">
                                <div className="flex items-center gap-2">
                                    <FiLoader className="animate-spin text-primary" />
                                    <span className="text-sm">AI is thinking...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {isComplete && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-success/20 border-2 border-success rounded-2xl p-6 text-center"
                        >
                            <FiCheckCircle className="text-5xl text-success mx-auto mb-4" />
                            <h3 className="text-2xl font-bold mb-2">🎉 Portfolio Generated!</h3>
                            <p className="mb-6 text-base-content/70">
                                Your portfolio has been created with AI assistance. You can now review, edit, or publish it.
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <button
                                    onClick={handleSaveAndContinue}
                                    className="btn btn-success gap-2"
                                    disabled={loading}
                                >
                                    {loading ? <FiLoader className="animate-spin" /> : <FiEdit />}
                                    Save & Edit Sections
                                </button>
                                <button
                                    onClick={() => navigate('/portfolio/preview')}
                                    className="btn btn-primary gap-2"
                                >
                                    <FiEye />
                                    Preview Portfolio
                                </button>
                                <button
                                    onClick={() => {
                                        setIsComplete(false);
                                        setMessages([{
                                            type: 'ai',
                                            text: "👋 Welcome! I'm your AI Portfolio Assistant.\n\nI'll create your complete portfolio with just 5-6 quick questions - it takes less than 2 minutes!\n\nReady? Let's start with your full name:",
                                            timestamp: new Date()
                                        }]);
                                        setCurrentStep('quickStart');
                                        setGeneratedData({});
                                    }}
                                    className="btn btn-ghost gap-2"
                                >
                                    <FiRefreshCw />
                                    Start Over
                                </button>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                {!isComplete && (
                    <div className="border-t border-base-300 p-4 bg-base-100">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your response..."
                                className="input input-bordered flex-1"
                                disabled={loading}
                            />
                            <button
                                onClick={handleSend}
                                className="btn btn-primary"
                                disabled={loading || !input.trim()}
                            >
                                {loading ? <FiLoader className="animate-spin" /> : <FiSend />}
                            </button>
                        </div>
                        <p className="text-xs text-base-content/50 mt-2 text-center">
                            Press Enter to send • Shift + Enter for new line
                        </p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default AIWizard;
