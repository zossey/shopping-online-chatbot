// ===========================
// SHOPMATE AI — Langflow Engine
// ===========================
// Backend : Langflow (localhost:7860)
// Flow ID : cf0fb255-a65b-466a-8818-c5e1cac38ccf
// API Key : sk-rmorpEZ442K5lhiU8lCSSuzs7-Yo08Yr4_pYks9YUQo
// ===========================

const LANGFLOW_CONFIG = {
  baseUrl: 'http://localhost:7860',
  flowId: 'cf0fb255-a65b-466a-8818-c5e1cac38ccf',
  apiKey: 'sk-rmorpEZ442K5lhiU8lCSSuzs7-Yo08Yr4_pYks9YUQo',
};

// Satu session_id per kunjungan — menjaga konteks percakapan
const SESSION_ID = crypto.randomUUID();

// ===========================
// Langflow API Call
// ===========================

async function askLangflow(userMessage) {
  const url = `${LANGFLOW_CONFIG.baseUrl}/api/v1/run/${LANGFLOW_CONFIG.flowId}`;

  const payload = {
    output_type: 'chat',
    input_type: 'chat',
    input_value: userMessage,
    session_id: SESSION_ID,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': LANGFLOW_CONFIG.apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  // Ekstrak teks dari struktur respons Langflow
  return extractText(data);
}

function extractText(data) {
  try {
    // Struktur: data.outputs[0].outputs[0].results.message.text
    const text =
      data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
      data?.outputs?.[0]?.outputs?.[0]?.artifacts?.message ||
      data?.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message ||
      data?.result?.text ||
      data?.result ||
      null;

    if (text) return String(text).trim();
  } catch (_) {}

  return 'Maaf, saya tidak dapat memproses respons saat ini. Silakan coba lagi atau hubungi CS kami di WhatsApp. 🙏';
}

// ===========================
// Chat State
// ===========================

let chatOpen = false;
let chatStarted = false;
let isBotTyping = false;

// ===========================
// Toggle Chatbot Window
// ===========================

function toggleChatbot() {
  const win = document.getElementById('chatbotWindow');
  const notif = document.getElementById('chatbotNotif');
  const icon = document.getElementById('chatbotIcon');

  chatOpen = !chatOpen;
  win.classList.toggle('open', chatOpen);
  notif.classList.remove('visible');

  if (chatOpen) {
    icon.className = 'fa-solid fa-xmark';
    if (!chatStarted) {
      chatStarted = true;
      startConversation();
    }
    setTimeout(() => document.getElementById('chatbotInput').focus(), 350);
  } else {
    icon.className = 'fa-solid fa-robot';
  }
}

// ===========================
// Opening Greeting
// ===========================

function startConversation() {
  showTyping();
  // Kirim pesan pembuka ke Langflow agar AI menyapa duluan
  askLangflow('Halo! Saya baru membuka halaman SHOPMATE.')
    .then(reply => {
      removeTyping();
      addBotMessage(reply);
      showQuickReplies([
        'Cara beli produk',
        'Info pembayaran',
        'Info pengiriman',
        'Ada produk apa saja?',
        'Hubungi CS',
      ]);
    })
    .catch(() => {
      removeTyping();
      addBotMessage(
        'Halo! 👋 Selamat datang di **SHOPMATE**!\n\nSaya SHOPMATE AI Customer Service, siap membantu kamu. Ada yang bisa saya bantu hari ini? 😊'
      );
      showQuickReplies([
        'Cara beli produk',
        'Info pembayaran',
        'Info pengiriman',
        'Ada produk apa saja?',
        'Hubungi CS',
      ]);
    });
}

// ===========================
// Send Message
// ===========================

async function sendMessage() {
  if (isBotTyping) return;

  const input = document.getElementById('chatbotInput');
  const text = input.value.trim();
  if (!text) return;

  addUserMessage(text);
  input.value = '';
  clearQuickReplies();

  isBotTyping = true;
  showTyping();

  try {
    const reply = await askLangflow(text);
    removeTyping();
    addBotMessage(reply);
  } catch (err) {
    removeTyping();
    console.error('[Langflow Error]', err);
    addBotMessage(
      '⚠️ Koneksi ke AI gagal. Pastikan Langflow sudah berjalan di **localhost:7860**.\n\nAtau hubungi CS kami langsung:\n📱 **0812-6451-3583**'
    );
  } finally {
    isBotTyping = false;
    // Tampilkan quick replies umum setelah setiap jawaban
    showQuickReplies([
      'Cara beli produk',
      'Info pembayaran',
      'Info pengiriman',
      'Hubungi CS',
    ]);
  }
}

function sendQuickReply(text) {
  document.getElementById('chatbotInput').value = text;
  sendMessage();
}

// ===========================
// DOM Helpers
// ===========================

function addBotMessage(text) {
  const container = document.getElementById('chatbotMessages');
  const msgEl = document.createElement('div');
  msgEl.className = 'msg bot';
  msgEl.innerHTML = `
    <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
    <div>
      <div class="msg-bubble">${formatText(text)}</div>
      <div class="msg-time">${getTime()}</div>
    </div>
  `;
  container.appendChild(msgEl);
  scrollToBottom();
}

function addUserMessage(text) {
  const container = document.getElementById('chatbotMessages');
  const msgEl = document.createElement('div');
  msgEl.className = 'msg user';
  msgEl.innerHTML = `
    <div>
      <div class="msg-bubble">${escapeHtml(text)}</div>
      <div class="msg-time">${getTime()}</div>
    </div>
  `;
  container.appendChild(msgEl);
  scrollToBottom();
}

function showTyping() {
  const container = document.getElementById('chatbotMessages');
  if (document.getElementById('typingIndicator')) return;
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.id = 'typingIndicator';
  div.innerHTML = `
    <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
    <div class="typing-indicator">
      <span></span><span></span><span></span>
    </div>
  `;
  container.appendChild(div);
  scrollToBottom();

  // Update status bar & disable input
  const status = document.getElementById('botStatus');
  const input  = document.getElementById('chatbotInput');
  if (status) { status.textContent = '● Mengetik…'; status.style.color = '#fcd34d'; }
  if (input)  { input.disabled = true; input.placeholder = 'AI sedang membalas…'; }
}

function removeTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();

  // Restore status bar & enable input
  const status = document.getElementById('botStatus');
  const input  = document.getElementById('chatbotInput');
  if (status) { status.textContent = '● Online'; status.style.color = '#86efac'; }
  if (input)  { input.disabled = false; input.placeholder = 'Ketik pesan kamu…'; input.focus(); }
}

function showQuickReplies(replies) {
  const container = document.getElementById('quickReplies');
  container.innerHTML = replies
    .map(r => `<button class="quick-reply-btn" onclick="sendQuickReply('${r}')">${r}</button>`)
    .join('');
}

function clearQuickReplies() {
  document.getElementById('quickReplies').innerHTML = '';
}

function scrollToBottom() {
  const container = document.getElementById('chatbotMessages');
  setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
}

function getTime() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Tampilkan notif dot setelah 3 detik jika chatbot belum dibuka
setTimeout(() => {
  if (!chatStarted) {
    document.getElementById('chatbotNotif').classList.add('visible');
  }
}, 3000);
