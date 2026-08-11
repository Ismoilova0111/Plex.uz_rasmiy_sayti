import os
import sys
import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Ensure UTF-8 output encoding on Windows terminal
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Load environment variables from .env file
load_dotenv(override=True)

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# System Prompt for Plex_uz Hair Care Expert AI
SYSTEM_PROMPT = """Siz Plex_uz brendining rasmiy professional AI Konsultanti va soch parvarishi bo'yicha ekspertsiz.
Sizning vazifangiz mijozlarga muloyim, qisqa va tushunarli o'zbek tilida sochlarga to'g'ri parvarish tanlashda yordam berishdir.

Plex_uz Mahsulotlar Katalogi:
1. SilkPlex™ (320,000 so'm): Ipak oqsillari va 4 xil proteinli to'plam. Barcha turdagi va hurpayadigan sochlarga silliqlik, yaltiroqlik hamda 230°C issiqlikdan termohimoya beradi.
2. ArganPlex™ (330,000 so'm): Morokko Argan moyi va Moringa moyli intensiv ozuqa. Quruq va suvsizlangan sochlar uchun.
3. KeraPlex™ (340,000 so'm): Tabiiy keratin va ipakli tiklovchi formula. Bo'yalgan, kraskalangan va kuydirilgan sochlar uchun.
4. ManPlex™ 3-in-1 (160,000 so'm): Erkaklar uchun shampun, konditsioner va dush geli (Aloe Vera & Krapiva ekstrakti). Soch, soqol va badan uchun.
5. ManPlex™ Hair & Beard Serum: Soch va soqolni oziqlantiruvchi va yumshatuvchi maxsus serum.

Qoidalar:
- Doim o'zbek tilida xushmuomala javob bering.
- Mijoz soch muammosini aytsa (masalan: "bo'yalgan soch", "quruq soch", "erkaklar uchun"), unga eng mos Plex_uz mahsulotini tavsiya qiling.
- Narxlar va xususiyatlarni aniq va qisqa tushuntiring.
- Formatlash uchun chiroyli emojilardan foydalaning.
"""

def call_gemini_api(user_message):
    api_key = os.getenv('GEMINI_API_KEY', '').strip()
    if not api_key or api_key in ['YOUR_GEMINI_API_KEY_HERE', 'your_gemini_api_key_here']:
        return {
            'error': True,
            'message': "🔑 .env faylida GEMINI_API_KEY hali kiritilmagan. Iltimos, .env fayliga haqiqiy Gemini API kalitingizni yozing va serverni qayta ishga tushiring."
        }

    models = ["gemini-2.0-flash", "gemini-2.5-flash-lite", "gemini-flash-latest", "gemini-1.5-flash"]
    headers = {'Content-Type': 'application/json'}
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": f"{SYSTEM_PROMPT}\n\nMijoz savoli: {user_message}"}]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 800
        }
    }

    last_error = ""

    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            if response.status_code == 200:
                data = response.json()
                try:
                    reply_text = data['candidates'][0]['content']['parts'][0]['text']
                    return {'error': False, 'message': reply_text}
                except (KeyError, IndexError):
                    continue
            elif response.status_code == 429:
                last_error = "⚠️ Google Gemini API limit (Rate Limit / Quota 429). Iltimos, bir ozdan so'ng qayta urinib ko'ring yoki Google AI Console'da billing limitini tekshiring."
            else:
                last_error = f"API Error ({response.status_code}): {response.text[:150]}"
        except Exception as e:
            last_error = str(e)
            continue

    return {
        'error': True,
        'message': last_error if last_error else "Kechirasiz, Gemini API ulanishida xatolik yuz berdi."
    }

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(path):
        return send_from_directory('.', path)
    return send_from_directory('.', 'index.html')

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    data = request.get_json() or {}
    user_msg = data.get('message', '').strip()
    
    if not user_msg:
        return jsonify({'error': True, 'message': 'Savol kiritilmadi.'}), 400

    result = call_gemini_api(user_msg)
    return jsonify(result)

@app.route('/api/health', methods=['GET'])
def health():
    key_val = os.getenv('GEMINI_API_KEY', '').strip()
    key_configured = bool(key_val and key_val not in ['YOUR_GEMINI_API_KEY_HERE', 'your_gemini_api_key_here'])
    return jsonify({
        'status': 'online',
        'api_key_configured': key_configured
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"Plex_uz Gemini AI Server http://localhost:{port} manzilida ishga tushmoqda...")
    app.run(host='0.0.0.0', port=port, debug=True)
