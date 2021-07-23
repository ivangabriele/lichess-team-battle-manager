const $button = document.querySelector(".button");

$button.addEventListener("click", async () => {
  console.log(234);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: test,
  });
});

function test() {
  const $inboxMessageTextarea = document.querySelector(
    ".msg-app__convo__post__text"
  );

  console.log(123);
  console.log($inboxMessageTextarea);
}
