const EXAMPLES = {
  real1: {
    title: "Kerry to go to Paris in gesture of sympathy",
    text: `U.S. Secretary of State John F. Kerry said Monday that he will stop in Paris
later this week, amid criticism that no top American officials attended Sunday's
unity march against terrorism. Kerry said he expects to arrive in Paris Thursday
evening, as he heads home after a week abroad. He said he will fly to France at
the conclusion of a series of meetings scheduled for Thursday in Sofia, Bulgaria.
He plans to meet the next day with Foreign Minister Laurent Fabius and President
Francois Hollande, then return to Washington. The French press on Monday was
filled with questions about why neither President Obama nor Kerry attended
Sunday's march, as about 40 leaders of other nations did.`
  },
  real2: {
    title: "The Battle of New York: Why This Primary Matters",
    text: `It's primary day in New York and front-runners Hillary Clinton and Donald Trump
are leading in the polls. Trump is now vowing to win enough delegates to clinch
the Republican nomination and prevent a contested convention. Meanwhile, Clinton
is hoping a big win in New York will slow the momentum of Bernie Sanders.
Hundreds of delegates are at stake in this crucial primary, making it one of the
most important contests of the 2016 election cycle.`
  },
  fake1: {
    title: "You Can Smell Hillary's Fear",
    text: `In the final stretch of the election, Hillary Rodham Clinton has gone to war
with the FBI. It's still unprecedented for the nominee of a major political party
to go war with the FBI. But that's exactly what Hillary and her people have done.
The FBI is under attack by everyone from Obama to CNN. Hillary's people have
circulated a letter attacking Comey. The campaign against Comey is pure
intimidation. It's also a warning. Any senior FBI people who value their careers
are being warned to stay away.`
  },
  fake2: {
    title: "Watch The Exact Moment Paul Ryan Committed Political Suicide At A Trump Rally",
    text: `There are two fundamental truths in this world: Paul Ryan desperately wants to
be president. And Paul Ryan will never be president. Today proved it. In a
particularly staggering example of political cowardice, Paul Ryan re-re-re-reversed
course and announced that he was back on the Trump Train after all. He had
previously declared he would not be supporting or defending Trump after a tape
was made public in which Trump bragged about assaulting women. The Democratic
Party couldn't have asked for a better moment of film.`
  }
};

function loadExample(key) {
  const ex = EXAMPLES[key];
  document.getElementById('titleInput').value = ex.title;
  document.getElementById('textInput').value  = ex.text;
  hideResult();
}

async function predict() {
  const title  = document.getElementById('titleInput').value.trim();
  const text   = document.getElementById('textInput').value.trim();
  const errBox = document.getElementById('errBox');

  hideResult();
  errBox.classList.add('hidden');

  if (!title && !text) {
    errBox.textContent = '⚠️ Please enter a title or article text before analyzing.';
    errBox.classList.remove('hidden');
    return;
  }

  const btn     = document.querySelector('.predict-btn');
  const btnText = document.getElementById('btnText');
  btn.disabled  = true;
  btnText.textContent = '⏳ Analyzing...';

  try {
    const res  = await fetch('/predict', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ title, text })
    });
    const data = await res.json();

    if (data.error) {
      errBox.textContent = '⚠️ ' + data.error;
      errBox.classList.remove('hidden');
      return;
    }
    showResult(data);

  } catch (err) {
    errBox.textContent = '⚠️ Server error. Make sure app.py is running.';
    errBox.classList.remove('hidden');
  } finally {
    btn.disabled        = false;
    btnText.textContent = '🔍 Analyze News';
  }
}

function showResult(data) {
  const { label, confidence, prob_fake, prob_real } = data;

  const badge     = document.getElementById('resultBadge');
  const msg       = document.getElementById('resultMsg');
  const resultDiv = document.getElementById('result');

  badge.textContent = label === 'REAL' ? '✅  REAL NEWS' : '❌  FAKE NEWS';
  badge.className   = 'badge ' + label;

  const emoji = label === 'REAL' ? '🟢' : '🔴';
  msg.textContent = `${emoji}  Confidence: ${confidence}%  —  The model classifies this article as ${label}.`;

  setTimeout(() => {
    document.getElementById('barReal').style.width = prob_real + '%';
    document.getElementById('barFake').style.width = prob_fake + '%';
    document.getElementById('pctReal').textContent = prob_real + '%';
    document.getElementById('pctFake').textContent = prob_fake + '%';
  }, 80);

  resultDiv.classList.remove('hidden');
}

function hideResult() {
  document.getElementById('result').classList.add('hidden');
  document.getElementById('barReal').style.width = '0%';
  document.getElementById('barFake').style.width = '0%';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('titleInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') predict();
  });
});
