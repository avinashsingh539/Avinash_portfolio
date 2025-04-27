import tkinter as tk
from tkinter import Canvas, Label, messagebox
import speech_recognition as sr
import pyttsx3
import requests
import threading
import time
import webbrowser
import json
import sys
import random
import wikipediaapi
import platform
import psutil

# Verify Python version
if sys.version_info < (3, 13):
    print(f"Warning: Running on Python {sys.version}. Recommended version is 3.13.1 or higher.")
elif sys.version_info >= (3, 14):
    print(f"Warning: Python {sys.version} is newer than tested version 3.13.1. Compatibility not guaranteed.")

# ======================
# GLOBAL CONFIGURATION
# ======================
root = None
command_label = None
response_label = None
canvas = None
is_running = True

# Initialize TTS Engine
try:
    engine = pyttsx3.init()
    voices = engine.getProperty('voices')
    if not voices:
        raise ValueError("No voices found. Ensure pyttsx3 is compatible with Python 3.13.1.")
    engine.setProperty('voice', voices[1].id)  # Change index for different voices
    engine.setProperty('rate', 150)
except Exception as e:
    print(f"TTS Error: {e}")
    messagebox.showerror("Error", "Text-to-speech failed to initialize. Check pyttsx3 compatibility with Python 3.13.1.")
    sys.exit(1)

# Load Configuration
try:
    with open('config.json') as config_file:
        config = json.load(config_file)
    APP_URLS = config.get('APP_URLS', {})
    API_KEYS = config.get('API_KEYS', {})
except FileNotFoundError:
    print("config.json not found, using defaults")
    APP_URLS = {
        "youtube": "https://www.youtube.com",
        "whatsapp": "https://web.whatsapp.com",
        "spotify": "https://open.spotify.com",
        "google": "https://www.google.com"
    }
    API_KEYS = {
        "weather": "e3193c248772950985f8fb1c6c95ba85",
        "news": "eabc9483b9f24db1b5991f7c9d7b8650",
        "gemini": "AIzaSyBV7f9erFzs0rriOFVksUh50D61BMa03GY"  # Replace with actual key
    }
except json.JSONDecodeError as e:
    print(f"Invalid JSON in config.json: {e}, using defaults")
    API_KEYS = {
        "weather": "e3193c248772950985f8fb1c6c95ba85",
        "news": "eabc9483b9f24db1b5991f7c9d7b8650",
        "gemini": "AIzaSyBV7f9erFzs0rriOFVksUh50D61BMa03GY"  # Replace with actual key
    }
except Exception as e:
    print(f"Unexpected error loading config: {e}, using defaults")
    API_KEYS = {
        "weather": "e3193c248772950985f8fb1c6c95ba85",
        "news": "eabc9483b9f24db1b5991f7c9d7b8650",
        "gemini": "AIzaSyBV7f9erFzs0rriOFVksUh50D61BMa03GY"  # Replace with actual key
    }

# Initialize Wikipedia
wiki = wikipediaapi.Wikipedia(
    language='en',
    user_agent='JARVIS_AI/1.0 (2005singhavinash@gmail.com)'
)

# ======================
# CORE FUNCTIONALITY
# ======================
def speak(text):
    global is_running
    try:
        print(f"JARVIS: {text}")
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        print(f"Speak Error: {e}")
        if root:
            response_label.config(text=f"Response: {text} (Speech failed)")

def stop_speech():
    global is_running
    engine.stop()
    is_running = True  # Reset to allow new commands
    if root:
        response_label.config(text="Response: Speech stopped")

def listen():
    recognizer = sr.Recognizer()
    recognizer.energy_threshold = 4000
    recognizer.pause_threshold = 0.8
    
    try:
        with sr.Microphone() as source:
            print("Listening...")
            if root:
                command_label.config(text="Command: Listening...")
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=8)
            
            try:
                command = recognizer.recognize_google(audio).lower()
                print(f"User: {command}")
                if "stop" in command:
                    stop_speech()
                    return None
                return command
            except sr.UnknownValueError:
                return "I didn't catch that. Could you repeat?"
            except sr.RequestError:
                return "Speech service unavailable."
    except Exception as e:
        print(f"Listen Error: {e}")
        return "Microphone error."

