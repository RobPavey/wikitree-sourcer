/*
MIT License

Copyright (c) 2022 Robert M Pavey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

function createDraggableListElement(document) {
  let listElement = document.createElement("ul");
  let isDragging = false;
  let activeItem = null;
  let scrollInterval = null;

  function startDrag(e) {
    const listItem = e.target.closest(".draggableListItem");
    if (!listItem || listItem.parentElement !== listElement) return;

    // Prevent default scrolling/selection behavior immediately on touch/click
    e.preventDefault();

    activeItem = listItem;
    isDragging = true;

    activeItem.classList.add("beingDragged");

    if (e.pointerId) {
      try {
        activeItem.setPointerCapture(e.pointerId);
      } catch (err) {}
    }

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
  }

  function onMove(e) {
    if (!isDragging || !activeItem) return;
    e.preventDefault();

    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (!clientY) return;

    const afterElement = getDragAfterElement(listElement, clientY);
    if (afterElement == null) {
      listElement.appendChild(activeItem);
    } else {
      listElement.insertBefore(activeItem, afterElement);
    }

    handleAutoScroll(clientY);
  }

  function handleAutoScroll(clientY) {
    const rect = listElement.getBoundingClientRect();
    const threshold = 40;

    clearInterval(scrollInterval);

    if (clientY < rect.top + threshold) {
      scrollInterval = setInterval(() => {
        listElement.scrollTop -= 12;
      }, 16);
    } else if (clientY > rect.bottom - threshold) {
      scrollInterval = setInterval(() => {
        listElement.scrollTop += 12;
      }, 16);
    }
  }

  function endDrag(e) {
    if (!isDragging || !activeItem) return;

    clearInterval(scrollInterval);

    if (e && e.pointerId) {
      try {
        activeItem.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }

    activeItem.classList.remove("beingDragged");

    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);

    const event = new Event("change", { bubbles: true });
    listElement.dispatchEvent(event);

    isDragging = false;
    activeItem = null;
  }

  const getDragAfterElement = (container, y) => {
    const draggableElements = [...container.querySelectorAll("li.draggableListItem:not(.beingDragged)")];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return {
            offset: offset,
            element: child,
          };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
      }
    ).element;
  };

  listElement.addEventListener("pointerdown", startDrag);

  return listElement;
}

export { createDraggableListElement };
