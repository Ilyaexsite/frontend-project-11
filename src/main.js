import './styles/main.css';

document.addEventListener('DOMContentLoaded', function() {
  const rssForm = document.getElementById('rss-form')
  const rssUrlInput = document.getElementById('rss-url')

  if (rssForm) {
    rssForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const formData = new FormData(rssForm)
      const rssUrl = formData.get('rss-url').trim()
      
      if (validateUrl(rssUrl)) {
        addRssFeed(rssUrl)
      } else {
        showMessage('Ссылка должна быть валидным URL', 'error')
      }
    })
  }

  function validateUrl(url) {
    try {
      new URL(url);
      return url.startsWith('http')
    } catch {
      return false
    }
  }

  function addRssFeed(url) {
    return new Promise(function(resolve) {
      const submitBtn = rssForm.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent
      submitBtn.textContent = 'Добавление...'
      submitBtn.disabled = true


      setTimeout(function() {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        showMessage('RSS успешно добавлен', 'success')
        rssForm.reset()
        
        resolve(url)
      }, 1500)
    })
  }

  function showMessage(message, type) {
    const existingAlert = document.querySelector('.alert')
    if (existingAlert) {
      existingAlert.remove()
    }

    const alertClass = type === 'error' ? 'alert-danger' : 'alert-success'
    const alertHtml = `
      <div class="alert ${alertClass} alert-dismissible fade show mt-4" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `
    const cardBody = document.querySelector('.card-body')
    if (cardBody) {
      cardBody.insertAdjacentHTML('beforeend', alertHtml)
      
      setTimeout(function() {
        const alert = document.querySelector('.alert')
        if (alert) {
          alert.remove()
        }
      }, 5000)
    }
  }

  if (rssUrlInput) {
    setTimeout(function() {
      rssUrlInput.focus()
    }, 100)
  }
})
