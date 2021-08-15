function test() {
  // eslint-disable-next-line no-unused-vars
  const $inboxMessageTextarea = document.querySelector('.msg-app__convo__post__text')

  // console.log(123)
  // console.log($inboxMessageTextarea)
}

const $button = document.querySelector('.button')

$button.addEventListener('click', async () => {
  // console.log(234)
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  chrome.scripting.executeScript({
    function: test,
    target: { tabId: tab.id },
  })
})