def query_gemini(prompt):
    try:
        api_key = API_KEYS.get("gemini")
        if not api_key:
            return "Gemini API key not configured"

        headers = {
            "Content-Type": "application/json"
        }
        params = {
            "key": api_key
        }
        data = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "maxOutputTokens": 500,
                "temperature": 0.7
            }
        }

        response = requests.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
            headers=headers,
            params=params,
            json=data,
            timeout=10
        )

        response.raise_for_status()
        result = response.json()
        return result["candidates"][0]["content"]["parts"][0]["text"]

    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 429:
            return "Rate limit reached. Wait for reset (1,500 requests/hour)."
        if e.response.status_code == 400:
            return "Invalid request. Check prompt or endpoint."
        if e.response.status_code == 403:
            return "API key invalid or region restricted."
        return f"API Error: {e.response.text[:100]}..."
    except requests.exceptions.ConnectionError:
        return "Connection error. Check your internet."
    except Exception as e:
        print(f"Gemini Error: {e}")
        return None

# ======================
# HELPER FUNCTIONS
# ======================
def get_weather(city):
    try:
        api_key = API_KEYS.get("weather")
        if not api_key:
            return "Weather API key not configured"
        
        params = {
            "q": city,
            "appid": api_key,
            "units": "metric"
        }
        
        response = requests.get("http://api.openweathermap.org/data/2.5/weather", params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        temp = data["main"]["temp"]
        desc = data["weather"][0]["description"]
        return f"Weather in {city}: {temp}°C, {desc}"
    except requests.exceptions.HTTPError as e:
        return f"Weather API Error: {e.response.text[:100]}..."
    except Exception as e:
        print(f"Weather Error: {e}")
        return "Unable to fetch weather data."

def get_news():
    try:
        api_key = API_KEYS.get("news")
        if not api_key:
            return "News API key not configured"
        
        params = {
            "country": "us",
            "apiKey": api_key
        }
        
        response = requests.get("https://newsapi.org/v2/top-headlines", params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        articles = data["articles"][:3]
        return "\n".join([f"- {article['title']}" for article in articles])
    except requests.exceptions.HTTPError as e:
        return f"News API Error: {e.response.text[:100]}..."
    except Exception as e:
        print(f"News Error: {e}")
        return "Unable to fetch news."

def get_system_info():
    try:
        os_name = platform.system()
        os_version = platform.version()
        arch = platform.machine()
        cpu_usage = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        mem_total = memory.total / (1024 ** 3)  # Convert to GB
        mem_used = memory.used / (1024 ** 3)    # Convert to GB
        disk = psutil.disk_usage('/')
        disk_total = disk.total / (1024 ** 3)   # Convert to GB
        disk_used = disk.used / (1024 ** 3)     # Convert to GB
        
        return (f"System Info:\n"
                f"OS: {os_name} {os_version}\n"
                f"Architecture: {arch}\n"
                f"CPU Usage: {cpu_usage}%\n"
                f"Memory: {mem_used:.2f}GB / {mem_total:.2f}GB\n"
                f"Disk: {disk_used:.2f}GB / {disk_total:.2f}GB")
    except Exception as e:
        print(f"System Info Error: {e}")
        return "Unable to fetch system info."

def get_laptop_health():
    try:
        cpu_usage = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        mem_used_percent = memory.percent
        disk = psutil.disk_usage('/')
        disk_used_percent = disk.percent
        
        return (f"Laptop Health:\n"
                f"CPU Usage: {cpu_usage}%\n"
                f"Memory Usage: {mem_used_percent}%\n"
                f"Disk Usage: {disk_used_percent}%")
    except Exception as e:
        print(f"Laptop Health Error: {e}")
        return "Unable to fetch laptop health."

def ask_wikipedia(query):
    try:
        page = wiki.page(query)
        if page.exists():
            summary = page.summary[:200]
            return f"{summary}..."
        return "I couldn't find a Wikipedia page for that."
    except Exception as e:
        print(f"Wikipedia Error: {e}")
        return None

# ======================
# COMMAND PROCESSING
# ======================
def process_command(command):
    global is_running
    if not command or "i didn't catch" in command.lower():
        return "Please repeat your command."
    
    command = command.lower().strip()
    
    # Predefined commands
    if any(word in command for word in ["hello", "hi", "hey"]):
        return random.choice([
            "Hello! How can I assist you?",
            "Hi there! What can I do for you?",
            "Greetings! Ready to help."
        ])
    elif "exit" in command or "quit" in command:
        return "exit"
    elif "time" in command:
        return f"The time is {time.strftime('%I:%M %p')}"
    elif "date" in command:
        return f"Today is {time.strftime('%A, %B %d, %Y')}"
    elif "weather" in command:
        city = command.split("in")[-1].strip() if "in" in command else "your location"
        return get_weather(city)
    elif "news" in command:
        return get_news()
    elif "joke" in command:
        return random.choice([
            "Why don't scientists trust atoms? Because they make up everything!",
            "I told my computer I needed a break... now it won't stop sending me vacation ads!"
        ])
    elif any(app in command for app in APP_URLS.keys()):
        app = next(app for app in APP_URLS.keys() if app in command)
        webbrowser.open(APP_URLS[app])
        return f"Opening {app.capitalize()}"
    elif "system info" in command:
        return get_system_info()
    elif "laptop health" in command:
        return get_laptop_health()
    elif "play" in command and "on youtube" in command:
        song = command.replace("play", "").replace("on youtube", "").strip()
        if song:
            youtube_url = f"https://www.youtube.com/results?search_query={'+'.join(song.split())}"
            webbrowser.open(youtube_url)
            return f"Playing {song} on YouTube. Please select a video to start."
        return "Please specify a song to play."
    elif "close" in command and any(app in command for app in APP_URLS.keys()):
        app = next(app for app in APP_URLS.keys() if app in command)
        webbrowser.open("about:blank")  # Workaround to close by opening a blank page
        return f"Closing {app.capitalize()} (Note: Manually close the browser if needed)."
    
    # Try Wikipedia first
    wiki_response = ask_wikipedia(command)
    if wiki_response and not wiki_response.startswith("I couldn't find"):
        return wiki_response
        
    # Fallback to Gemini API
    gemini_response = query_gemini(command)
    if gemini_response:
        return gemini_response
    
    return "I'm not sure how to help with that."

# ======================
# UI COMPONENTS
# ======================
def create_ui():
    global root, command_label, response_label, canvas
    
    root = tk.Tk()
    root.title("J.A.R.V.I.S. AI Assistant")
    root.geometry("600x600")
    root.configure(bg='#0a0a23')
    root.protocol("WM_DELETE_WINDOW", on_close)
    
    canvas = Canvas(root, bg='#0a0a23', highlightthickness=0)
    canvas.pack(fill="both", expand=True)
    
    # Create circular interface
    center_x, center_y = 300, 300
    radius = 150
    canvas.create_oval(
        center_x - radius, center_y - radius,
        center_x + radius, center_y + radius,
        outline='#00ffff', width=3, dash=(5, 2)
    )
    
    command_label = Label(root, text="Command: Ready", 
                         fg='white', bg='#0a0a23',
                         font=('Arial', 12, 'bold'))
    command_label.pack(pady=20)
    
    response_label = Label(root, text="Response: Awaiting command", 
                          fg='#00ffff', bg='#0a0a23',
                          font=('Arial', 10), wraplength=500)
    response_label.pack(pady=10)
    
    animate_interface()
    return root

def animate_interface(angle=0):
    global canvas, is_running
    if not is_running:
        return
    
    canvas.delete("arc")  # Only delete arcs, keep the main circle
    
    center_x, center_y = 300, 300
    radius = 150
    colors = ['#00ffff', '#00ffcc', '#0099ff']
    
    for i in range(0, 360, 30):
        canvas.create_arc(
            center_x - radius, center_y - radius,
            center_x + radius, center_y + radius,
            start=(angle + i) % 360, extent=15,
            outline=colors[i % 3],
            style='arc', width=2,
            tags="arc"
        )
    
    angle = (angle + 5) % 360  # Slower rotation
    if is_running:
        root.after(100, lambda: animate_interface(angle))  # Smoother animation

# ======================
# MAIN EXECUTION
# ======================
def main():
    global is_running
    
    try:
        root_window = create_ui()
        speak("Jarvis at your service, sir! How may I assist you?")
        
        def process_commands():
            global is_running
            is_running = True
            while is_running:
                command = listen()
                if command is not None:  # Skip if stopped
                    response = process_command(command)
                    
                    if response == "exit":
                        on_close()
                        break
                        
                    if root_window:
                        command_label.config(text=f"Command: {command[:50]}...")
                        response_label.config(text=f"Response: {response[:200]}...")
                        root_window.update()
                        
                    speak(response)
        
        # Run command processing in a separate thread
        threading.Thread(target=process_commands, daemon=True).start()
        root.mainloop()
            
    except KeyboardInterrupt:
        on_close()
    except Exception as e:
        messagebox.showerror("Error", f"Fatal error: {str(e)}")
        sys.exit(1)

def on_close():
    global is_running
    is_running = False
    if root:
        root.destroy()
    speak("Shutting down. Goodbye! Sir")
    sys.exit(0)

if __name__ == "__main__":
    main()