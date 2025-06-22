import React, { useState } from 'react';

// Simple icons as SVG components
const TrendingUpIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const TargetIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

const AwardIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const LightbulbIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21h6"></path>
    <path d="M12 3a6 6 0 0 0-6 6c0 1 .2 2 .6 2.8l1.4 2.2h8l1.4-2.2c.4-.8.6-1.8.6-2.8a6 6 0 0 0-6-6Z"></path>
  </svg>
);

const PlayIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21"></polygon>
  </svg>
);

const PauseIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

const PlaySmallIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21"></polygon>
  </svg>
);

const SkipBackIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="19,20 9,12 19,4"></polygon>
    <line x1="5" y1="19" x2="5" y2="5"></line>
  </svg>
);

const SkipForwardIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5,4 15,12 5,20"></polygon>
    <line x1="19" y1="5" x2="19" y2="19"></line>
  </svg>
);

const VolumeIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"></polygon>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
  </svg>
);

function Dashboard({ onBack, recordingBlob, analysisData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);

  // If no data yet, render nothing (parent keeps showing LoadingScreen)
  if (!analysisData) {
    return null;
  }

  const data = analysisData;

  const mainMetrics = [
    {
      title: "Confidence Score",
      value: `${data.confidenceScore}%`,
      color: "bg-emerald-600",
      icon: AwardIcon,
      progress: data.confidenceScore,
    },
    {
      title: "Eye Contact",
      value: `${data.eyeContactScore}%`,
      color: "bg-white",
      textColor: "text-gray-900",
      icon: EyeIcon,
      progress: data.eyeContactScore,
    },
    {
      title: "Clarity Score",
      value: `${data.clarityScore}%`,
      color: "bg-white",
      textColor: "text-gray-900",
      icon: TargetIcon,
      progress: data.clarityScore,
    },
    {
      title: "Engagement Score",
      value: `${data.engagementScore}%`,
      color: "bg-white",
      textColor: "text-gray-900",
      icon: TrendingUpIcon,
      progress: data.engagementScore,
    },
  ];

  const speechComposition = [
    { label: "Persuasive", percentage: data.speechComposition.persuasive, color: "bg-emerald-500" },
    { label: "Informative", percentage: data.speechComposition.informative, color: "bg-blue-500" },
    { label: "Demonstrative", percentage: data.speechComposition.demonstrative, color: "bg-orange-500" },
  ];

  const handleSliderChange = (setter) => (e) => {
    setter(parseInt(e.target.value));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-manrope">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onBack}
            className="btn-secondary"
          >
            ← Back to Recording
          </button>
          <h1 className="text-2xl font-bold text-text-primary">Speech Analysis Dashboard</h1>
          <div className="w-32"></div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-4 gap-4">
          {mainMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className={`${metric.color} ${index === 0 ? "text-white" : ""} border-0 shadow-sm rounded-lg`}>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-xs font-medium ${index === 0 ? "text-emerald-100" : "text-gray-600"}`}>
                        {metric.title}
                      </p>
                      <p className={`text-2xl font-bold mt-1 ${metric.textColor || ""}`}>{metric.value}</p>
                      {/* Progress bar */}
                      <div className="mt-2">
                        <div className={`w-full ${index === 0 ? "bg-emerald-500" : "bg-gray-200"} rounded-full h-1.5`}>
                          <div
                            className={`${index === 0 ? "bg-emerald-300" : "bg-emerald-500"} h-1.5 rounded-full transition-all duration-300`}
                            style={{ width: `${metric.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className={`p-2 rounded-full ${index === 0 ? "bg-emerald-500" : "bg-gray-100"}`}>
                      <Icon />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-4 min-h-96">
          {/* Speech Composition */}
          <div className="col-span-3 bg-white border-0 shadow-sm rounded-lg">
            <div className="p-4 pb-3 border-b">
              <h3 className="text-lg font-bold text-gray-900">Speech Composition</h3>
            </div>
            <div className="p-4 space-y-4">
              {/* Donut Chart */}
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-orange-500 p-0.5">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">100%</div>
                      <div className="text-xs font-medium text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {speechComposition.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                        <span className="text-xs font-medium text-gray-700">{item.label}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-900">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className={`${item.color} h-1 rounded-full transition-all duration-300`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600">
                  Your speech is primarily <span className="text-emerald-600 font-bold">
                    {speechComposition.reduce((prev, current) => 
                      (prev.percentage > current.percentage) ? prev : current
                    ).label.toLowerCase()}</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="col-span-6 bg-white border-0 shadow-sm rounded-lg">
            <div className="p-4 pb-3 border-b">
              <h3 className="text-lg font-bold text-gray-900">Speech Recording</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                {recordingBlob ? (
                  <video 
                    className="w-full h-full rounded-lg object-cover"
                    controls
                    src={URL.createObjectURL(recordingBlob)}
                  />
                ) : (
                  <div className="text-center text-white">
                    <PlayIcon />
                    <p className="text-sm font-medium opacity-75 mt-2">Click to play recording</p>
                  </div>
                )}
              </div>

              {/* Video Controls */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="border border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-medium px-3 py-1 rounded text-sm flex items-center gap-1"
                  >
                    {isPlaying ? <PauseIcon /> : <PlaySmallIcon />}
                  </button>
                  <button className="border border-gray-200 font-medium px-3 py-1 rounded text-sm">
                    <SkipBackIcon />
                  </button>
                  <button className="border border-gray-200 font-medium px-3 py-1 rounded text-sm">
                    <SkipForwardIcon />
                  </button>
                  <div className="flex items-center gap-2 ml-auto">
                    <VolumeIcon />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={handleSliderChange(setVolume)}
                      className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                </div>


              </div>
            </div>
          </div>

          {/* Session Summary */}
          <div className="col-span-3 bg-emerald-600 text-white border-0 shadow-sm rounded-lg">
            <div className="p-4 pb-3 border-b border-emerald-500">
              <h3 className="text-lg font-bold">Session Summary</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">3:00</div>
                <p className="text-emerald-100 text-xs font-medium">Total Duration</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100 text-xs font-medium">Words Spoken</span>
                  <span className="font-bold text-sm">{data.wordsSpoken}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100 text-xs font-medium">Speaking Rate</span>
                  <span className="font-bold text-sm">{data.speakingRate} WPM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100 text-xs font-medium">Filler Words</span>
                  <span className="font-bold text-sm">{data.fillerWordCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100 text-xs font-medium">Pauses</span>
                  <span className="font-bold text-sm">{data.pauses}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-500">
                <div className="text-center">
                  <div className="text-xl font-bold mb-1">{data.overallPercentage}%</div>
                  <p className="text-emerald-100 text-xs font-medium">Overall Grade</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Feedback - Full Width Bottom */}
        <div className="bg-white border-0 shadow-sm rounded-lg">
          <div className="p-4 pb-3 border-b">
            <div className="flex items-center gap-2">
              <LightbulbIcon />
              <h3 className="text-lg font-bold text-gray-900">Personalized Feedback</h3>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-8 space-y-2">
                <div className="flex gap-2 mb-3">
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-medium px-2 py-1 rounded">
                    Strengths
                  </span>
                  <span className="bg-blue-100 text-blue-800 border border-blue-200 text-xs font-medium px-2 py-1 rounded">
                    Improvements
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
                  <p className="font-medium">
                    <span className="text-emerald-600 font-bold">Strengths:</span> {data.strengths}
                  </p>
                  <p className="font-medium">
                    <span className="text-blue-600 font-bold">Areas for Improvement:</span> {data.weaknesses}
                  </p>
                </div>
              </div>

              <div className="col-span-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-gray-900 font-bold mb-2 text-sm">Action Items:</h4>
                  <ul className="text-xs text-gray-600 space-y-1 font-medium">
                    {data.nextSteps.map((step, index) => (
                      <li key={index}>• {step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard; 