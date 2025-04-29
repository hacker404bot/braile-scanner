const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const textOutput = document.getElementById('textOutput');
const brailleOutput = document.getElementById('brailleOutput');

// Braille Map
const brailleMap = {
  a: "⠁", b: "⠃", c: "⠉", d: "⠙", e: "⠑",
  f: "⠋", g: "⠛", h: "⠓", i: "⠊", j: "⠚",
  k: "⠅", l: "⠇", m: "⠍", n: "⠝", o: "⠕",
  p: "⠏", q: "⠟", r: "⠗", s: "⠎", t: "⠞",
  u: "⠥", v: "⠧", w: "⠺", x: "⠭", y: "⠽", z: "⠵",
  " ": " ", ".": ".", ",": ",", "?": "?", "!": "!", "\n": "\n"
};

// Text to Braille function
function textToBraille(text) {
  return text.toLowerCase().split('').map(c => brailleMap[c] || '?').join('');
}

// Speak text
function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.cancel(); // Stop any ongoing speech
  speechSynthesis.speak(utterance);
}

// Start the camera
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = stream;
    await video.play();
  } catch (err) {
    console.error("Error accessing camera:", err);
    alert("Could not access the camera. Please check permissions or device support.");
  }
}

startCamera();

// OCR scanning every 5 seconds
setInterval(() => {
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imgData = canvas.toDataURL();

  Tesseract.recognize(
    imgData, 'eng',
    { logger: m => console.log(m) }
  ).then(({ data: { text } }) => {
    const cleanText = text.trim().replace(/\s+/g, ' ');
    if (cleanText.length > 1) {
      textOutput.textContent = cleanText;
      const braille = textToBraille(cleanText);
      brailleOutput.textContent = braille;
      speakText(cleanText);
    }
  });
}, 5000);
