'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Globe, Clock, Instagram, Twitter, Facebook,Youtube, Linkedin, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const applicationName = 'PostEnhancer'

const SocialTimingPlatform = () => {
  const [loading, setLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [bestTime, setBestTime] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [adKey, setAdKey] = useState(0)
  const [error, setError] = useState(null)
  const platforms = [
    { id: 'Instagram', name: 'Instagram', icon: Instagram },
    { id: 'Twitter', name: 'Twitter', icon: Twitter },
    { id: 'Facebook', name: 'Facebook', icon: Facebook },
    { id: 'LinkedIn', name: 'LinkedIn', icon: Linkedin },
    { id: 'YouTube', name: 'YouTube', icon: Youtube }, // Assuming the icon is 'youtube'
  ]
  

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
    document.documentElement.classList.toggle('dark')
  }

  const fetchBestTime = async () => {
    setLoading(true)
    setError(null)
    setAdKey(prev => prev + 1)
    try {
      console.log("selected date:::::", selectedDate)
      const response = await fetch(
        `/api/best-time?platform=${selectedPlatform}&date=${selectedDate}`
      )
      const data = await response.json()
      console.log("data::::::", data)
      if(data && data.message === "No record found for the specified platform.")
        setError("No records found for selected options")
      else
        setBestTime(data.best_time)
      setShowResult(true)
    } catch (error) {
      console.error('Error fetching best time:', error)
    } finally {
      setLoading(false)
    }
  }
  const themeClasses = isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      <button
        onClick={toggleTheme}
        className={`fixed right-4 top-4 z-50 p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
          }`}
      >
        {isDarkMode ? <Sun className="h-6 w-6 text-yellow-300" /> : <Moon className="h-6 w-6 text-gray-600" />}
      </button>

      <header className={`py-6 px-4 border-b backdrop-blur-1px fixed w-full top-0 z-10 ${isDarkMode ? 'bg-black/90 border-gray-800' : 'bg-white/90 border-gray-200'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-6 w-6" />
            <span className="text-xl font-bold">{applicationName}</span>
          </div>
        </div>
      </header>

      <main className="pt-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Post at the Perfect Time</h1>
          <p className={`text-xl mb-12 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Maximize your social media engagement by posting when your audience is most active.
          </p>

          <Card className={`max-w-2xl mx-auto mb-20 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-xl hover:shadow-2xl transition-all duration-300`}>
            <CardContent className="p-8">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="w-full">
                    <Select onValueChange={setSelectedPlatform}>
                      <SelectTrigger
                        className={`w-full h-12 px-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-black'} hover:border-gray-400 focus:ring-2 focus:ring-gray-500 transition-all duration-200`}
                      >
                        <SelectValue placeholder="Select Platform" />
                      </SelectTrigger>
                      <SelectContent className={`w-full rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'}`}>
                        {platforms.map((platform) => (
                          <SelectItem
                            key={platform.id}
                            value={platform.id}
                            className={`w-full px-4 py-2 rounded-lg cursor-pointer ${isDarkMode ? 'hover:bg-gray-700 focus:bg-gray-700' : 'hover:bg-gray-100 focus:bg-gray-100'} transition-all duration-200`}
                          >
                            <div className="flex items-center space-x-2">
                              <platform.icon className="h-4 w-4" />
                              <span>{platform.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                  </div>

                  <div className="w-full">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className={`w-full h-12 px-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-black'} hover:border-gray-400 focus:ring-2 focus:ring-gray-500 transition-all duration-200`}
                    />
                  </div>
                </div>

                <Button
                  className={`w-full h-12 text-lg font-semibold transform transition-all duration-300 ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
                    } shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                  disabled={!selectedPlatform || !selectedDate || loading}
                  onClick={fetchBestTime}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-3 border-current border-t-transparent"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Get Best Time'
                  )}
                </Button>

                {!error && showResult && (
                  <div className={`rounded-xl p-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'} transform transition-all duration-500 hover:scale-105`}>
                    <div className="flex items-center justify-center space-x-4">
                      <Clock className="h-8 w-8" />
                      <div className="text-center">
                        <h3 className={`text-sm uppercase font-semibold tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Best Time to Post
                        </h3>
                        <p className="text-2xl font-bold mt-2">{bestTime}</p>
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className={`rounded-xl p-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'} transform transition-all duration-500 hover:scale-105`}>
                    <div className="flex items-center justify-center space-x-4">
                      <Clock className="h-8 w-8" />
                      <div className="text-center">
                        <p className="text-1xl font-bold mt-2">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </CardContent>
          </Card>
        </div>

        <section id="features" className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{`Why Choose ${applicationName}?`}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Globe, title: 'Global Reach', description: 'Analyze the best time based on different countries.' },
                { icon: Instagram, title: 'Social Media Optimization', description: 'Get detailed insights for Instagram and more platforms.' },
                { icon: Clock, title: 'Time-Specific Results', description: 'Post at the ideal time for maximum engagement.' }
              ].map((feature, idx) => (
                <div key={idx} className="text-center">
                  <feature.icon className="h-16 w-16 text-gray-500 mb-4 mx-auto" />
                  <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-lg text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default SocialTimingPlatform
