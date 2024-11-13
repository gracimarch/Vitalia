document.querySelectorAll('.question').forEach(question => {
  question.addEventListener('click', () => {
      question.classList.toggle('active');
      
      const answer = question.nextElementSibling;
      if (question.classList.contains('active')) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
      } else {
          answer.style.maxHeight = '0';
      }
  });
});