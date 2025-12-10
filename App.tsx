
import React, { useState, useEffect } from 'react';
import { FeatureMode, CareerAnalysisResult } from './types';
import { FileUpload } from './components/FileUpload';
import { AnalysisResult } from './components/AnalysisResult';
import { ChatInterface } from './components/ChatInterface';
import { AuthModal } from './components/AuthModal';
import { BottomNav } from './components/BottomNav';
import { analyzeProfile, getQuickTip } from './services/geminiService';
import { LayoutDashboard, MessageSquare, Zap, Target, UserCircle, Settings, Bell, Moon, LogOut, ChevronRight, House } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<FeatureMode>(FeatureMode.ANALYSIS);
  const [analysisData, setAnalysisData] = useState<CareerAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quickTip, setQuickTip] = useState<string>('');
  
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState<{text: string, image?: string} | null>(null);

  useEffect(() => {
    // Load a quick tip on mount
    const loadTip = async () => {
      try {
        const tip = await getQuickTip();
        setQuickTip(tip);
      } catch (e: any) {
        console.error("Failed to load tip:", e);
        // Don't alert for background tip loading failures, just log and use fallback
        setQuickTip("Stay curious and keep growing.");
      }
    };
    loadTip();
  }, []);

  const executeAnalysis = async (text: string, imageBase64?: string) => {
    setIsLoading(true);
    // Switch to analysis mode if not already there
    setMode(FeatureMode.ANALYSIS);
    
    try {
      const result = await analyzeProfile(text, imageBase64);
      setAnalysisData(result);
    } catch (error: any) {
      console.error("Analysis failed", error);
      
      let errorMessage = error.message || "Something went wrong with the AI analysis. Please try again.";
      
      // More friendly error for 404s (Model not found)
      if (error.message?.includes('404') || error.status === 404) {
        errorMessage = "The selected Gemini model is currently unavailable. Please try again later.";
      }
      
      // More friendly error for 500s/XHR/Network
      if (error.message?.includes('xhr') || error.message?.includes('fetch') || error.code === 500 || error.status === 500) {
        errorMessage = "Network or Server Error: The request took too long or the connection failed. Please try again with a smaller image or shorter text.";
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysisRequest = (text: string, imageBase64?: string) => {
    if (!isLoggedIn) {
      // User is not logged in. Save their request and show the auth modal.
      setPendingAnalysis({ text, image: imageBase64 });
      setShowAuthModal(true);
    } else {
      // User is logged in, proceed directly.
      executeAnalysis(text, imageBase64);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowAuthModal(false);
    
    // Resume the pending analysis if one exists
    if (pendingAnalysis) {
      executeAnalysis(pendingAnalysis.text, pendingAnalysis.image);
      setPendingAnalysis(null);
    }
  };

  const renderContent = () => {
    switch (mode) {
      case FeatureMode.ANALYSIS:
        return (
          <div className="space-y-12">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Career Profile Analysis</h2>
              <p className="text-gray-400">Upload your resume or enter your skills to get a deep AI-powered career roadmap using Gemini 3 Pro.</p>
            </header>

            {!analysisData ? (
              <div className="animate-in fade-in zoom-in duration-500">
                  {/* Pass the request handler instead of the direct executor */}
                  <FileUpload onDataReady={handleAnalysisRequest} isLoading={isLoading} />
                  
                  <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-50">
                    <div className="bg-dark-900 p-6 rounded-xl border border-dashed border-dark-700 h-40 flex items-center justify-center">
                      <span className="text-dark-700 font-bold">Skill Gap Analysis</span>
                    </div>
                    <div className="bg-dark-900 p-6 rounded-xl border border-dashed border-dark-700 h-40 flex items-center justify-center">
                      <span className="text-dark-700 font-bold">30-Day Plan</span>
                    </div>
                    <div className="bg-dark-900 p-6 rounded-xl border border-dashed border-dark-700 h-40 flex items-center justify-center">
                      <span className="text-dark-700 font-bold">Resume Rewrite</span>
                    </div>
                  </div>
              </div>
            ) : (
              <div className="space-y-6">
                <button 
                  onClick={() => setAnalysisData(null)}
                  className="text-sm text-gray-400 hover:text-white mb-4 flex items-center gap-1"
                >
                  ← Start Over
                </button>
                <AnalysisResult data={analysisData} />
              </div>
            )}
          </div>
        );

      case FeatureMode.CHAT:
        return (
          <div className="h-full flex flex-col">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">AI Career Mentor</h2>
              <p className="text-gray-400">Chat with FuturePath AI for instant advice, interview practice, or general career questions.</p>
            </header>
            <ChatInterface />
          </div>
        );

      case FeatureMode.SETTINGS:
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
             <header className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
              <p className="text-gray-400">Manage your preferences and app controls.</p>
            </header>

            <div className="bg-dark-900/50 rounded-2xl border border-dark-700 overflow-hidden">
               <div className="p-6 flex items-center justify-between border-b border-dark-800">
                 <div className="flex items-center gap-4">
                   <div className="bg-dark-800 p-2.5 rounded-lg">
                     <Bell className="w-5 h-5 text-brand-400" />
                   </div>
                   <div>
                     <p className="font-bold text-white">Notifications</p>
                     <p className="text-sm text-gray-400">Get updates on your learning plan</p>
                   </div>
                 </div>
                 <div className="w-12 h-6 bg-brand-600 rounded-full relative cursor-pointer shadow-inner">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                 </div>
               </div>

               <div className="p-6 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="bg-dark-800 p-2.5 rounded-lg">
                     <Moon className="w-5 h-5 text-purple-400" />
                   </div>
                   <div>
                     <p className="font-bold text-white">Dark Mode</p>
                     <p className="text-sm text-gray-400">Always on for visual comfort</p>
                   </div>
                 </div>
                 <div className="w-12 h-6 bg-dark-700/50 rounded-full relative cursor-not-allowed opacity-70">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-gray-500 rounded-full shadow-sm"></div>
                 </div>
               </div>
            </div>

            <div className="bg-dark-900/50 rounded-2xl border border-dark-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Data & Privacy</h3>
              <p className="text-sm text-gray-400 mb-4">
                Your data is processed by Gemini AI. We do not sell your personal information.
              </p>
              <button 
                onClick={() => {
                  setAnalysisData(null);
                  alert("Local analysis data cleared.");
                }}
                className="text-red-400 text-sm font-medium hover:text-red-300 flex items-center gap-2"
              >
                Clear Current Analysis Data
              </button>
            </div>
          </div>
        );

      case FeatureMode.PROFILE:
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
             <header className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">My Profile</h2>
              <p className="text-gray-400">Manage your account and viewing history.</p>
            </header>

            <div className="bg-gradient-to-r from-dark-800 to-dark-900 rounded-2xl border border-dark-700 p-8 flex flex-col md:flex-row items-center gap-8">
               <div className="relative">
                 <div className="w-24 h-24 bg-brand-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-brand-900/50">
                    {isLoggedIn ? 'A' : <UserCircle className="w-12 h-12" />}
                 </div>
                 {isLoggedIn && (
                   <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-dark-800 rounded-full"></div>
                 )}
               </div>
               <div className="text-center md:text-left flex-1">
                 <h3 className="text-2xl font-bold text-white mb-1">{isLoggedIn ? 'Akash Ankam' : 'Guest User'}</h3>
                 <p className="text-brand-400 font-medium mb-4">{isLoggedIn ? 'Software Engineer • Premium Member' : 'Not Logged In'}</p>
                 
                 {!isLoggedIn ? (
                    <button 
                      onClick={() => setShowAuthModal(true)}
                      className="bg-white text-dark-950 font-bold py-2.5 px-6 rounded-full hover:bg-gray-200 transition-colors shadow-lg"
                    >
                      Log in / Sign up
                    </button>
                 ) : (
                    <div className="flex gap-3 justify-center md:justify-start">
                      <button className="bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Edit Profile
                      </button>
                      <button 
                        onClick={() => setIsLoggedIn(false)}
                        className="bg-dark-800/50 hover:bg-red-900/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-dark-700"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                 )}
               </div>
            </div>

            {isLoggedIn && (
              <div className="space-y-4">
                 <h3 className="text-xl font-bold text-white">Recent Analyses</h3>
                 <div className="bg-dark-900 rounded-xl border border-dark-700 p-4 hover:border-brand-500/50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-center">
                      <div>
                         <p className="font-bold text-white group-hover:text-brand-400 transition-colors">Software Engineer Career Path</p>
                         <p className="text-xs text-gray-500">Generated on Oct 24, 2023</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-dark-600 group-hover:text-brand-500" />
                    </div>
                 </div>
                 <div className="bg-dark-900 rounded-xl border border-dark-700 p-4 hover:border-brand-500/50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-center">
                      <div>
                         <p className="font-bold text-white group-hover:text-brand-400 transition-colors">Data Science Skill Gap</p>
                         <p className="text-xs text-gray-500">Generated on Sep 12, 2023</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-dark-600 group-hover:text-brand-500" />
                    </div>
                 </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-gray-100 flex font-sans overflow-hidden">
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Sidebar Navigation - Hidden on mobile */}
      <nav className="hidden md:flex w-64 bg-dark-900 border-r border-dark-800 flex-shrink-0 flex-col h-screen">
        <div className="p-6 border-b border-dark-800">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 p-2 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">FuturePath AI</h1>
          </div>
        </div>

        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          <button
            onClick={() => setMode(FeatureMode.ANALYSIS)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
              mode === FeatureMode.ANALYSIS 
                ? 'bg-brand-600/10 text-brand-400 border border-brand-600/20' 
                : 'text-gray-400 hover:bg-dark-800 hover:text-white'
            }`}
          >
            <House className="w-5 h-5" />
            Career Analysis
          </button>
          <button
            onClick={() => setMode(FeatureMode.CHAT)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
              mode === FeatureMode.CHAT 
                ? 'bg-brand-600/10 text-brand-400 border border-brand-600/20' 
                : 'text-gray-400 hover:bg-dark-800 hover:text-white'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            AI Mentor Chat
          </button>
          <div className="pt-4 mt-4 border-t border-dark-800">
            <button
              onClick={() => setMode(FeatureMode.PROFILE)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                mode === FeatureMode.PROFILE
                  ? 'bg-brand-600/10 text-brand-400 border border-brand-600/20' 
                  : 'text-gray-400 hover:bg-dark-800 hover:text-white'
              }`}
            >
              <UserCircle className="w-5 h-5" />
              Profile
            </button>
             <button
              onClick={() => setMode(FeatureMode.SETTINGS)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                mode === FeatureMode.SETTINGS
                  ? 'bg-brand-600/10 text-brand-400 border border-brand-600/20' 
                  : 'text-gray-400 hover:bg-dark-800 hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-dark-800">
          <div className="bg-gradient-to-br from-brand-900/50 to-dark-800 p-4 rounded-xl border border-brand-900/50 mb-4">
            <div className="flex items-center gap-2 mb-2 text-brand-400">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Daily Tip</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed italic">
              "{quickTip || 'Loading...'}"
            </p>
          </div>

          {/* User Status */}
          <div className="flex items-center gap-3 px-2">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isLoggedIn ? 'bg-green-900/50 text-green-400' : 'bg-dark-800 text-gray-500'}`}>
                <UserCircle className="w-5 h-5" />
             </div>
             <div>
               <p className="text-sm font-medium text-white">{isLoggedIn ? 'User Logged In' : 'Guest'}</p>
               <button 
                  onClick={() => setShowAuthModal(true)} 
                  className={`text-xs hover:underline ${isLoggedIn ? 'hidden' : 'text-brand-400'}`}
                >
                  Log in / Sign up
               </button>
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Mobile Header - Visible only on mobile */}
        <div className="md:hidden bg-dark-900 border-b border-dark-800 p-4 flex items-center justify-between sticky top-0 z-40 shadow-xl">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-1.5 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">FuturePath AI</h1>
          </div>
          <button onClick={() => setMode(FeatureMode.PROFILE)} className="relative">
             <UserCircle className={`w-6 h-6 ${isLoggedIn ? 'text-green-400' : 'text-gray-400'}`} />
             {isLoggedIn && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-dark-900 rounded-full"></span>}
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-6 md:p-12 pb-24 md:pb-12 bg-dark-950 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </main>
        
        {/* Mobile Bottom Navigation */}
        <BottomNav currentMode={mode} onNavigate={setMode} />
      </div>

    </div>
  );
}