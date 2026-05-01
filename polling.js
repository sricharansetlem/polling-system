let pollData = null;
let hasVoted = false;

const colors = ['#4361ee', '#e63946', '#2a9d8f', '#f4a261', '#8338ec'];

// Load saved poll on page load
window.onload = function () {
  const saved = localStorage.getItem('pollData');
  if (saved) {
    pollData = JSON.parse(saved);
    hasVoted = localStorage.getItem('hasVoted') === 'true';
    showVoteSection();
    if (hasVoted) showResults();
  }
};

// Add a new option input row
function addOption() {
  const list = document.getElementById('options-list');
  const count = list.children.length + 1;
  const row = document.createElement('div');
  row.className = 'option-row';
  row.innerHTML = `
    <input type="text" placeholder="Option ${count}" class="opt-input" />
    <button class="btn-remove" onclick="removeOption(this)">✕</button>
  `;
  list.appendChild(row);
}

// Remove an option row
function removeOption(btn) {
  const list = document.getElementById('options-list');
  if (list.children.length > 2) {
    btn.parentElement.remove();
  } else {
    alert('Minimum 2 options required.');
  }
}

// Create the poll from inputs
function createPoll() {
  const question = document.getElementById('poll-question').value.trim();
  const inputs = document.querySelectorAll('.opt-input');
  const options = [];

  inputs.forEach(function (input) {
    if (input.value.trim()) {
      options.push(input.value.trim());
    }
  });

  if (!question) {
    alert('Please enter a poll question.');
    return;
  }
  if (options.length < 2) {
    alert('Please add at least 2 options.');
    return;
  }

  pollData = {
    question: question,
    options: options.map(function (text) {
      return { text: text, votes: 0 };
    })
  };

  localStorage.setItem('pollData', JSON.stringify(pollData));
  localStorage.removeItem('hasVoted');
  hasVoted = false;

  showVoteSection();
}

// Show the voting section
function showVoteSection() {
  document.getElementById('create-section').style.display = 'none';
  document.getElementById('vote-section').style.display = 'block';
  document.getElementById('display-question').textContent = pollData.question;

  const container = document.getElementById('vote-options');
  container.innerHTML = '';

  pollData.options.forEach(function (opt, i) {
    const label = document.createElement('label');
    label.className = 'vote-option';
    label.innerHTML = `<input type="radio" name="vote" value="${i}" /> ${opt.text}`;
    label.onclick = function () {
      document.querySelectorAll('.vote-option').forEach(function (l) {
        l.classList.remove('selected');
      });
      label.classList.add('selected');
    };
    container.appendChild(label);
  });

  // If already voted, disable inputs and show message
  if (hasVoted) {
    document.querySelectorAll('input[name="vote"]').forEach(function (r) {
      r.disabled = true;
    });
    document.getElementById('voted-msg').style.display = 'block';
    showResults();
  }
}

// Submit the selected vote
function submitVote() {
  if (hasVoted) {
    alert('You have already voted!');
    return;
  }

  const selected = document.querySelector('input[name="vote"]:checked');
  if (!selected) {
    alert('Please select an option.');
    return;
  }

  const idx = parseInt(selected.value);
  pollData.options[idx].votes++;

  localStorage.setItem('pollData', JSON.stringify(pollData));
  localStorage.setItem('hasVoted', 'true');
  hasVoted = true;

  document.querySelectorAll('input[name="vote"]').forEach(function (r) {
    r.disabled = true;
  });
  document.getElementById('voted-msg').style.display = 'block';

  showResults();
}

// Display live results with bars
function showResults() {
  document.getElementById('results-section').style.display = 'block';

  const total = pollData.options.reduce(function (sum, o) {
    return sum + o.votes;
  }, 0);

  const list = document.getElementById('results-list');
  list.innerHTML = '';

  pollData.options.forEach(function (opt, i) {
    const pct = total === 0 ? 0 : Math.round((opt.votes / total) * 100);
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `
      <div class="result-label">
        <span>${opt.text}</span>
        <span>${opt.votes} vote${opt.votes !== 1 ? 's' : ''} — <b>${pct}%</b></span>
      </div>
      <div class="bar-bg">
        <div class="bar-fill" style="width:${pct}%; background:${colors[i % colors.length]};"></div>
      </div>
    `;
    list.appendChild(div);
  });

  document.getElementById('total-votes').textContent = 'Total votes: ' + total;
}

// Reset everything and start fresh
function resetPoll() {
  localStorage.removeItem('pollData');
  localStorage.removeItem('hasVoted');
  pollData = null;
  hasVoted = false;

  document.getElementById('create-section').style.display = 'block';
  document.getElementById('vote-section').style.display = 'none';
  document.getElementById('results-section').style.display = 'none';
  document.getElementById('poll-question').value = '';
  document.getElementById('voted-msg').style.display = 'none';

  document.getElementById('options-list').innerHTML = `
    <div class="option-row">
      <input type="text" placeholder="Option 1" class="opt-input" />
      <button class="btn-remove" onclick="removeOption(this)">✕</button>
    </div>
    <div class="option-row">
      <input type="text" placeholder="Option 2" class="opt-input" />
      <button class="btn-remove" onclick="removeOption(this)">✕</button>
    </div>
  `;
}