const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const textOutput = document.getElementById('textOutput');
const brailleOutput = document.getElementById('brailleOutput');
const captureBtn = document.getElementById('captureBtn');
const speakBtn = document.getElementById('speakBtn');

// Braille Mapping
const brailleMap = {
  a: "⠁", b: "⠃", c: "⠉", d: "⠙", e: "⠑",
  f: "⠋", g: "⠛", h: "⠓", i: "⠊", j: "⠚",
  k: "⠅", l: "⠇", m: "⠍", n: "⠝", o: "⠕",
  p: "⠏", q: "⠟", r: "⠗", s: "⠎", t: "⠞",
  u: "⠥", v: "⠧", w: "⠺", x: "⠭", y: "⠽", z: "⠵",
  " ": " ", ".": ".", ",": ",", "?": "?", "!": "!", "\n": "\n", "'": "⠄"
};

function textToBraille(text) {
  return text.toLowerCase().split('').map(c => brailleMap[c] || '?').join('');
}

function speakText(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  speechSynthesis.cancel(); // stop previous
  speechSynthesis.speak(utter);
}

// Start camera
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
  } catch (err) {
    alert("Camera access failed. Please allow camera permissions.");
    console.error(err);
  }
}

startCamera();

// On capture button press
captureBtn.onclick = () => {
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = canvas.toDataURL('image/png');

  textOutput.textContent = "Extracting text... ⏳";
  brailleOutput.textContent = "";

  Tesseract.recognize(imageData, 'eng')
    .then(({ data: { text } }) => {
      const clean = text.trim().replace(/\s+/g, ' ');
      textOutput.textContent = clean.length ? clean : "No text detected.";
      brailleOutput.textContent = clean.length ? textToBraille(clean) : "-";
    })
    .catch(err => {
      console.error("OCR error:", err);
      textOutput.textContent = "Error during OCR.";
      brailleOutput.textContent = "-";
    });
};

// On speak button press
speakBtn.onclick = () => {
  const text = textOutput.textContent;
  if (text.length > 0 && text !== "Extracting text... ⏳") speakText(text);
};

// Copy functionality
function copyText(elementId) {
  const text = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(text)
    .then(() => {
      const messageId = elementId === 'textOutput' ? 'copyTextMessage' : 'copyBrailleMessage';
      const messageElement = document.getElementById(messageId);
      messageElement.textContent = 'Copied!';
      setTimeout(() => {
        messageElement.textContent = '';
      }, 2000);
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
}
