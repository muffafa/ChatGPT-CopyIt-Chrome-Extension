const allAnswers = () => [...document.querySelectorAll(".markdown.prose")];

window.addEventListener('load', () => {

    newChatLoadObserver();
    function newChatLoadObserver() {
        waitForElement('nav a, form textarea', ()=>{
            const navElements = document.querySelectorAll('nav > div a, nav a:nth-child(1)');
            navElements.forEach((navEl)=>{
                navEl.addEventListener('click', async () => {
                    await new Promise(r => setTimeout(r, 250));
                    waitForElement('.text-base, main h1', ()=> {
                        if (document.querySelector('.text-base')) {
                            console.log('existing chat loaded');
                            newChatLoaded();
                        } else if (document.querySelector('main h1')) {
                            console.log('new chat opened');
                            newChatLoaded();
                        }
                        newChatLoadObserver();
                    });
                });
            });
        });
    }

    setInterval(()=>{
        newChatLoaded();
    }, 1000);

    function newChatLoaded() {
        try {
            updateActionElements();
        } catch (error) {
            console.error('Error in updateActionElements:', error);
        }
    }

    waitForElement('main > div.overflow-hidden', (messageWrapper) => {
        (() => {
            updateActionElements();
            const observer = new MutationObserver(() => {
                updateActionElements();
            });
            observer.observe(messageWrapper, { childList: true, subtree: true });
        })();
    });

    function updateActionElements() {
        const answers = allAnswers();
        answers.forEach((resultElement, i) => {
            actionUpdates(resultElement, i);
            resultElement.addEventListener("DOMSubtreeModified", () => {
              actionUpdates(resultElement, i);
            });
          });
    }

    function actionUpdates(resultElement, i) {
        actionContainer(resultElement, i);
        addCopyButtonToResult(resultElement, i);
        updateCounterForResult(resultElement, i);
    }

    function actionContainer(answer, i) {
        if (document.querySelector(`#action-buttons-${i}`)) return;  
        let actionContainer = Object.assign(document.createElement('div'), {
            id: `action-buttons-${i}`,
            className: 'gpt-copyit gptc-actions'
        })
        answer.insertAdjacentElement("afterend", actionContainer);
    }

    function updateCounterForResult(answer, index) {
        const prevCounter = document.querySelector(`#action-buttons-counter-${index}`);
        const prevCounterText = prevCounter ? prevCounter.innerText : "";

        const answerText = answer.innerText;
        const answerChars = answerText.length;
        const answerWords = answerText.split(/[ /]/).length;

        const counterElement = Object.assign(document.createElement("div"), {
            textContent: `${answerChars || 0} chars | ${answerWords || 0} words`,
            className: 'gpt-copyit gptc-msg-details'
        })
        if (prevCounterText !== counterElement.textContent) {
            if (prevCounter) prevCounter.remove();
            counterElement.id = `action-buttons-counter-${index}`;
            const actionWrapper = document.querySelector(`#action-buttons-${index}`);
            actionWrapper.appendChild(counterElement);
        }
    } 

    function addCopyButtonToResult(answer, index) {
        if (document.querySelector(`#result-copy-button-${index}`)) return; 
        const actionWrapper = document.querySelector(`#action-buttons-${index}`);

        const actionButtonWrapper = Object.assign(document.createElement('div'), {
            className: 'gpt-copyit gptc-action-buttons'
        })

        var elementText = () => answer.innerText.replace('Copy code', '');

        const copyButton = Object.assign(document.createElement('button'), {
            id: `result-copy-button-${index}`,
            className: 'gpt-copyit gptc-button',
            textContent: 'Copy',
            onclick: (e) => {
                navigator.clipboard.writeText(elementText());
                copyButton.textContent = "Copied!";
                copyButton.style.backgroundColor = '#00FF00';
                setTimeout(() => {
                    copyButton.textContent = "Copy";
                    copyButton.style.backgroundColor = '#343441';
                }, 1500);
            }
        });
        actionButtonWrapper.appendChild(copyButton);

        actionWrapper.appendChild(actionButtonWrapper);
    }
});

function waitForElement(selector, callback, maxWaitTime = 5000, speed = 100, notFoundCallback = null) {
    const endTime = Date.now() + maxWaitTime;
    const interval = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
            clearInterval(interval);
            callback(element);
        }
        if (Date.now() >= endTime) {
            clearInterval(interval);
            if (notFoundCallback) {
                notFoundCallback();
            }
        }
    }, speed);
}