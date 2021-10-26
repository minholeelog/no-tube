const videoContainer = document.getElementById('videoContainer');
const form = document.getElementById('commentForm');

const addComment = (text, id) => {
  const videoComments = document.querySelector('.video__comments ul');
  const newComment = document.createElement('li');
  newComment.dataset.id = id;
  newComment.className = 'video__comment';
  const icon = document.createElement('i');
  icon.className = 'fas fa-comment';
  const span = document.createElement('span');
  span.innerText = ` ${text}`;
  const delBtn = document.createElement('span');
  delBtn.innerText = '❌';
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(delBtn);
  videoComments.prepend(newComment);
};

// TODO: Delete comment

const handleSubmit = async (e) => {
  e.preventDefault();
  const textarea = form.querySelector('textarea');
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === '') {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = '';
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};

if (form) {
  form.addEventListener('submit', handleSubmit);
}
