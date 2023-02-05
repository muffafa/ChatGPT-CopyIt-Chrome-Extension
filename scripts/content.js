const targetNode = document.body;

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            const elements = [...document.querySelectorAll(".text-base")];
            const filteredElements = [];
            for (let i = 0; i < elements.length; i++) {
                if (i % 2 !== 0) {
                    filteredElements.push(elements[i]);
                }
            }
            filteredElements.forEach((filteredElement) => {
                const childPElements = filteredElement.getElementsByTagName("p");
                for (let i = 0; i < childPElements.length; i++) {
                    if (!childPElements[i].querySelector("button")) {
                        const copyButton = document.createElement("button");
                        copyButton.textContent = "+";
                        copyButton.style.backgroundColor = "lightgray";
                        copyButton.style.color = "white";
                        copyButton.style.padding = "5px 10px";
                        copyButton.style.marginLeft = "8px";
                        copyButton.style.borderRadius = "5px";
                        copyButton.style.cursor = "pointer";
                        copyButton.addEventListener("click", () => {
                            navigator.clipboard.writeText(childPElements[i].textContent);
                        });
                        childPElements[i].appendChild(copyButton);
                        
                    }
                }
            });
        }
    });
});

const observerConfig = { childList: true, subtree: true };
observer.observe(targetNode, observerConfig);
