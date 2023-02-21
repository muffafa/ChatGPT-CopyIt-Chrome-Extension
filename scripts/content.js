// >> welcome message
console.log("%c This page is modified by ChatGPT copyit.", "font-size: 16px;");

// get all answers
const allAnswers = () => [...document.querySelectorAll(".markdown.prose")]; //' get all answers //!

// >> starts when page loaded
window.addEventListener('load', () => {

    /// fixed selectors
    const messageScrollSection = 'main > .overflow-hidden > div > div';

    //>> set action buttons after nav click
    // functions set's a click listener on the nav. when it occurs it waits until the messages loaded,
    newChatLoadObserver();
    function newChatLoadObserver() {
        waitForElement('nav a, form textarea', ()=>{
            const navElements = document.querySelectorAll('nav > div a, nav a:nth-child(1)');
            navElements.forEach((navEl)=>{
                navEl.addEventListener('click', async () => { // nav clicked
                    await new Promise(r => setTimeout(r, 250));
                    waitForElement('.text-base, main h1', ()=> {
                        if (document.querySelector('.text-base')) { // chat loaded
                            console.log('existing chat loaded');
                            newChatLoaded();
                        } else if (document.querySelector('main h1')) { // new chat loaded
                            console.log('new chat opened');
                            newChatLoaded();
                        }
                        newChatLoadObserver();
                    });
                });
            });
        }, 5000, 100, () => {
        });
    }
    // todo : temp : after several crashes when chat loads
    setInterval(()=>{
        newChatLoaded();
    }, 1000);
    // code that runs when a new chat gets loaded
    function newChatLoaded() {
        
        waitForElement('main > :nth-child(2) form > :nth-child(1) > :nth-child(2)', (textBox)=>{
            textBox.click();
        });
    
        try { // update message action elements
            updateActionElements();
        } catch (error) {
            console.error('Error in updateActionElements:', error);
        }

    } // newChatLoaded();

    // improve of message area
    waitForElement('main > div.overflow-hidden', (messageWrapper) => {
        //>> message send monitoring
        (() => {
            updateActionElements();
            const observer = new MutationObserver(() => {
                updateActionElements();
            });
            observer.observe(messageWrapper, { childList: true, subtree: true });
            // >> always start from bottom message
            const scrollingSection = messageWrapper.firstChild;
            scrollingSection.scrollTop = scrollingSection.scrollHeight;
        })();
    });
    function updateActionElements() {
        const answers = allAnswers(); // get all answers
        for (let i = 0; i < answers.length; i += 1) { // apply changes to all the answers
            const resultElement = answers[i];
            actionUpdates(resultElement, i);
            resultElement.addEventListener("DOMSubtreeModified", () => { // update counter when content changes
                actionUpdates(resultElement, i);
            });
        }
    }
    function actionUpdates(resultElement, i) {
        actionContainer(resultElement, i);
        addCopyButtonToResult(resultElement, i);
        updateCounterForResult(resultElement, i);
    }
    // adds action buttons container
    function actionContainer(answer, i) {
        if (document.querySelector(`#action-buttons-${i}`)) return;  // don't pass if there is already an element with this index
        let actionContainer = Object.assign(document.createElement('div'), { // create a action button if there isn't one
            id: `action-buttons-${i}`,
            className: 'gpt-copyit gptc-actions'
        })
        answer.insertAdjacentElement("afterend", actionContainer);
    }

    // create and update the counter for a specific index
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
            if (prevCounter) prevCounter.remove(); // if there's already a prev counter remove it
            counterElement.id = `action-buttons-counter-${index}`;
            const actionWrapper = document.querySelector(`#action-buttons-${index}`);
            actionWrapper.appendChild(counterElement);
        }
    } // todo : may be more efficient to just replace the inner instead of creating a new element

    // add copy button to answer if it doesn't already has one
    function addCopyButtonToResult(answer, index) {
        if (document.querySelector(`#result-copy-button-${index}`)) return; // stop if answer already has copy button
        const actionWrapper = document.querySelector(`#action-buttons-${index}`); // get action wrapper

        const actionButtonWrapper = Object.assign(document.createElement('div'), {
            className: 'gpt-copyit gptc-action-buttons'
        })

        // get element things
        var elementText = () => answer.innerText.replace('Copy code', '');
        var elementHTML = () => answer.innerHTML;

        // create copy button
        const copyButton = Object.assign(document.createElement('button'), {
            id: `result-copy-button-${index}`,
            className: 'gpt-copyit gptc-button',
            textContent: 'Copy',
            onclick: (e) => {
                if (e.shiftKey) { // todo : add feature more visible
                    copyRichText(answer);
                } else {
                    navigator.clipboard.writeText(elementText());
                }
                copyButton.textContent = "Copied!";
                setTimeout(() => {
                    copyButton.textContent = "Copy";
                }, 1500);
            }
        });
        actionButtonWrapper.appendChild(copyButton);

        actionWrapper.appendChild(actionButtonWrapper);
    }
});

/// general
// >> copy rich text of element
const copyRichText = async (element) => {
    const content = element.innerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const richTextInput = new ClipboardItem({ 'text/html': blob });
    await navigator.clipboard.write([richTextInput]);
};

// >> wait for an element to appear and then run a callback function
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